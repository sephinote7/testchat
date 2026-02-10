import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { useChatStore } from './store/useChatStore';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import ChatPanel from './components/ChatPanel';
import RecordPanel from './components/RecordPanel';
import './App.css';

// 파이썬 서버 주소 (Vercel 환경 변수 우선, 없으면 기본값)
const SUMMARY_API_URL =
  import.meta.env.VITE_SUMMARY_API_URL || 'https://testchatpy.onrender.com';

// Peer ID 생성 함수 (특수문자 처리)
const getSafePeerId = (email) => {
  if (!email) return null;
  return email
    .toString()
    .toLowerCase()
    .replace(/[@]/g, '_at_')
    .replace(/[.]/g, '_');
};

function App() {
  const [profile, setProfile] = useState(null);
  const [chatIdInput, setChatIdInput] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [summaryResult, setSummaryResult] = useState('');
  const sessionInfoRef = useRef(null);

  const {
    myId,
    status,
    errorMessage,
    setMyId,
    setStatus,
    setErrorMessage,
    setConnectedRemoteId,
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

  // 1. 프로필 및 세션 관리
  useEffect(() => {
    const fetchProfile = async (session) => {
      if (!session?.user) return;
      try {
        const { data, error } = await supabase
          .from('member')
          .select('role, email')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        if (data) {
          setProfile({
            id: session.user.id,
            role: data.role,
            email: data.email,
          });
        }
      } catch (err) {
        setErrorMessage(`프로필 로드 실패: ${err.message}`);
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
  }, [setErrorMessage]);

  // 2. 미디어 장치 시작 (권한 획득)
  const startMedia = async () => {
    setErrorMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, // 셀카 모드 우선
        audio: true,
      });
      setLocalStream(stream);
      setStatus('idle');
    } catch (err) {
      console.warn('마이크 제외 시도:', err);
      try {
        const videoOnly = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setLocalStream(videoOnly);
        setErrorMessage('마이크를 찾을 수 없어 비디오만 연결합니다.');
        setStatus('idle');
      } catch (videoErr) {
        setErrorMessage('카메라 권한이 거부되었거나 장치를 찾을 수 없습니다.');
        setStatus('error');
      }
    }
  };

  // 3. PeerJS 초기화 (PeerJS는 ID에 .trim() 호출하므로 반드시 문자열)
  useEffect(() => {
    if (!profile?.email || !localStream) return;
    if (peerRef.current) return;

    const safeId = getSafePeerId(profile.email);
    if (!safeId) return;
    const peer = new Peer(String(safeId), {
      debug: 2, // 로그 수준 강화
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    peer.on('open', (id) => {
      console.log('My Peer ID:', id);
      setMyId(id);
    });

    peer.on('call', (call) => {
      console.log('전화 수신 중...');
      call.answer(localStream);
      currentCallRef.current = call;
      call.on('stream', (s) => {
        setRemoteStream(s);
        setStatus('connected');
        setConnectedRemoteId(String(call.peer ?? ''));
      });
      call.on('close', () => {
        if (dataConnRef.current) dataConnRef.current.close();
        dataConnRef.current = null;
        setRemoteStream(null);
        resetCallState();
        currentCallRef.current = null;
      });
      call.on('error', (err) => {
        setErrorMessage('수신 통화 오류: ' + (err?.message || err?.type));
      });
    });

    peer.on('connection', (conn) => {
      dataConnRef.current = conn;
      conn.on('data', (data) => {
        const obj = typeof data === 'string' ? JSON.parse(data) : data;
        addMessage({ from: 'remote', text: obj.text, time: obj.time });
      });
    });

    peer.on('error', (err) => {
      setErrorMessage(`Peer 오류: ${err.type}`);
    });

    peerRef.current = peer;
    return () => {
      peer.destroy();
      peerRef.current = null;
    };
  }, [
    localStream,
    profile?.email,
    setMyId,
    setStatus,
    setErrorMessage,
    setConnectedRemoteId,
    resetCallState,
    addMessage,
  ]);

  // 4. 통화 시작 (핵심 수정 부분)
  const startCall = async () => {
    const peer = peerRef.current;
    const inputId = (chatIdInput != null ? String(chatIdInput) : '').trim();

    // 1. 입력값 검증
    if (!inputId) return setErrorMessage('방 번호를 입력해주세요.');

    try {
      setStatus('connecting');
      const { data, error } = await supabase
        .from('chat_msg')
        .select('cnsler_id, member_id')
        .eq('chat_id', inputId)
        .single();

      if (error || !data)
        throw new Error('방 번호가 잘못되었거나 존재하지 않습니다.');

      // 2. 상대방 ID 결정 (내 이메일과 비교하여 내가 아닌 쪽을 선택)
      // Supabase에서 숫자로 올 수 있으므로 항상 문자열로 변환
      const myEmail = String(profile.email || '').toLowerCase();
      const cnslerEmail = String(data.cnsler_id ?? '').toLowerCase();
      const memberEmail = String(data.member_id ?? '').toLowerCase();

      // 내가 상담사라면 상대는 멤버, 내가 멤버라면 상대는 상담사
      const targetEmail = myEmail === cnslerEmail ? memberEmail : cnslerEmail;
      const remoteId = getSafePeerId(targetEmail);
      if (!remoteId) throw new Error('상대방 ID를 생성할 수 없습니다.');

      console.log(
        '매칭 시도 -> 내 ID:',
        getSafePeerId(myEmail),
        '상대 ID:',
        remoteId,
      );

      // 3. 통화 시도 (PeerJS는 ID에 .trim()을 호출하므로 반드시 문자열 전달)
      const call = peer.call(String(remoteId), localStream);
      currentCallRef.current = call;

      // 타임아웃 설정 (10초 동안 응답 없으면 실패 처리)
      const timeout = setTimeout(() => {
        if (currentCallRef.current === call) {
          setErrorMessage('상대방이 응답하지 않거나 네트워크가 불안정합니다.');
          setStatus('idle');
        }
      }, 10000);

      call.on('stream', (s) => {
        clearTimeout(timeout);
        setRemoteStream(s);
        setStatus('connected');
        setConnectedRemoteId(String(remoteId));
        // 발신자: 채팅용 DataConnection 열기
        const conn = peer.connect(String(remoteId));
        dataConnRef.current = conn;
        conn.on('open', () => {
          conn.on('data', (data) => {
            const obj = typeof data === 'string' ? JSON.parse(data) : data;
            addMessage({ from: 'remote', text: obj?.text ?? '', time: obj?.time ?? Date.now() });
          });
        });
      });
      call.on('close', () => {
        if (dataConnRef.current) dataConnRef.current.close();
        dataConnRef.current = null;
        setRemoteStream(null);
        resetCallState();
        currentCallRef.current = null;
      });
      call.on('error', (err) => {
        setErrorMessage('통화 오류: ' + (err?.message || err?.type));
        setStatus('idle');
      });
    } catch (err) {
      setErrorMessage(err.message);
      setStatus('idle');
    }
  };

  // 5. 통화 종료 및 요약
  const endCall = async () => {
    if (currentCallRef.current) currentCallRef.current.close();
    if (dataConnRef.current) dataConnRef.current.close();

    const messages = getMessagesForApi();
    setRemoteStream(null);
    resetCallState();

    // getMessagesForApi()는 배열 반환 — 문자열로 합쳐서 요약 API에 전달
    const fullText = Array.isArray(messages)
      ? messages.map((m) => (m && m.text) || '').join('\n')
      : '';
    if (fullText.trim()) {
      setStatus('summarizing');
      try {
        const response = await fetch(`${SUMMARY_API_URL}/api/summarize-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: fullText }),
        });
        const result = await response.json();
        setSummaryResult(result.summary || '요약 결과가 없습니다.');
      } catch (err) {
        setSummaryResult('요약 서버 연결 실패');
      }
      setStatus('idle');
    }
  };

  // 비디오 태그 연결
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
          접속: <b>{profile.email}</b> ({profile.role})
        </p>
        <p>
          내 ID: <code>{myId || '연결 대기 중...'}</code>
        </p>
        {errorMessage && (
          <p className="error-text" style={{ color: 'red' }}>
            {errorMessage}
          </p>
        )}
      </div>

      <div className="controls">
        <button onClick={startMedia} className="btn-media">
          1. 미디어 시작
        </button>
        <input
          placeholder="채팅방 ID 입력"
          value={chatIdInput}
          onChange={(e) => setChatIdInput(e.target.value)}
        />
        <button
          onClick={startCall}
          disabled={!myId || isConnected}
          className="btn-call"
        >
          2. 통화 걸기
        </button>
        <button onClick={endCall} disabled={!isConnected} className="btn-end">
          통화 종료
        </button>
      </div>

      {status === 'summarizing' && <div className="loader">AI 요약 중...</div>}

      <div className="videos">
        <div className="video-wrapper">
          <span>내 화면</span>
          <video ref={localVideoRef} autoPlay muted playsInline />
        </div>
        <div className="video-wrapper">
          <span>상대 화면</span>
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

      {summaryResult && (
        <div className="summary-box">
          <h3>✨ AI 대화 요약</h3>
          <p>{summaryResult}</p>
        </div>
      )}

      <RecordPanel
        localStream={localStream}
        remoteStream={remoteStream}
        disabled={!isConnected}
      />
    </div>
  );
}

export default App;
