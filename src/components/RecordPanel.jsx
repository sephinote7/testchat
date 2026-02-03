import { useState, useRef, useCallback } from 'react';
import './RecordPanel.css';

/**
 * 화상 통화 중 상대 영상(원격 스트림)을 로컬에 녹화 저장하고,
 * 선택 시 testchatpy API로 음성 요약 요청
 */
export default function RecordPanel({ remoteStream, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [lastBlob, setLastBlob] = useState(null);
  const [summaryApiUrl, setSummaryApiUrl] = useState(
    () => import.meta.env.VITE_SUMMARY_API_URL || '',
  );
  const [summaryResult, setSummaryResult] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const canRecord = Boolean(remoteStream && !disabled);

  const startRecording = useCallback(() => {
    if (!remoteStream || isRecording) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(remoteStream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm',
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
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
  }, [remoteStream, isRecording]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
    setIsRecording(false);
  }, []);

  const downloadRecording = useCallback(() => {
    if (!lastBlob) return;
    const url = URL.createObjectURL(lastBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lastBlob]);

  const sendForSummary = useCallback(async () => {
    if (!lastBlob || !summaryApiUrl.trim()) return;
    const base = summaryApiUrl.replace(/\/$/, '');
    const url = `${base}/api/summarize`;
    setSummaryLoading(true);
    setSummaryResult(null);
    try {
      const formData = new FormData();
      formData.append('audio', lastBlob, 'recording.webm');
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || res.statusText);
      }
      const data = await res.json();
      setSummaryResult(data);
    } catch (err) {
      setSummaryResult({
        transcript: null,
        summary: `요약 실패: ${err.message}`,
      });
    } finally {
      setSummaryLoading(false);
    }
  }, [lastBlob, summaryApiUrl]);

  const clearLast = useCallback(() => {
    setLastBlob(null);
    setSummaryResult(null);
  }, []);

  return (
    <section className="record-panel">
      <h3>녹화 / 요약</h3>
      <p className="record-hint">
        상대 영상·음성을 로컬에 저장합니다. (사용자 컴퓨터에만 저장)
      </p>
      <div className="record-actions">
        <button
          type="button"
          onClick={startRecording}
          disabled={!canRecord || isRecording}
          className="record-btn record-btn--start"
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
              로컬에 저장 (다운로드)
            </button>
            <div className="record-summary-row">
              <input
                type="url"
                placeholder="요약 API 주소 (예: https://testchatpy.onrender.com)"
                value={summaryApiUrl}
                onChange={(e) => setSummaryApiUrl(e.target.value)}
                className="record-api-input"
              />
              <button
                type="button"
                onClick={sendForSummary}
                disabled={summaryLoading || !summaryApiUrl.trim()}
              >
                {summaryLoading ? '요약 중…' : 'STT + OpenAI 요약'}
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
          {summaryResult.transcript != null && (
            <div>
              <strong>STT 결과:</strong>
              <pre className="record-transcript">
                {summaryResult.transcript}
              </pre>
            </div>
          )}
          <div>
            <strong>요약:</strong>
            <p className="record-summary-text">{summaryResult.summary}</p>
          </div>
        </div>
      )}
    </section>
  );
}
