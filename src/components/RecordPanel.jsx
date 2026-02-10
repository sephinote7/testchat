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
 * - 고화질: 로컬 다운로드용 (영상+음성, 높은 비트레이트)
 * - 저용량 음성: AI 요약용 (음성만, 낮은 비트레이트로 용량 절감)
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

  const mediaRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioChunksRef = useRef([]);
  const requestRef = useRef(null);
  const audioContextRef = useRef(null);

  const canRecord = Boolean(
    localStream && remoteStream && !disabled,
  );

  const startRecording = useCallback(() => {
    if (!localStream || !remoteStream || isRecording) return;
    chunksRef.current = [];
    audioChunksRef.current = [];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 480;

    const localVideo = document.createElement('video');
    const remoteVideo = document.createElement('video');
    localVideo.srcObject = localStream;
    remoteVideo.srcObject = remoteStream;
    localVideo.muted = true;
    localVideo.play();
    remoteVideo.play();

    const draw = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(localVideo, 0, 0, 640, 480);
      ctx.drawImage(remoteVideo, 640, 0, 640, 480);
      requestRef.current = requestAnimationFrame(draw);
    };
    draw();

    const canvasStream = canvas.captureStream(30);
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;
    const dest = audioContext.createMediaStreamDestination();

    if (localStream.getAudioTracks().length > 0) {
      audioContext.createMediaStreamSource(localStream).connect(dest);
    }
    if (remoteStream.getAudioTracks().length > 0) {
      audioContext.createMediaStreamSource(remoteStream).connect(dest);
    }

    const finalStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ]);

    const audioOnlyStream = dest.stream;

    // 1) 고화질: 로컬 저장용 (영상+음성)
    const highBitrateOptions = {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm',
      videoBitsPerSecond: 2500000,
      audioBitsPerSecond: 128000,
    };
    const recorder = new MediaRecorder(finalStream, highBitrateOptions);
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      cancelAnimationFrame(requestRef.current);
      if (chunksRef.current.length) {
        setLastBlob(new Blob(chunksRef.current, { type: 'video/webm' }));
      }
      mediaRecorderRef.current = null;
    };
    recorder.start(1000);
    mediaRecorderRef.current = recorder;

    // 2) 저용량: AI 요약용 (음성만, 낮은 비트레이트)
    const audioMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';
    const audioRecorder = new MediaRecorder(audioOnlyStream, {
      mimeType: audioMime,
      audioBitsPerSecond: 32000,
    });
    audioRecorder.ondataavailable = (e) => {
      if (e.data.size) audioChunksRef.current.push(e.data);
    };
    audioRecorder.onstop = () => {
      if (audioChunksRef.current.length) {
        setLastAudioBlob(
          new Blob(audioChunksRef.current, {
            type: audioMime,
          }),
        );
      }
      audioRecorderRef.current = null;
      audioContext.close();
    };
    audioRecorder.start(1000);
    audioRecorderRef.current = audioRecorder;

    setIsRecording(true);
    setSummaryResult(null);
  }, [localStream, remoteStream, isRecording]);

  const stopRecording = useCallback(() => {
    const rec = mediaRecorderRef.current;
    const audioRec = audioRecorderRef.current;
    if (rec && rec.state !== 'inactive') rec.stop();
    if (audioRec && audioRec.state !== 'inactive') audioRec.stop();
    setIsRecording(false);
  }, []);

  const downloadRecording = useCallback(() => {
    if (!lastBlob) return;
    const url = URL.createObjectURL(lastBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `녹화_${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lastBlob]);

  const clearLast = useCallback(() => {
    setLastBlob(null);
    setLastAudioBlob(null);
    setSummaryResult(null);
  }, []);

  const sendForSummary = useCallback(async () => {
    const blobToSend = lastAudioBlob || lastBlob;
    if (!blobToSend || !String(summaryApiUrl || '').trim()) return;

    const base = summaryApiUrl.replace(/\/$/, '');
    const url = `${base}/api/summarize`;

    setSummaryLoading(true);
    try {
      const formData = new FormData();
      const ext = lastAudioBlob ? 'audio.webm' : 'recording.webm';
      formData.append('audio', blobToSend, ext);

      const res = await fetch(url, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('서버 응답 오류');
      const data = await res.json();
      setSummaryResult(data);
    } catch (err) {
      setSummaryResult({ summary: `요약 실패: ${err.message}` });
    } finally {
      setSummaryLoading(false);
    }
  }, [lastBlob, lastAudioBlob, summaryApiUrl]);

  const stopRecordingAndGetBlob = useCallback(() => {
    const rec = mediaRecorderRef.current;
    const audioRec = audioRecorderRef.current;
    if ((rec && rec.state !== 'inactive') || (audioRec && audioRec.state !== 'inactive')) {
      return new Promise((resolve) => {
        const check = () => {
          if (
            (!rec || rec.state === 'inactive') &&
            (!audioRec || audioRec.state === 'inactive')
          ) {
            const videoBlob =
              chunksRef.current.length
                ? new Blob(chunksRef.current, { type: 'video/webm' })
                : null;
            const audioBlob =
              audioChunksRef.current.length
                ? new Blob(audioChunksRef.current, { type: 'audio/webm' })
                : null;
            resolve(audioBlob || videoBlob);
          } else {
            requestAnimationFrame(check);
          }
        };
        if (rec && rec.state !== 'inactive') rec.stop();
        if (audioRec && audioRec.state !== 'inactive') audioRec.stop();
        setIsRecording(false);
        requestAnimationFrame(check);
      });
    }
    return Promise.resolve(lastAudioBlob || lastBlob);
  }, [lastBlob, lastAudioBlob]);

  useImperativeHandle(ref, () => ({ stopRecordingAndGetBlob }), [
    stopRecordingAndGetBlob,
  ]);

  useEffect(() => {
    if (autoStart && canRecord && !isRecording && !lastBlob) {
      startRecording();
    }
  }, [
    autoStart,
    canRecord,
    isRecording,
    lastBlob,
    startRecording,
  ]);

  return (
    <section className="record-panel">
      <h3>화면 합성 녹화 / 요약</h3>
      <p className="record-hint">
        내 화면(좌)과 상대 화면(우)을 합쳐 고화질로 녹화합니다. AI 요약은 저용량
        음성 파일로 전송됩니다.
      </p>

      <div className="record-actions">
        <button
          type="button"
          onClick={startRecording}
          disabled={!canRecord || isRecording}
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

      {(lastBlob || lastAudioBlob) && (
        <div className="record-result">
          <p className="record-size">
            {lastBlob && (
              <>로컬용: {(lastBlob.size / 1024).toFixed(1)} KB</>
            )}
            {lastBlob && lastAudioBlob && ' · '}
            {lastAudioBlob && (
              <>요약용 음성: {(lastAudioBlob.size / 1024).toFixed(1)} KB</>
            )}
          </p>
          <div className="record-result-actions">
            {lastBlob && (
              <button type="button" onClick={downloadRecording}>
                로컬 다운로드 (고화질)
              </button>
            )}
            <div className="record-summary-row">
              <input
                type="url"
                value={summaryApiUrl}
                onChange={(e) => setSummaryApiUrl(e.target.value)}
                placeholder="요약 API 주소"
                className="record-api-input"
              />
              <button
                type="button"
                onClick={sendForSummary}
                disabled={summaryLoading || !(lastAudioBlob || lastBlob)}
              >
                {summaryLoading ? '요약 중…' : 'AI 요약 (저용량 음성 전송)'}
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
