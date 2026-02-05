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
 * 요구사항: Supabase Auth, member_id/cnsler_id를 Peer ID로 사용, cnsl_id로 매칭,
 * 통화 종료 시 녹음+채팅 → FastAPI 요약 → Supabase chat_msg 저장
 */
function App() {
  const [profile, setProfile] = useState(null);
  const [chatIdInput, setChatIdInput] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const sessionInfoRef = useRef(null); // chat_msg row info for matching

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
  const peerId = profile ? profile.member_id || profile.cnsler_id : null;

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

  // DataConnection으로 메시지 전송 (채팅 패널에서 호출)
  const sendChatMessage = useCallback(
    (text) => {
      const conn = dataConnRef.current;
      if (!conn || conn.open !== true) return;
      const time = Date.now();
      conn.send(JSON.stringify({ text, time }));
      addMessage({ from: 'me', text, time });
    },
    [addMessage]
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
    [addMessage]
  );

  /**
   * 데스크톱에서 "Requested device not found" 방지:
   * - 먼저 기본 요청, 실패 시 facingMode: 'user'로 재시도 (특정 장치 ID 의존 감소)
   * - 그래도 실패 시 영상만 / 음성만 따로 요청 후 스트림 합치기
   */
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
      // 1) 동시 요청 (일부 환경에서만 기본 장치가 유효한 경우 대비)
      let stream = await tryGetUserMedia({ video: true, audio: true });

      // 2) 실패 시 영상은 'user' 카메라로만 요청 (저장된 잘못된 장치 ID 회피)
      if (!stream) {
        stream = await tryGetUserMedia({
          video: { facingMode: 'user' },
          audio: true,
        });
      }

      // 3) 그래도 실패 시 영상/음성 분리 요청 후 합치기 (데스크톱 기본 장치 오류 회피)
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
      const msg = err?.message || err?.name || '알 수 없음';
      setErrorMessage(
        '카메라/마이크 접근 실패: ' +
          msg +
          (msg.includes('not found') || msg.includes('NotFound')
            ? ' — 브라우저 설정에서 카메라/마이크 권한을 확인하고, 다른 프로그램이 사용 중이면 해제한 뒤 다시 시도하세요.'
            : '')
      );
      setStatus('error');
    }
  };

  useEffect(() => {
    if (!localStream || !profile) return;

    const idToUse =
      profile.member_id || profile.cnsler_id || generateShortPeerId();
    const peer = new Peer(idToUse, {
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
    profile,
    setMyId,
    setStatus,
    setErrorMessage,
    setConnectedRemoteId,
    resetCallState,
    wireDataConnection,
  ]);

  const startCall = async () => {
    const peer = peerRef.current;
    const chatIdVal = chatIdInput.trim();
    if (!peer || !chatIdVal || !localStream) {
      setErrorMessage('chat_msg.chat_id를 입력하고 미디어를 먼저 시작하세요.');
      return;
    }
    setErrorMessage('');
    setStatus('connecting');
    setChatId(chatIdVal);
    sessionInfoRef.current = null;

    let remoteId = chatIdVal;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('chat_msg')
          .select('chat_id, cnsl_id, member_id, cnsler_id')
          .eq('chat_id', parseInt(chatIdVal, 10) || chatIdVal)
          .single();
        if (error || !data) {
          setErrorMessage(
            '해당 chat_id를 찾을 수 없습니다. Supabase chat_msg 테이블을 확인하세요.'
          );
          setChatId(null);
          return;
        }
        sessionInfoRef.current = data;
        const other =
          peerId === data.member_id ? data.cnsler_id : data.member_id;
        if (!other) {
          setErrorMessage(
            '상대 Peer ID가 없습니다. chat_msg에 member_id/cnsler_id를 채워주세요.'
          );
          setChatId(null);
          return;
        }
        remoteId = other;
      } catch (e) {
        setErrorMessage('chat_msg 조회 실패: ' + (e?.message || e));
        setChatId(null);
        return;
      }
    } else {
      remoteId = chatIdVal; // 데모: 입력값을 직접 Peer ID로 사용
    }
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

  const endCall = async () => {
    const blob = recordPanelRef.current?.stopRecordingAndGetBlob
      ? await recordPanelRef.current.stopRecordingAndGetBlob()
      : null;
    const messages = getMessagesForApi?.() ?? [];
    const apiUrl = (SUMMARY_API_URL || '').replace(/\/$/, '');
    const chatIdNum = chatId ? parseInt(chatId, 10) || chatId : null;
    const remoteIdForSave = connectedRemoteId;

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

    const doSave = async (msgData, summary) => {
      if (!supabase || chatIdNum == null || !profile) return;
      const member_id = profile.role === 'member' ? peerId : remoteIdForSave;
      const cnsler_id =
        profile.role === 'counsellor' ? peerId : remoteIdForSave;
      const baseRow = sessionInfoRef.current || {};
      const { error } = await supabase.from('chat_msg').upsert({
        chat_id: chatIdNum,
        cnsl_id: baseRow.cnsl_id ?? null,
        member_id: member_id ?? '',
        cnsler_id: cnsler_id ?? '',
        role: profile.role === 'member' ? 'user' : 'assistant',
        msg_data: msgData ?? messages,
        summery: summary ?? '(요약 없음)',
      });
      if (error) setSaveStatus('저장 실패: ' + error.message);
      else setSaveStatus('저장 완료');
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
        const data = res.ok ? await res.json() : null;
        const summary = data?.summary ?? '(요약 생성 실패)';
        const msgData = data?.msg_data ?? messages;
        await doSave(msgData, summary);
        if (!res.ok) setSaveStatus('요약 실패, 채팅만 저장됨');
      } catch (e) {
        await doSave(messages, '(요약 실패)');
        setSaveStatus('요약 실패, 채팅만 저장됨: ' + (e?.message || e));
      }
      setTimeout(() => setSaveStatus(''), 4000);
    } else if (
      supabase &&
      chatIdNum != null &&
      profile &&
      messages.length > 0
    ) {
      await doSave(messages, '(요약 없음)');
      setSaveStatus('채팅만 저장됨');
      setTimeout(() => setSaveStatus(''), 3000);
    }
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

  if (!profile) {
    return (
      <div className="app">
        <h1>AI 화상 채팅 (Supabase)</h1>
        <Auth onSuccess={setProfile} />
      </div>
    );
  }

  return (
    <div className="app">
      <h1>PeerJS 1:1 화상 채팅</h1>
      <p className="profile-info">
        {profile.role === 'member' ? '일반 사용자' : '상담사'} · Peer ID:{' '}
        <code>{peerId}</code>
        {supabase && (
          <button
            type="button"
            className="logout-btn"
            onClick={() => {
              supabase.auth.signOut();
              setProfile(null);
            }}
          >
            로그아웃
          </button>
        )}
      </p>

      <section className="controls">
        <div className="control-row">
          <button onClick={startMedia} disabled={!!localStream}>
            {localStream ? '미디어 사용 중' : '미디어 시작'}
          </button>
          {localStream && (
            <>
              <span className="my-id">
                내 Peer ID: <code>{myId || '연결 중...'}</code>
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
            placeholder={
              supabase
                ? 'chat_id 입력 (chat_msg)'
                : '상대 Peer ID 또는 chat_id 입력'
            }
            value={chatIdInput}
            onChange={(e) => setChatIdInput(e.target.value)}
            disabled={!localStream}
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

        {saveStatus && <p className="status save-status">{saveStatus}</p>}
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

      <RecordPanel
        ref={recordPanelRef}
        remoteStream={remoteStream}
        disabled={!isConnected}
        autoStart={true}
      />

      <p className="hint">
        {supabase
          ? 'chat_id(chat_msg)로 매칭합니다. 통화 종료 시 녹음+채팅을 요약해 chat_msg에 upsert 합니다.'
          : '데모: 상대 Peer ID를 입력해 통화. 요약 API가 있으면 전송합니다.'}
      </p>
    </div>
  );
}

export default App;
