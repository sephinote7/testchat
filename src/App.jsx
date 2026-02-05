import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import { useChatStore } from './store/useChatStore';
import { generateShortPeerId } from './utils/peerId';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import ChatPanel from './components/ChatPanel';
import RecordPanel from './components/RecordPanel';
import './App.css';

const SUMMARY_API_URL = import.meta.env.VITE_SUMMARY_API_URL || '';

/**
 * Peer ID를 위한 안전한 문자열 변환 함수 (이메일의 @, . 제거)
 */
const getSafePeerId = (emailOrId) => {
  if (!emailOrId) return null;
  // @ -> _at_ , . -> _ 로 변경 (특수문자 오류 방지)
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

  // 로그인한 사용자의 안전한 Peer ID (이메일 변환 처리)
  const peerId = profile
    ? getSafePeerId(profile.member_id || profile.cnsler_id)
    : null;

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('role, member_id, cnsler_id')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile({ id: session.user.id, ...data });
          });
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) setProfile(null);
    });
    return () => subscription?.unsubscribe();
  }, []);

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
    const tryGetUserMedia = async (constraints) => {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        return null;
      }
    };
    try {
      let stream = await tryGetUserMedia({ video: true, audio: true });
      if (!stream) {
        stream = await tryGetUserMedia({
          video: { facingMode: 'user' },
          audio: true,
        });
      }
      if (!stream) {
        const videoStream = await tryGetUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        const audioStream = await tryGetUserMedia({
          video: false,
          audio: true,
        });
        if (videoStream || audioStream) {
          stream = new MediaStream([
            ...(videoStream?.getVideoTracks() ?? []),
            ...(audioStream?.getAudioTracks() ?? []),
          ]);
        }
      }
      if (
        !stream ||
        (stream.getVideoTracks().length === 0 &&
          stream.getAudioTracks().length === 0)
      ) {
        throw new Error('Requested device not found');
      }
      setLocalStream(stream);
      setStatus('idle');
    } catch (err) {
      setErrorMessage(
        '카메라/마이크 접근 실패: ' + (err?.message || '알 수 없음'),
      );
      setStatus('error');
    }
  };

  // Peer 초기화 및 이벤트 리스너
  useEffect(() => {
    if (!localStream || !peerId) return;

    const peer = new Peer(peerId, {
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
      call.on('close', () => {
        if (dataConnRef.current) dataConnRef.current.close();
        setRemoteStream(null);
        resetCallState();
      });
    });

    peer.on('connection', (conn) => {
      dataConnRef.current = conn;
      conn.on('open', () => wireDataConnection(conn));
    });

    peer.on('error', (err) => {
      setErrorMessage('Peer 오류: ' + (err?.message || err.type));
      setStatus('error');
    });

    peerRef.current = peer;
    return () => {
      peer.destroy();
      peerRef.current = null;
    };
  }, [
    localStream,
    peerId,
    setMyId,
    setStatus,
    setErrorMessage,
    setConnectedRemoteId,
    resetCallState,
    wireDataConnection,
  ]);

  // 통화 시작 버튼 클릭 시
  const startCall = async () => {
    const peer = peerRef.current;
    const chatIdVal = chatIdInput.trim();
    if (!peer || !chatIdVal || !localStream) {
      setErrorMessage('chat_id를 입력하고 미디어를 시작하세요.');
      return;
    }
    setErrorMessage('');
    setStatus('connecting');
    setChatId(chatIdVal);

    try {
      const { data, error } = await supabase
        .from('chat_msg')
        .select('*')
        .eq('chat_id', Number(chatIdVal))
        .single();

      if (error || !data) {
        setErrorMessage('chat_id를 찾을 수 없습니다. (RLS 또는 데이터 확인)');
        setStatus('error');
        return;
      }

      sessionInfoRef.current = data;
      // 상대방 ID 추출 및 안전한 Peer ID로 변환
      const rawRemoteId =
        profile.role === 'member' ? data.cnsler_id : data.member_id;
      const remoteId = getSafePeerId(rawRemoteId);

      const call = peer.call(remoteId, localStream);
      currentCallRef.current = call;
      call.on('stream', (stream) => {
        setRemoteStream(stream);
        setStatus('connected');
        setConnectedRemoteId(remoteId);
        const conn = peer.connect(remoteId);
        dataConnRef.current = conn;
        conn.on('open', () => wireDataConnection(conn));
      });
    } catch (err) {
      setErrorMessage('통화 실패: ' + err.message);
      setStatus('error');
    }
  };

  // 통화 종료 및 요약 저장
  const endCall = async () => {
    const blob = recordPanelRef.current?.stopRecordingAndGetBlob
      ? await recordPanelRef.current.stopRecordingAndGetBlob()
      : null;
    const messages = getMessagesForApi?.() ?? [];
    const apiUrl = (SUMMARY_API_URL || '').replace(/\/$/, '');
    const currentConnectedId = connectedRemoteId;

    if (dataConnRef.current) dataConnRef.current.close();
    if (currentCallRef.current) currentCallRef.current.close();
    setRemoteStream(null);
    resetCallState();

    const doSave = async (msgData, summary) => {
      if (!supabase || !chatId || !profile) return;
      const { error } = await supabase.from('chat_msg').upsert({
        chat_id: Number(chatId),
        msg_data: msgData,
        summery: summary,
      });
      setSaveStatus(error ? '저장 실패' : '저장 완료');
    };

    if (apiUrl && (blob || messages.length > 0)) {
      setSaveStatus('요약 생성 중…');
      try {
        const form = new FormData();
        if (blob) form.append('audio', blob, 'recording.webm');
        form.append('msg_data', JSON.stringify(messages));
        const res = await fetch(`${apiUrl}/api/summarize`, {
          method: 'POST',
          body: form,
        });
        const result = res.ok ? await res.json() : null;
        await doSave(
          result?.msg_data || messages,
          result?.summary || '(요약 실패)',
        );
      } catch (e) {
        await doSave(messages, '(요약 실패)');
      }
      setTimeout(() => setSaveStatus(''), 4000);
    }
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
        <h1>AI 화상 채팅</h1>
        <Auth onSuccess={setProfile} />
      </div>
    );

  return (
    <div className="app">
      <h1>PeerJS 1:1 화상 채팅</h1>
      <p className="profile-info">
        {profile.role === 'member' ? '사용자' : '상담사'} · 내 Peer ID:{' '}
        <code>{peerId}</code>
        <button
          onClick={() => {
            supabase.auth.signOut();
            setProfile(null);
          }}
        >
          로그아웃
        </button>
      </p>

      <section className="controls">
        <div className="control-row">
          <button onClick={startMedia} disabled={!!localStream}>
            미디어 시작
          </button>
          {myId && (
            <span>
              {' '}
              내 접속 ID: <code>{myId}</code>
            </span>
          )}
        </div>
        <div className="control-row call-row">
          <input
            type="text"
            placeholder="chat_id 입력"
            value={chatIdInput}
            onChange={(e) => setChatIdInput(e.target.value)}
          />
          <button
            onClick={startCall}
            disabled={!localStream || !chatIdInput.trim()}
          >
            통화 걸기
          </button>
          <button onClick={endCall} disabled={!remoteStream}>
            통화 종료
          </button>
        </div>
        {saveStatus && <p className="status">{saveStatus}</p>}
        {errorMessage && <p className="error">{errorMessage}</p>}
      </section>

      <section className="videos">
        <div className="video-box">
          <p>나</p>
          <video ref={localVideoRef} autoPlay muted playsInline />
        </div>
        <div className="video-box">
          <p>상대</p>
          <video ref={remoteVideoRef} autoPlay playsInline />
        </div>
      </section>

      <ChatPanel sendMessage={sendChatMessage} disabled={!isConnected} />
      <RecordPanel
        ref={recordPanelRef}
        remoteStream={remoteStream}
        disabled={!isConnected}
      />
    </div>
  );
}

export default App;
