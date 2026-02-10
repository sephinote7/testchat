import {
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from 'react';
import './RecordPanel.css';

/**
 * 내 영상(localStream)과 상대 영상(remoteStream)을 합성하여 녹화합니다.
 */
const RecordPanel = forwardRef(function RecordPanel(
  { localStream, remoteStream, disabled, autoStart = false },
  ref,
) {
  const [isRecording, setIsRecording] = useState(false);
  const [lastBlob, setLastBlob] = useState(null);
  const [summaryApiUrl, setSummaryApiUrl] = useState(
    () => import.meta.env.VITE_SUMMARY_API_URL || '',
  );
  const [summaryResult, setSummaryResult] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const requestRef = useRef(); // Canvas 애니메이션 프레임 참조

  // 1. 녹화 시작 함수 (Canvas 합성 포함)
  const startRecording = useCallback(() => {
    if (!localStream || !remoteStream || isRecording) return;
    chunksRef.current = [];

    // --- Canvas 합성 설정 ---
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1280; // 640(좌) + 640(우)
    canvas.height = 480;

    // 비디오 엘리먼트 생성 (캔버스 드로잉용)
    const localVideo = document.createElement('video');
    const remoteVideo = document.createElement('video');
    localVideo.srcObject = localStream;
    remoteVideo.srcObject = remoteStream;
    localVideo.muted = true; // 피드백 루프 방지
    localVideo.play();
    remoteVideo.play();

    const draw = () => {
      // 배경을 검은색으로 채움
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 내 화면 그리기 (좌측)
      ctx.drawImage(localVideo, 0, 0, 640, 480);
      // 상대 화면 그리기 (우측)
      ctx.drawImage(remoteVideo, 640, 0, 640, 480);

      requestRef.current = requestAnimationFrame(draw);
    };
    draw();

    // 2. 캔버스에서 비디오 스트림 추출
    const canvasStream = canvas.captureStream(30); // 30 FPS

    // 3. 오디오 합성 (내 소리 + 상대 소리)
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const dest = audioContext.createMediaStreamDestination();

    if (localStream.getAudioTracks().length > 0) {
      audioContext.createMediaStreamSource(localStream).connect(dest);
    }
    if (remoteStream.getAudioTracks().length > 0) {
      audioContext.createMediaStreamSource(remoteStream).connect(dest);
    }

    // 4. 최종 스트림 생성 (비디오+오디오)
    const finalStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ]);

    // 5. MediaRecorder 설정
    const recorder = new MediaRecorder(finalStream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm',
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      cancelAnimationFrame(requestRef.current);
      audioContext.close();
      if (chunksRef.current.length) {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setLastBlob(blob);
      }
      mediaRecorderRef.current = null;
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setSummaryResult(null);
  }, [localStream, remoteStream, isRecording]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
    setIsRecording(false);
  }, []);

  // --- 기존의 유틸리티 함수들 (다운로드, 요약 등) ---
  const sendForSummary = useCallback(async () => {
    if (!lastBlob || !summaryApiUrl.trim()) return;

    const base = summaryApiUrl.replace(/\/$/, '');
    const url = `${base}/api/summarize`;

    setSummaryLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', lastBlob, 'recording.webm');

      // 중요: 채팅 메시지 로그를 JSON 문자열로 추가 전송 (useChatStore 등에서 가져옴)
      // const messages = getMessages(); // 메시지 가져오는 로직 필요
      // formData.append('msg_data', JSON.stringify(messages));

      const res = await fetch(url, {
        method: 'POST',
        body: formData, // JSON이 아니라 FormData를 보냄
      });

      if (!res.ok) throw new Error('서버 응답 오류');
      const data = await res.json();
      setSummaryResult(data);
    } catch (err) {
      setSummaryResult({ summary: `요약 실패: ${err.message}` });
    } finally {
      setSummaryLoading(false);
    }
  }, [lastBlob, summaryApiUrl]);

  const stopRecordingAndGetBlob = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      return new Promise((resolve) => {
        const onStop = () => {
          recorder.removeEventListener('stop', onStop);
          resolve(
            chunksRef.current.length
              ? new Blob(chunksRef.current, { type: 'video/webm' })
              : null,
          );
        };
        recorder.addEventListener('stop', onStop);
        recorder.stop();
        setIsRecording(false);
      });
    }
    return Promise.resolve(lastBlob);
  }, [lastBlob]);

  useImperativeHandle(ref, () => ({ stopRecordingAndGetBlob }), [
    stopRecordingAndGetBlob,
  ]);

  useEffect(() => {
    const canRecord = Boolean(localStream && remoteStream && !disabled);
    if (autoStart && canRecord && !isRecording && !lastBlob) {
      startRecording();
    }
  }, [
    autoStart,
    localStream,
    remoteStream,
    disabled,
    isRecording,
    lastBlob,
    startRecording,
  ]);

  return (
    <section className="record-panel">
      <h3>화면 합성 녹화 / 요약</h3>
      <p className="record-hint">
        내 화면(좌)과 상대 화면(우)을 합쳐서 녹화합니다.
      </p>

      <div className="record-actions">
        <button
          type="button"
          onClick={startRecording}
          disabled={!localStream || !remoteStream || isRecording}
          className={`record-btn ${isRecording ? '' : 'record-btn--start'}`}
        >
          녹화 시작
        </button>
        <button
          type="button"
          onClick={stopRecording}
          disabled={!isRecording}
          className="record-btn record-btn--stop"
        >
          녹화 중지
        </button>
      </div>

      {lastBlob && (
        <div className="record-result">
          <p className="record-size">
            녹화 완료 ({(lastBlob.size / 1024).toFixed(1)} KB)
          </p>
          <div className="record-result-actions">
            <button type="button" onClick={downloadRecording}>
              로컬 다운로드
            </button>
            <div className="record-summary-row">
              <input
                type="url"
                value={summaryApiUrl}
                onChange={(e) => setSummaryApiUrl(e.target.value)}
                className="record-api-input"
              />
              <button
                type="button"
                onClick={sendForSummary}
                disabled={summaryLoading}
              >
                {summaryLoading ? '요약 중…' : 'AI 요약 요청'}
              </button>
            </div>
          </div>
          <button type="button" className="record-clear" onClick={clearLast}>
            지우기
          </button>
        </div>
      )}

      {summaryResult && (
        <div className="record-summary-result">
          {summaryResult.summary && (
            <p className="record-summary-text">{summaryResult.summary}</p>
          )}
        </div>
      )}
    </section>
  );
});

export default RecordPanel;
