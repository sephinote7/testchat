import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { useChatStore } from './store/useChatStore';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import ChatPanel from './components/ChatPanel';
import RecordPanel from './components/RecordPanel';
import './App.css';

// 파이썬 서버 기본 주소 (Render)
const SUMMARY_API_URL =
  import.meta.env.VITE_SUMMARY_API_URL || 'https://testchatpy.onrender.com';

const getSafePeerId = (email) => {
  if (!email) return null;
  return email.toString().replace(/[@]/g, '_at_').replace(/[.]/g, '_');
};

function App() {
  const [profile, setProfile] = useState(null);
  const [chatIdInput, setChatIdInput] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [summaryResult, setSummaryResult] = useState(''); // 요약 결과 상태
  const sessionInfoRef = useRef(null);

  const {
    myId,
    status,
    errorMessage,
    setMyId,
    setStatus,
    setErrorMessage,
    setConnectedRemoteId,
    setChatId,
    addMessage,
    resetCallState,
    getMessagesForApi,
  } = useChatStore();

  const peerRef = useRef(null);
  const currentCallRef = useRef(null);
  const dataConnRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const isConnected = status === 'connected';

  // 1. 프로필 로드 (member 테이블 기준)
  useEffect(() => {
    const fetchProfile = async (session) => {
      if (!session?.user) return;
      const { data, error } = await supabase
        .from('member')
        .select('role, email')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setProfile({ id: session.user.id, role: data.role, email: data.email });
      }
    };

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => fetchProfile(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) fetchProfile(session);
      else setProfile(null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  // 2. 미디어 시작 (PC 마이크 부재 대응)
  const startMedia = async () => {
    setErrorMessage('');
    try {
      // 오디오/비디오 둘 다 시도
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setStatus('idle');
    } catch (err) {
      console.warn('전체 장치 접근 실패, 비디오 전용 시도:', err.name);
      try {
        // 마이크가 없을 경우 비디오만 시도
        const videoOnly = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setLocalStream(videoOnly);
        setErrorMessage('마이크를 찾을 수 없어 비디오만 활성화합니다.');
        setStatus('idle');
      } catch (videoErr) {
        setErrorMessage('사용 가능한 카메라가 없습니다.');
        setStatus('error');
      }
    }
  };

  // 3. Peer 초기화
  useEffect(() => {
    if (!profile?.email || !localStream) return;
    if (peerRef.current) return;

    const safeId = getSafePeerId(profile.email);
    const peer = new Peer(safeId, {
      debug: 2, // 1보다 2가 더 자세한 로그를 보여줍니다.
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          // 여기에 TURN 서버 정보를 넣어야 진정한 '기기 간 통신'이 됩니다.
        ],
      },
    });

    peer.on('open', (id) => setMyId(id));
    peer.on('call', (call) => {
      call.answer(localStream);
      currentCallRef.current = call;
      call.on('stream', (s) => {
        setRemoteStream(s);
        setStatus('connected');
      });
    });

    peer.on('connection', (conn) => {
      dataConnRef.current = conn;
      conn.on('data', (data) => {
        const obj = typeof data === 'string' ? JSON.parse(data) : data;
        addMessage({ from: 'remote', text: obj.text, time: obj.time });
      });
    });

    peerRef.current = peer;
    return () => {
      peer.destroy();
      peerRef.current = null;
    };
  }, [localStream, profile?.email]);

  // 4. 통화 시작
  const startCall = async () => {
    const peer = peerRef.current;
    if (!peer || !chatIdInput) return;

    setStatus('connecting');
    const { data, error } = await supabase
      .from('chat_msg')
      .select('*')
      .eq('chat_id', chatIdInput)
      .single();
    if (error) {
      setErrorMessage('채팅방 정보를 찾을 수 없습니다.');
      return;
    }

    sessionInfoRef.current = data;
    const remoteEmail =
      profile.role === 'member' ? data.cnsler_id : data.member_id;
    const remoteId = getSafePeerId(remoteEmail);

    const call = peer.call(remoteId, localStream);
    currentCallRef.current = call;
    call.on('stream', (s) => {
      setRemoteStream(s);
      setStatus('connected');
      setConnectedRemoteId(remoteId);
      dataConnRef.current = peer.connect(remoteId);
    });
  };

  // 5. 통화 종료 및 AI 요약 요청
  const endCall = async () => {
    if (currentCallRef.current) currentCallRef.current.close();

    const fullText = getMessagesForApi(); // 대화 내역 가져오기
    setRemoteStream(null);
    resetCallState();

    if (fullText.trim()) {
      setStatus('summarizing'); // 요약 중 상태 표시
      try {
        const response = await fetch(`${SUMMARY_API_URL}/api/summarize-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: fullText }),
        });

        const data = await response.json();
        setSummaryResult(data.summary);
      } catch (err) {
        console.error('요약 실패:', err);
        setSummaryResult('요약 서버와 연결할 수 없습니다.');
      }
      setStatus('idle');
    }
  };

  // 비디오 연결
  useEffect(() => {
    if (localVideoRef.current && localStream)
      localVideoRef.current.srcObject = localStream;
  }, [localStream]);
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream)
      remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  if (!profile) return <Auth onSuccess={setProfile} />;

  return (
    <div className="app">
      <h1>AI 화상 채팅</h1>
      <div className="status-info">
        <p>
          접속: {profile.email} ({profile.role})
        </p>
        <p>
          내 ID: <code>{myId || '미디어 시작 필요'}</code>
        </p>
      </div>

      <div className="controls">
        <button onClick={startMedia}>1. 미디어 시작</button>
        <input
          placeholder="chat_id"
          value={chatIdInput}
          onChange={(e) => setChatIdInput(e.target.value)}
        />
        <button onClick={startCall} disabled={!myId || isConnected}>
          2. 통화 걸기
        </button>
        <button onClick={endCall} disabled={!isConnected}>
          통화 종료
        </button>
      </div>

      {status === 'summarizing' && (
        <div className="loading-spinner">AI가 대화를 요약하고 있습니다...</div>
      )}

      <div className="videos">
        <video ref={localVideoRef} autoPlay muted playsInline />
        <video ref={remoteVideoRef} autoPlay playsInline />
      </div>

      <ChatPanel
        sendMessage={(text) => {
          const time = Date.now();
          dataConnRef.current?.send({ text, time });
          addMessage({ from: 'me', text, time });
        }}
        disabled={!isConnected}
      />

      {/* 요약 결과 표시 */}
      {summaryResult && (
        <div className="summary-box">
          <h3>AI 대화 요약</h3>
          <p>{summaryResult}</p>
        </div>
      )}

      <RecordPanel remoteStream={remoteStream} />
    </div>
  );
}

export default App;
