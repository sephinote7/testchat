import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import { useChatStore } from './store/useChatStore';
import { generateShortPeerId } from './utils/peerId';
import ChatPanel from './components/ChatPanel';
import RecordPanel from './components/RecordPanel';
import './App.css';

/**
 * PeerJS 기반 1:1 화상 채팅
 * - Peer ID: 5자리 난수 (10000~99999)
 * - 상태: Zustand, 채팅 내역: localStorage 저장
 * - 채팅: PeerJS DataConnection (peer.connect)로 텍스트 전송
 */
function App() {
  const [remoteIdInput, setRemoteIdInput] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const {
    myId,
    connectedRemoteId,
    status,
    errorMessage,
    setMyId,
    setStatus,
    setErrorMessage,
    setConnectedRemoteId,
    addMessage,
    resetCallState,
  } = useChatStore();

  const peerRef = useRef(null);
  const currentCallRef = useRef(null);
  const dataConnRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const isConnected = status === 'connected';

  // DataConnection으로 메시지 전송 (채팅 패널에서 호출)
  const sendChatMessage = useCallback(
    (text) => {
      const conn = dataConnRef.current;
      if (!conn || conn.open !== true) return;
      const time = Date.now();
      conn.send(JSON.stringify({ text, time }));
      addMessage({ from: 'me', text, time });
    },
    [addMessage],
  );

  // DataConnection 수신 처리 공통
  const wireDataConnection = useCallback(
    (conn) => {
      conn.on('data', (data) => {
        try {
          const obj = typeof data === 'string' ? JSON.parse(data) : data;
          if (obj && typeof obj.text === 'string') {
            addMessage({
              from: 'remote',
              text: obj.text,
              time: obj.time || Date.now(),
            });
          }
        } catch (e) {
          console.warn('Invalid chat data', e);
        }
      });
      conn.on('close', () => {
        if (dataConnRef.current === conn) dataConnRef.current = null;
      });
      conn.on('error', (err) => {
        console.warn('DataConnection error', err);
      });
    },
    [addMessage],
  );

  const startMedia = async () => {
    setErrorMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setStatus('idle');
    } catch (err) {
      setErrorMessage('카메라/마이크 접근 실패: ' + (err.message || err.name));
      setStatus('error');
    }
  };

  useEffect(() => {
    if (!localStream) return;

    const peerId = generateShortPeerId();
    const peer = new Peer(peerId, {
      debug: 1,
      config: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      },
    });

    peer.on('open', (id) => {
      setMyId(id);
      setStatus('idle');
    });

    peer.on('call', (call) => {
      call.answer(localStream);
      currentCallRef.current = call;
      call.on('stream', (stream) => {
        setRemoteStream(stream);
        setStatus('connected');
        setConnectedRemoteId(call.peer);
      });
      call.on('close', () => {
        if (dataConnRef.current) {
          dataConnRef.current.close();
          dataConnRef.current = null;
        }
        setRemoteStream(null);
        resetCallState();
        currentCallRef.current = null;
      });
      call.on('error', (err) => {
        setErrorMessage('수신 통화 오류: ' + (err?.message || err));
        setStatus('error');
      });
    });

    // 상대(발신자)가 peer.connect()로 열어준 데이터 연결 수락
    peer.on('connection', (conn) => {
      dataConnRef.current = conn;
      conn.on('open', () => wireDataConnection(conn));
    });

    peer.on('error', (err) => {
      setErrorMessage('Peer 오류: ' + (err?.message || err.type || err));
      setStatus('error');
    });

    peer.on('disconnected', () => setStatus('idle'));

    peerRef.current = peer;

    return () => {
      if (dataConnRef.current) {
        dataConnRef.current.close();
        dataConnRef.current = null;
      }
      if (currentCallRef.current) {
        currentCallRef.current.close();
        currentCallRef.current = null;
      }
      peer.destroy();
      peerRef.current = null;
    };
  }, [
    localStream,
    setMyId,
    setStatus,
    setErrorMessage,
    setConnectedRemoteId,
    resetCallState,
    wireDataConnection,
  ]);

  const startCall = () => {
    const peer = peerRef.current;
    const remoteId = remoteIdInput.trim();
    if (!peer || !remoteId || !localStream) {
      setErrorMessage('Peer ID를 입력하고 미디어를 먼저 시작하세요.');
      return;
    }
    setErrorMessage('');
    setStatus('connecting');
    try {
      const call = peer.call(remoteId, localStream);
      currentCallRef.current = call;
      call.on('stream', (stream) => {
        setRemoteStream(stream);
        setStatus('connected');
        setConnectedRemoteId(remoteId);
        // 발신자: 채팅용 데이터 연결 생성
        const conn = peer.connect(remoteId);
        dataConnRef.current = conn;
        conn.on('open', () => wireDataConnection(conn));
      });
      call.on('close', () => {
        if (dataConnRef.current) {
          dataConnRef.current.close();
          dataConnRef.current = null;
        }
        setRemoteStream(null);
        resetCallState();
        currentCallRef.current = null;
      });
      call.on('error', (err) => {
        setErrorMessage('통화 오류: ' + (err?.message || err));
        setStatus('error');
      });
    } catch (err) {
      setErrorMessage('통화 실패: ' + (err?.message || err));
      setStatus('error');
    }
  };

  const endCall = () => {
    if (dataConnRef.current) {
      dataConnRef.current.close();
      dataConnRef.current = null;
    }
    if (currentCallRef.current) {
      currentCallRef.current.close();
      currentCallRef.current = null;
    }
    setRemoteStream(null);
    resetCallState();
  };

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

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream]);

  return (
    <div className="app">
      <h1>PeerJS 1:1 화상 채팅</h1>

      <section className="controls">
        <div className="control-row">
          <button onClick={startMedia} disabled={!!localStream}>
            {localStream ? '미디어 사용 중' : '미디어 시작'}
          </button>
          {localStream && (
            <>
              <span className="my-id">
                내 Peer ID: <code>{myId || '연결 중...'}</code> (5자리)
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
            placeholder="상대 Peer ID (5자리) 입력"
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
            {status === 'connecting' && ' (상대가 수락할 때까지 대기)'}
            {isConnected &&
              connectedRemoteId &&
              ` · 상대: ${connectedRemoteId}`}
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

      <ChatPanel sendMessage={sendChatMessage} disabled={!isConnected} />

      <RecordPanel remoteStream={remoteStream} disabled={!isConnected} />

      <p className="hint">
        테스트: 두 탭에서 각각 &quot;미디어 시작&quot; 후, 한 탭의 5자리 ID를
        다른 탭에 입력해 &quot;통화 걸기&quot;하세요. 채팅 내역은 브라우저에
        저장됩니다.
      </p>
    </div>
  );
}

export default App;
