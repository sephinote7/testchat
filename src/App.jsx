import { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import "./App.css";

/**
 * PeerJS 기반 화상 채팅 (클라이언트 전용 테스트용)
 *
 * 동작 방식:
 * 1. "미디어 시작"으로 카메라/마이크 스트림 획득
 * 2. Peer 서버 연결 후 내 Peer ID가 표시됨
 * 3. 다른 탭에서 동일 페이지를 열고 각각의 Peer ID를 복사해 서로 입력 후 "통화 걸기"
 * 4. 수신 측은 "통화 받기" 없이 자동 응답 (call 이벤트에서 answer)
 */
function App() {
  const [myId, setMyId] = useState("");
  const [remoteIdInput, setRemoteIdInput] = useState("");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | error
  const [errorMessage, setErrorMessage] = useState("");

  const peerRef = useRef(null);
  const currentCallRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // 미디어 스트림 획득 (getUserMedia)
  const startMedia = async () => {
    setErrorMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setStatus("idle");
    } catch (err) {
      setErrorMessage("카메라/마이크 접근 실패: " + (err.message || err.name));
      setStatus("error");
    }
  };

  // Peer 초기화 및 미디어 시작 시에만 연결
  useEffect(() => {
    if (!localStream) return;

    const peer = new Peer({
      debug: 2,
      config: {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      },
    });

    peer.on("open", (id) => {
      setMyId(id);
      setStatus("idle");
    });

    peer.on("call", (call) => {
      // 수신: 상대 스트림을 받아서 remoteStream으로 설정
      call.answer(localStream);
      currentCallRef.current = call;
      call.on("stream", (stream) => {
        setRemoteStream(stream);
        setStatus("connected");
      });
      call.on("close", () => {
        setRemoteStream(null);
        setStatus("idle");
        currentCallRef.current = null;
      });
      call.on("error", (err) => {
        setErrorMessage("수신 통화 오류: " + (err?.message || err));
        setStatus("error");
      });
    });

    peer.on("error", (err) => {
      setErrorMessage("Peer 오류: " + (err?.message || err.type || err));
      setStatus("error");
    });

    peer.on("disconnected", () => setStatus("idle"));

    peerRef.current = peer;

    return () => {
      if (currentCallRef.current) {
        currentCallRef.current.close();
        currentCallRef.current = null;
      }
      peer.destroy();
      peerRef.current = null;
    };
  }, [localStream]);

  // 통화 걸기
  const startCall = () => {
    const peer = peerRef.current;
    const remoteId = remoteIdInput.trim();
    if (!peer || !remoteId || !localStream) {
      setErrorMessage("Peer ID를 입력하고 미디어를 먼저 시작하세요.");
      return;
    }
    setErrorMessage("");
    setStatus("connecting");
    try {
      const call = peer.call(remoteId, localStream);
      currentCallRef.current = call;
      call.on("stream", (stream) => {
        setRemoteStream(stream);
        setStatus("connected");
      });
      call.on("close", () => {
        setRemoteStream(null);
        setStatus("idle");
        currentCallRef.current = null;
      });
      call.on("error", (err) => {
        setErrorMessage("통화 오류: " + (err?.message || err));
        setStatus("error");
      });
    } catch (err) {
      setErrorMessage("통화 실패: " + (err?.message || err));
      setStatus("error");
    }
  };

  // 통화 종료
  const endCall = () => {
    if (currentCallRef.current) {
      currentCallRef.current.close();
      currentCallRef.current = null;
    }
    setRemoteStream(null);
    setStatus("idle");
  };

  // 비디오 엘리먼트에 스트림 바인딩
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // 언마운트 시 로컬 스트림 트랙 정리
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream]);

  return (
    <div className="app">
      <h1>PeerJS 화상 채팅 (테스트)</h1>

      <section className="controls">
        <div className="control-row">
          <button onClick={startMedia} disabled={!!localStream}>
            {localStream ? "미디어 사용 중" : "미디어 시작"}
          </button>
          {localStream && (
            <>
              <span className="my-id">
                내 Peer ID: <code>{myId || "연결 중..."}</code>
              </span>
              <button
                className="copy-btn"
                onClick={() => myId && navigator.clipboard.writeText(myId)}
                title="ID 복사"
              >
                복사
              </button>
            </>
          )}
        </div>

        <div className="control-row call-row">
          <input
            type="text"
            placeholder="상대 Peer ID 입력"
            value={remoteIdInput}
            onChange={(e) => setRemoteIdInput(e.target.value)}
            disabled={!localStream}
          />
          <button
            onClick={startCall}
            disabled={!localStream || !remoteIdInput.trim()}
          >
            통화 걸기
          </button>
          <button onClick={endCall} disabled={!remoteStream}>
            통화 종료
          </button>
        </div>

        {status && (
          <p className="status">
            상태: <strong>{status}</strong>
            {status === "connecting" && " (상대가 수락할 때까지 대기)"}
          </p>
        )}
        {errorMessage && <p className="error">{errorMessage}</p>}
      </section>

      <section className="videos">
        <div className="video-box">
          <p>나 (로컬)</p>
          {localStream ? (
            <video ref={localVideoRef} autoPlay muted playsInline />
          ) : (
            <div className="video-placeholder">미디어 시작 후 표시</div>
          )}
        </div>
        <div className="video-box">
          <p>상대 (원격)</p>
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline />
          ) : (
            <div className="video-placeholder">통화 연결 후 표시</div>
          )}
        </div>
      </section>

      <p className="hint">
        테스트: 이 페이지를 두 개의 브라우저 탭(또는 시크릿 창)에서 열고, 각
        탭에서 &quot;미디어 시작&quot; 후 한 탭의 Peer ID를 다른 탭에 입력해
        &quot;통화 걸기&quot;하세요.
      </p>
    </div>
  );
}

export default App;
