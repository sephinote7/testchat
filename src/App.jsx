import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import { useChatStore } from './store/useChatStore';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import ChatPanel from './components/ChatPanel';
import RecordPanel from './components/RecordPanel';
import './App.css';

const SUMMARY_API_URL = import.meta.env.VITE_SUMMARY_API_URL || '';

/**
 * Peer ID 안전 변환 함수 (이메일 특수문자 제거)
 */
const getSafePeerId = (emailOrId) => {
  if (!emailOrId) return null;
  return emailOrId.toString().replace(/[@]/g, '_at_').replace(/[.]/g, '_');
};

function App() {
  const [profile, setProfile] = useState(null);
  const [chatIdInput, setChatIdInput] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const sessionInfoRef = useRef(null);

  const {
    myId,
    connectedRemoteId,
    chatId,
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
  const recordPanelRef = useRef(null);

  const isConnected = status === 'connected';

  // 1. Supabase 세션 및 프로필 가져오기
  useEffect(() => {
    if (!supabase) return;

    const fetchProfile = async (session) => {
      if (!session?.user) return;
      const { data, error } = await supabase
        .from('member')
        .select('email')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setProfile({
          id: session.user.id,
          member_id: data.email,
        });
      } else if (error) {
        console.error('프로필 로드 실패:', error.message);
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

  // 2. 미디어 장치 시작
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
      setErrorMessage('카메라/마이크 접근 실패: ' + err.message);
      setStatus('error');
    }
  };

  // 3. Peer 초기화 (프로필과 스트림이 모두 준비되었을 때만 실행)
  useEffect(() => {
    // profile 내부의 이메일 값 중 하나라도 있어야 함
    const rawEmailId = profile?.member_id || profile?.cnsler_id;

    if (!localStream || !rawEmailId) {
      console.log('Peer 대기 중: 스트림 또는 이메일 정보 없음', {
        localStream: !!localStream,
        rawEmailId,
      });
      return;
    }

    const safeId = getSafePeerId(rawEmailId);
    console.log('Peer 생성 시도 ID:', safeId);

    const peer = new Peer(safeId, {
      debug: 1,
      config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
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
    });

    peer.on('connection', (conn) => {
      dataConnRef.current = conn;
      conn.on('open', () => {
        conn.on('data', (data) => {
          const obj = typeof data === 'string' ? JSON.parse(data) : data;
          addMessage({ from: 'remote', text: obj.text, time: obj.time });
        });
      });
    });

    peer.on('error', (err) => {
      setErrorMessage('Peer 오류: ' + err.type);
      setStatus('error');
    });

    peerRef.current = peer;
    return () => {
      peer.destroy();
      peerRef.current = null;
    };
  }, [
    localStream,
    profile,
    setMyId,
    setStatus,
    setErrorMessage,
    setConnectedRemoteId,
    addMessage,
  ]);

  // 4. 통화 시작
  const startCall = async () => {
    const peer = peerRef.current;
    const inputVal = chatIdInput.trim();
    if (!peer || !inputVal) return;

    setStatus('connecting');
    setChatId(inputVal);

    const { data, error } = await supabase
      .from('chat_msg')
      .select('*')
      .eq('chat_id', Number(inputVal))
      .single();

    if (error || !data) {
      setErrorMessage('해당 채팅 정보를 찾을 수 없습니다.');
      setStatus('error');
      return;
    }

    sessionInfoRef.current = data;
    // 상대방 역할에 따른 이메일 추출
    const rawOtherEmail =
      profile.role === 'member' ? data.cnsler_id : data.member_id;
    const remoteId = getSafePeerId(rawOtherEmail);

    console.log('통화 시도 상대:', remoteId);

    const call = peer.call(remoteId, localStream);
    currentCallRef.current = call;
    call.on('stream', (stream) => {
      setRemoteStream(stream);
      setStatus('connected');
      setConnectedRemoteId(remoteId);
      const conn = peer.connect(remoteId);
      dataConnRef.current = conn;
    });
  };

  // 5. 통화 종료
  const endCall = async () => {
    if (currentCallRef.current) currentCallRef.current.close();
    setRemoteStream(null);
    resetCallState();
    // (이후 요약 및 저장 로직은 이전과 동일)
  };

  useEffect(() => {
    if (localVideoRef.current && localStream)
      localVideoRef.current.srcObject = localStream;
  }, [localStream]);
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream)
      remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  if (!profile)
    return (
      <div className="app">
        <h1>로그인이 필요합니다</h1>
        <Auth onSuccess={setProfile} />
      </div>
    );

  return (
    <div className="app">
      <h1>AI 화상 채팅</h1>
      <p>
        역할: {profile.role} | 내 접속 ID: <code>{myId || '준비 중...'}</code>
      </p>

      <div className="controls">
        <button onClick={startMedia}>1. 미디어 시작</button>
        <input
          placeholder="chat_id 입력"
          value={chatIdInput}
          onChange={(e) => setChatIdInput(e.target.value)}
        />
        <button onClick={startCall} disabled={!myId || !chatIdInput}>
          2. 통화 걸기
        </button>
        <button onClick={endCall}>통화 종료</button>
      </div>

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
      <RecordPanel ref={recordPanelRef} remoteStream={remoteStream} />
    </div>
  );
}

export default App;
