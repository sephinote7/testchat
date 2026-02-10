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
 * [최종 수정본]
 * - 고화질: 로컬 저장용 (Canvas 합성 영상 + 합성 음성)
 * - 저용량: AI 요약용 (합성 음성 전용)
 */
const RecordPanel = forwardRef(function RecordPanel(
  { localStream, remoteStream, disabled, autoStart = false },
  ref,
) {
  const [isRecording, setIsRecording] = useState(false);
  const [lastBlob, setLastBlob] = useState(null);
  const [lastAudioBlob, setLastAudioBlob] = useState(null);
  const [summaryApiUrl, setSummaryApiUrl] = useState(
    () => import.meta.env.VITE_SUMMARY_API_URL || '',
  );
  const [summaryResult, setSummaryResult] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // 레코더 및 데이터 참조
  const mediaRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioChunksRef = useRef([]);
  const requestRef = useRef(null);
  const audioContextRef = useRef(null);

  const canRecord = Boolean(localStream && remoteStream && !disabled);

  // 녹화 중지 함수 (위치 이동: startRecording에서 참조하기 위함)
  const stopRecording = useCallback(() => {
    console.log('녹화 중지 시도...');
    setIsRecording(false);

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
    if (
      audioRecorderRef.current &&
      audioRecorderRef.current.state !== 'inactive'
    ) {
      audioRecorderRef.current.stop();
    }

    // 애니메이션 프레임 중단
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, []);

  // 녹화 시작 함수
  const startRecording = useCallback(async () => {
    if (!localStream || !remoteStream || isRecording) return;

    try {
      console.log('녹화 프로세스 시작...');
      chunksRef.current = [];
      audioChunksRef.current = [];

      // 1. AudioContext 생성
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      if (audioContext.state === 'suspended') await audioContext.resume();
      audioContextRef.current = audioContext;

      // 2. 중간 다리(GainNode)와 목적지(Destination) 생성
      // GainNode는 입력이 없어도 출력을 형성하므로 IndexSizeError를 방지합니다.
      const mixer = audioContext.createGain();
      const dest = audioContext.createMediaStreamDestination();
      mixer.connect(dest);

      // 3. 분석기(Analyzer)를 mixer에 연결 (이제 매우 안전함)
      const analyzer = audioContext.createAnalyser();
      mixer.connect(analyzer);

      // 4. 실제 오디오 소스들을 mixer에 연결
      let hasAudio = false;
      [localStream, remoteStream].forEach((stream, index) => {
        const tracks = stream.getAudioTracks();
        if (tracks.length > 0 && tracks[0].readyState === 'live') {
          try {
            const source = audioContext.createMediaStreamSource(
              new MediaStream([tracks[0]]),
            );
            source.connect(mixer); // dest 대신 mixer에 연결
            hasAudio = true;
            console.log(`${index === 0 ? '내' : '상대'} 마이크 노드 연결 성공`);
          } catch (e) {
            console.warn(
              `${index === 0 ? '내' : '상대'} 오디오 노드 생성 실패:`,
              e,
            );
          }
        }
      });

      // 5. 볼륨 체크 로직 (기존과 동일)
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      const checkVolume = () => {
        if (!audioContext || audioContext.state === 'closed') return;
        analyzer.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
        if (volume > 0 && Math.random() > 0.98) {
          console.log('🎤 오디오 신호 레벨:', volume.toFixed(2));
        }
        requestRef.current = requestAnimationFrame(checkVolume);
      };
      checkVolume();

      // 6. 비디오 합성 및 Canvas 설정 (기존과 동일)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1280;
      canvas.height = 480;
      const localVideo = document.createElement('video');
      const remoteVideo = document.createElement('video');
      localVideo.srcObject = localStream;
      remoteVideo.srcObject = remoteStream;
      localVideo.muted = true;
      await Promise.all([localVideo.play(), remoteVideo.play()]);

      const draw = () => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(localVideo, 0, 0, 640, 480);
        ctx.drawImage(remoteVideo, 640, 0, 640, 480);
        requestRef.current = requestAnimationFrame(draw);
      };
      draw();

      // 7. 최종 레코더 설정
      const canvasStream = canvas.captureStream(30);
      // 비디오 트랙 + 믹서에서 나온 오디오 트랙 합치기
      const finalStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      const recorder = new MediaRecorder(finalStream, {
        mimeType: 'video/webm',
      });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        if (chunksRef.current.length > 0)
          setLastBlob(new Blob(chunksRef.current, { type: 'video/webm' }));
      };

      if (hasAudio) {
        const audioRecorder = new MediaRecorder(dest.stream, {
          mimeType: 'audio/webm',
        });
        audioRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        audioRecorder.onstop = () => {
          if (audioChunksRef.current.length > 0)
            setLastAudioBlob(
              new Blob(audioChunksRef.current, { type: 'audio/webm' }),
            );
        };
        audioRecorder.start(1000);
        audioRecorderRef.current = audioRecorder;
      }

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error('녹화 시작 치명적 오류:', err);
    }
  }, [localStream, remoteStream, isRecording]);

  // 나머지 기능들 (다운로드, 요약 전송 등)
  const downloadRecording = useCallback(() => {
    if (!lastBlob) return;
    const url = URL.createObjectURL(lastBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `상담녹화_${new Date().toLocaleString()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lastBlob]);

  const sendForSummary = useCallback(async () => {
    const blobToSend = lastAudioBlob || lastBlob;
    if (!blobToSend || !summaryApiUrl.trim()) return;

    setSummaryLoading(true);
    try {
      const formData = new FormData();
      formData.append(
        'audio',
        blobToSend,
        lastAudioBlob ? 'audio.webm' : 'video.webm',
      );

      const res = await fetch(
        `${summaryApiUrl.replace(/\/$/, '')}/api/summarize`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!res.ok) throw new Error('서버 응답 오류');
      const data = await res.json();
      setSummaryResult(data);
    } catch (err) {
      setSummaryResult({ summary: `요약 실패: ${err.message}` });
    } finally {
      setSummaryLoading(false);
    }
  }, [lastBlob, lastAudioBlob, summaryApiUrl]);

  const clearLast = () => {
    setLastBlob(null);
    setLastAudioBlob(null);
    setSummaryResult(null);
  };

  // 외부(App.js)에서 제어하기 위한 ref 노출
  useImperativeHandle(ref, () => ({
    stopRecordingAndGetBlob: async () => {
      stopRecording();
      // 중지 후 Blob이 생성될 때까지 약간의 대기 시간을 가짐
      return new Promise((resolve) => {
        setTimeout(() => resolve(lastAudioBlob || lastBlob), 500);
      });
    },
  }));

  return (
    <section className="record-panel">
      <h3>화면 합성 녹화 / 요약</h3>
      <p className="record-hint">
        내 화면과 상대 화면을 합쳐 녹화하며, 요약은 저용량 음성으로 전송됩니다.
      </p>

      <div className="record-actions">
        <button
          type="button"
          onClick={startRecording}
          disabled={!canRecord || isRecording}
          className={`record-btn ${isRecording ? 'recording' : 'record-btn--start'}`}
        >
          {isRecording ? '🔴 녹화 중...' : '🎥 녹화 시작'}
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

      {(lastBlob || lastAudioBlob) && (
        <div className="record-result fade-in">
          <div className="record-info">
            <span>✅ 녹화 완료: </span>
            {lastBlob && (
              <small>
                고화질 영상 ({(lastBlob.size / 1024 / 1024).toFixed(1)}MB)
              </small>
            )}
            {lastAudioBlob && (
              <small>
                {' '}
                / 요약용 음성 ({(lastAudioBlob.size / 1024).toFixed(1)}KB)
              </small>
            )}
          </div>

          <div className="record-result-actions">
            <button
              type="button"
              onClick={downloadRecording}
              className="btn-download"
            >
              PC에 고화질 저장
            </button>
            <div className="summary-input-group">
              <input
                type="url"
                value={summaryApiUrl}
                onChange={(e) => setSummaryApiUrl(e.target.value)}
                placeholder="https://your-api.render.com"
              />
              <button
                type="button"
                onClick={sendForSummary}
                disabled={summaryLoading}
              >
                {summaryLoading ? 'AI 분석 중...' : 'AI 요약 받기'}
              </button>
            </div>
          </div>
          <button type="button" className="record-clear" onClick={clearLast}>
            새로고침
          </button>
        </div>
      )}

      {summaryResult && (
        <div className="summary-display">
          <h4>✨ AI 대화 요약 결과</h4>
          <p>{summaryResult.summary}</p>
        </div>
      )}
    </section>
  );
});

export default RecordPanel;
