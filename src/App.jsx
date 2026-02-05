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
 * Peer ID 안전 변환 함수 (이메일의 @, . 을 PeerJS 허용 문자로 변경)
 */
const getSafePeerId = (email) => {
  if (!email) return null;
  return email.toString().replace(/[@]/g, '_at_').replace(/[.]/g, '_');
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

  // 1. Supabase 세션 확인 및 'member' 테이블 프로필 조회
  useEffect(() => {
    if (!supabase) return;

    const fetchProfile = async (session) => {
      if (!session?.user) return;

      console.log('프로필 조회 시작 (ID):', session.user.id);

      const { data, error } = await supabase
        .from('member') // 이미지에서 확인된 테이블명
        .select('role, email') // 이미지에서 확인된 컬럼명
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('프로필 로드 실패:', error.message);
        // 만약 테이블 조회가 안 되면 세션에 있는 기본 이메일이라도 사용
        setProfile({
          id: session.user.id,
          role: 'member',
          email: session.user.email,
        });
        return;
      }

      if (data) {
        console.log('프로필 로드 성공:', data);
        setProfile({
          id: session.user.id,
          role: data.role,
          email: data.email, // peerId로 사용될 값
        });
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

  // 2. 카메라/마이크 시작
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

  // 3. Peer 초기화 (이메일 정보가 로드된 후에만 실행)
  useEffect(() => {
    // profile.email이 로드될 때까지 기다림
    if (!localStream || !profile?.email) {
      console.log('Peer 대기 중: 스트림 또는 이메일 없음', {
        localStream: !!localStream,
        email: profile?.email,
      });
      return;
    }

    const safeId = getSafePeerId(profile.email);
    console.log('Peer 접속 시도 ID:', safeId);

    const peer = new Peer(safeId, {
      debug: 1,
      config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
    });

    peer.on('open', (id) => {
      console.log('Peer 서버 연결 성공! ID:', id);
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
      console.error('PeerJS 에러 발생:', err);
      setErrorMessage('Peer 오류: ' + err.type);
      setStatus('error');
    });

    peerRef.current = peer;
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [
    localStream,
    profile?.email,
    setMyId,
    setStatus,
    setErrorMessage,
    setConnectedRemoteId,
    addMessage,
  ]);

  // 4. 통화 시작 로직
  const startCall = async () => {
    const peer = peerRef.current;
    const inputVal = chatIdInput.trim();
    if (!peer || !inputVal) return;

    setStatus('connecting');
    setChatId(inputVal);

    // chat_msg 테이블에서 통화할 상대방 정보를 가져옴
    const { data, error } = await supabase
      .from('chat_msg')
      .select('*')
      .eq('chat_id', Number(inputVal))
      .single();

    if (error || !data) {
      setErrorMessage('채팅방 정보를 찾을 수 없습니다.');
      setStatus('error');
      return;
    }

    sessionInfoRef.current = data;

    // 내 역할에 따라 상대방의 이메일 결정
    const rawOtherEmail =
      profile.role === 'member' ? data.cnsler_id : data.member_id;
    const remoteId = getSafePeerId(rawOtherEmail);

    console.log('전화 거는 대상 (변환된 ID):', remoteId);

    const call = peer.call(remoteId, localStream);
    currentCallRef.current = call;

    call.on('stream', (stream) => {
      setRemoteStream(stream);
      setStatus('connected');
      setConnectedRemoteId(remoteId);
      const conn = peer.connect(remoteId);
      dataConnRef.current = conn;
    });

    call.on('error', (err) => {
      setErrorMessage('통화 연결 중 오류 발생');
      console.error(err);
    });
  };

  const endCall = async () => {
    if (currentCallRef.current) currentCallRef.current.close();
    if (dataConnRef.current) dataConnRef.current.close();
    setRemoteStream(null);
    resetCallState();
  };

  useEffect(() => {
    if (localVideoRef.current && localStream)
      localVideoRef.current.srcObject = localStream;
  }, [localStream]);
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream)
      remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  // 프로필 로드 전까지는 아무것도 렌더링하지 않거나 Auth 컴포넌트 표시
  if (!profile)
    return (
      <div className="app">
        <h1>화상 채팅 서비스</h1>
        <Auth onSuccess={setProfile} />
      </div>
    );

  return (
    <div className="app">
      <h1>AI 화상 채팅</h1>
      <p className="status-bar">
        <strong>{profile.role === 'member' ? '사용자' : '상담사'} 모드</strong>{' '}
        | 내 접속 ID: <code>{myId || 'PeerJS 연결 대기 중...'}</code>
      </p>

      <div className="controls">
        <button onClick={startMedia} className="btn-media">
          1. 미디어(카메라/마이크) 시작
        </button>
        <div className="call-box">
          <input
            placeholder="chat_id 입력 (예: 1)"
            value={chatIdInput}
            onChange={(e) => setChatIdInput(e.target.value)}
          />
          <button
            onClick={startCall}
            disabled={!myId || !chatIdInput}
            className="btn-call"
          >
            2. 통화 걸기
          </button>
          <button onClick={endCall} className="btn-end">
            통화 종료
          </button>
        </div>
      </div>

      {errorMessage && <p className="error-msg">{errorMessage}</p>}

      <div className="videos">
        <div className="video-container">
          <p>내 화면</p>
          <video ref={localVideoRef} autoPlay muted playsInline />
        </div>
        <div className="video-container">
          <p>상대방 화면</p>
          <video ref={remoteVideoRef} autoPlay playsInline />
        </div>
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
