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
    if (!localStream || !remoteStream || isRecording) {
      console.warn('녹화 시작 조건 미달:', {
        localStream: !!localStream,
        remoteStream: !!remoteStream,
        isRecording,
      });
      return;
    }

    const analyzer = audioContext.createAnalyser();
    dest.connect(analyzer);
    const dataArray = new Uint8Array(analyzer.frequencyBinCount);

    const checkVolume = () => {
      if (!isRecording) return;
      analyzer.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
      if (volume > 0) {
        // 소리가 감지되면 로그 출력 (너무 많이 찍히니 가끔씩만)
        if (Math.random() > 0.95)
          console.log('실시간 음성 데이터 유입 중... 레벨:', volume);
      }
      requestAnimationFrame(checkVolume);
    };
    checkVolume();

    try {
      console.log('녹화 프로세스 시작...');
      chunksRef.current = [];
      audioChunksRef.current = [];

      // 1. Canvas 합성 설정 (비디오)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1280;
      canvas.height = 480;

      const localVideo = document.createElement('video');
      const remoteVideo = document.createElement('video');
      localVideo.srcObject = localStream;
      remoteVideo.srcObject = remoteStream;
      localVideo.muted = true;

      // 비디오 재생 보장
      await Promise.all([localVideo.play(), remoteVideo.play()]);

      const draw = () => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(localVideo, 0, 0, 640, 480);
        ctx.drawImage(remoteVideo, 640, 0, 640, 480);
        requestRef.current = requestAnimationFrame(draw);
      };
      draw();

      const canvasStream = canvas.captureStream(30);

      // 2. 오디오 트랙 존재 확인 및 합성
      let finalCombinedStream;
      let finalAudioStream = null;

      // 두 스트림의 오디오 트랙을 모두 합침
      const allAudioTracks = [
        ...localStream.getAudioTracks(),
        ...remoteStream.getAudioTracks(),
      ];

      if (allAudioTracks.length > 0) {
        // 마이크나 상대방 소리가 있을 때만 AudioContext 생성
        const audioContext = new (
          window.AudioContext || window.webkitAudioContext
        )();
        if (audioContext.state === 'suspended') await audioContext.resume();
        audioContextRef.current = audioContext;

        const dest = audioContext.createMediaStreamDestination();

        [localStream, remoteStream].forEach((stream, index) => {
          const audioTracks = stream.getAudioTracks();
          if (audioTracks.length > 0) {
            console.log(
              `${index === 0 ? '내' : '상대'} 오디오 트랙 발견:`,
              audioTracks[0].label,
            );

            // 스트림 전체가 아닌 트랙에서 소스를 생성하여 더 확실하게 연결
            const source = audioContext.createMediaStreamSource(
              new MediaStream([audioTracks[0]]),
            );

            // 소리가 너무 작을 수 있으므로 GainNode(볼륨 조절) 추가 (옵션)
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 1.0; // 1.0은 원본 크기, 필요 시 1.5로 증폭 가능

            source.connect(gainNode);
            gainNode.connect(dest);
          } else {
            console.warn(
              `${index === 0 ? '내' : '상대'} 오디오 트랙이 없습니다.`,
            );
          }
        });

        finalAudioStream = dest.stream;
        // 영상 + 합성된 음성 스트림 생성
        finalCombinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...finalAudioStream.getAudioTracks(),
        ]);
      } else {
        // 마이크가 아예 없는 경우: 영상 트랙만 사용
        console.log('감지된 오디오 트랙 없음: 영상만 녹화합니다.');
        finalCombinedStream = canvasStream;
        finalAudioStream = null;
      }

      // 3. 고화질 레코더 설정 (로컬 저장용)
      const videoMime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(finalCombinedStream, {
        mimeType: videoMime,
        videoBitsPerSecond: 2500000,
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        cancelAnimationFrame(requestRef.current); // 드로잉 중지
        console.log('영상 녹화 중지됨. 총 청크:', chunksRef.current.length);
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          setLastBlob(blob);
        }
      };

      // 4. 저용량 레코더 설정 (AI 요약용 - 오디오가 있을 때만 실행)
      let audioRecorder = null;
      if (finalAudioStream) {
        const audioMime = MediaRecorder.isTypeSupported(
          'audio/webm;codecs=opus',
        )
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';

        audioRecorder = new MediaRecorder(finalAudioStream, {
          mimeType: audioMime,
          audioBitsPerSecond: 32000,
        });

        audioRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        audioRecorder.onstop = () => {
          console.log(
            '음성 녹화 중지됨. 총 청크:',
            audioChunksRef.current.length,
          );
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: audioMime });
            setLastAudioBlob(blob);
          }
          // 오디오 컨텍스트 종료
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
        };
      }

      // 녹화 시작
      recorder.start(1000);
      if (audioRecorder) audioRecorder.start(1000);

      mediaRecorderRef.current = recorder;
      audioRecorderRef.current = audioRecorder; // 오디오가 없으면 null 저장됨
      setIsRecording(true);
      setSummaryResult(null);
    } catch (err) {
      console.error('녹화 시작 중 오류 발생:', err);
      alert('녹화를 시작할 수 없습니다. 장치 상태를 확인해주세요.');
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
