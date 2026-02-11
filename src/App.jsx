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
    clearMessages,
    resetCallState,
    getMessagesForApi,
  } = useChatStore();

  const peerRef = useRef(null);
  const currentCallRef = useRef(null);
  const dataConnRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const recordPanelRef = useRef(null);
  const finalizeOnceRef = useRef(false);

  const isConnected = status === 'connected';
  const isCnsler = profile?.role === 'cnsler' || profile?.role === 'counsellor';
  const isMember = Boolean(profile) && !isCnsler;

  const handleLogout = async () => {
    try {
      if (isConnected) {
        await endCall({ sendSignal: true });
      }
    } catch {
      // ignore
    }

    try {
      localStream?.getTracks?.().forEach((t) => t.stop());
    } catch {
      // ignore
    }
    try {
      remoteStream?.getTracks?.().forEach((t) => t.stop());
    } catch {
      // ignore
    }
    setLocalStream(null);
    setRemoteStream(null);
    setSummaryResult('');
    setChatIdInput('');
    sessionInfoRef.current = null;
    finalizeOnceRef.current = false;
    clearMessages();

    try {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    } catch {
      // ignore
    }

    await supabase.auth.signOut();
    setProfile(null);
  };

  const finalizeAndSaveOnce = async () => {
    if (finalizeOnceRef.current) return;
    finalizeOnceRef.current = true;

    const session = sessionInfoRef.current;
    const messages = getMessagesForApi() ?? [];

    // 요약/DB 저장은 상담사 화면에서만 수행
    if (!isCnsler) {
      setSummaryResult('');
      return;
    }

    let blobs = null;
    if (recordPanelRef.current?.stopRecordingAndGetBlobs) {
      blobs = await recordPanelRef.current.stopRecordingAndGetBlobs();
    } else if (recordPanelRef.current?.stopRecordingAndGetBlob) {
      const single = await recordPanelRef.current.stopRecordingAndGetBlob();
      blobs = {
        mixedAudioBlob: single,
        localAudioBlob: null,
        remoteAudioBlob: null,
        videoBlob: null,
      };
    }
    const hadAudioOrVideoBlob = Boolean(
      blobs?.mixedAudioBlob ||
      blobs?.localAudioBlob ||
      blobs?.remoteAudioBlob ||
      blobs?.videoBlob,
    );

    const buildMsgDataMessages = (chatList, sttList, transcriptFallback) => {
      const list = [];

      // 1. 채팅 메시지 처리 (실시간 발생 데이터)
      for (const m of chatList) {
        if (!m?.text) continue;
        // 상담사 화면에서 저장하므로: me는 cnsler, remote는 user
        const speaker = m.from === 'me' ? 'cnsler' : 'user';
        list.push({
          type: 'chat',
          speaker,
          text: m.text,
          timestamp: new Date(m.time || Date.now()).toISOString(),
        });
      }

      // 2. STT 데이터 처리 (사후 분석 데이터)
      if (Array.isArray(sttList) && sttList.length > 0) {
        sttList.forEach((s) => {
          // 파이썬 서버가 'cnsler', 'user'라고 명시적으로 라벨링해서 준다고 가정
          // 만약 서버가 0, 1로 준다면 해당 값을 매핑하는 로직이 필요함
          list.push({
            type: 'stt',
            speaker: s.speaker, // 서버에서 받은 화자 정보 그대로 사용
            text: s.text || '',
            // 서버에서 준 시작 시간(offset)이 있다면 상담 시작 시간에 더해서 계산
            timestamp: s.timestamp || new Date().toISOString(),
          });
        });
      } else if (transcriptFallback) {
        // 화자 분리가 안 된 통문장 결과가 왔을 경우의 폴백
        list.push({
          type: 'stt',
          speaker: 'unknown', // 구분 불가 시 unknown 처리
          text: transcriptFallback,
          timestamp: new Date().toISOString(),
        });
      }

      // 3. 전체 데이터를 시간순으로 정렬 (채팅과 STT가 자연스럽게 섞임)
      return list.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    };

    setStatus('summarizing');
    try {
      const apiUrl = (SUMMARY_API_URL || '').replace(/\/$/, '');
      let transcript = '';
      let summary = '';
      let stt = null;

      // 1) 요약 API 호출 (실패해도 DB 저장은 계속 진행)
      if (apiUrl && (hadAudioOrVideoBlob || messages.length > 0)) {
        try {
          const form = new FormData();
          // STT 분리 업로드: 상담사 화면(local=cnsler, remote=user)
          if (blobs?.remoteAudioBlob)
            form.append('audio_user', blobs.remoteAudioBlob, 'user.webm');
          if (blobs?.localAudioBlob)
            form.append('audio_cnsler', blobs.localAudioBlob, 'cnsler.webm');
          // 폴백: 둘 다 없으면 혼합/단일 음성으로 업로드
          if (
            !blobs?.remoteAudioBlob &&
            !blobs?.localAudioBlob &&
            blobs?.mixedAudioBlob
          ) {
            const b = blobs.mixedAudioBlob;
            form.append(
              'audio',
              b,
              b.type?.includes('audio') ? 'audio.webm' : 'recording.webm',
            );
          }
          form.append('msg_data', JSON.stringify(messages));
          const res = await fetch(`${apiUrl}/api/summarize`, {
            method: 'POST',
            body: form,
          });
          if (res.ok) {
            const data = await res.json();
            transcript = data.transcript ?? '';
            summary = data.summary ?? '';
            stt = data.stt ?? null;
          } else {
            console.warn('요약 API 실패 상태코드:', res.status);
            summary ||= '(요약 실패: 요약 서버 응답 오류)';
          }
        } catch (apiErr) {
          console.warn('요약 API 호출 중 오류:', apiErr);
          summary ||= '(요약 실패: 요약 서버 호출 오류)';
        }
      } else if (apiUrl && messages.length > 0) {
        try {
          const res = await fetch(`${apiUrl}/api/summarize-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: messages.map((m) => m?.text ?? '').join('\n'),
            }),
          });
          if (res.ok) {
            const data = await res.json();
            summary = data.summary ?? '';
          } else {
            console.warn('텍스트 요약 API 실패 상태코드:', res.status);
            summary ||= '(요약 실패: 텍스트 요약 서버 응답 오류)';
          }
        } catch (apiErr) {
          console.warn('텍스트 요약 API 호출 중 오류:', apiErr);
          summary ||= '(요약 실패: 텍스트 요약 서버 호출 오류)';
        }
      }

      const msg_data = {
        messages: buildMsgDataMessages(messages, stt, transcript),
      };

      // DB 저장: update 1건 반영 확인 → 필요 시 upsert 보강
      if (supabase && session?.chat_id != null) {
        const role = 'cnsler';
        const payload = {
          role,
          msg_data,
          summary: summary || '(요약 없음)',
        };

        let saved = false;

        // 1) 정상 컬럼(summary) update
        {
          const { data, error } = await supabase
            .from('chat_msg')
            .update(payload)
            .eq('chat_id', session.chat_id)
            .select('chat_id');
          if (error) {
            // 2) 구 스키마 호환(summery) update
            const isMissingSummaryColumn =
              typeof error.message === 'string' &&
              error.message.includes('column') &&
              error.message.includes('summary') &&
              error.message.includes('does not exist');
            if (isMissingSummaryColumn) {
              const { data: d2, error: e2 } = await supabase
                .from('chat_msg')
                .update({ role, msg_data, summery: summary || '(요약 없음)' })
                .eq('chat_id', session.chat_id)
                .select('chat_id');
              if (e2) {
                console.warn('chat_msg 저장 실패:', e2);
                setErrorMessage(
                  'DB 저장 실패(RLS/컬럼명 확인): ' + (e2?.message || e2),
                );
              } else {
                saved = Array.isArray(d2) && d2.length > 0;
              }
            } else {
              console.warn('chat_msg 저장 실패:', error);
              setErrorMessage(
                'DB 저장 실패(RLS/컬럼명 확인): ' + (error?.message || error),
              );
            }
          } else {
            saved = Array.isArray(data) && data.length > 0;
          }
        }

        // 3) update가 0건이면 upsert로 보강(정합성 체크)
        if (!saved) {
          const { error } = await supabase.from('chat_msg').upsert(
            {
              chat_id: session.chat_id,
              cnsl_id: session.cnsl_id ?? null,
              member_id: session.member_id ?? '',
              cnsler_id: session.cnsler_id ?? '',
              role,
              msg_data,
              summary: summary || '(요약 없음)',
            },
            { onConflict: 'chat_id' },
          );
          if (error) {
            console.warn('chat_msg upsert 실패:', error);
            setErrorMessage(
              'DB 저장 실패(RLS/필수컬럼 확인): ' + (error?.message || error),
            );
          }
        }
      }

      setSummaryResult(summary || '요약 결과가 없습니다.');
    } catch (err) {
      setSummaryResult('요약/저장 실패: ' + (err?.message || err));
    } finally {
      setStatus('idle');
    }
  };

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
        finalizeOnceRef.current = false; // 새 세션 시작
      });
      call.on('close', () => {
        if (dataConnRef.current) dataConnRef.current.close();
        dataConnRef.current = null;
        setRemoteStream(null);
        resetCallState();
        currentCallRef.current = null;
        // 상대방이 끊어도 상담사 화면에서 자동 요약/저장
        finalizeAndSaveOnce();
      });
      call.on('error', (err) => {
        setErrorMessage('수신 통화 오류: ' + (err?.message || err?.type));
      });
    });

    peer.on('connection', (conn) => {
      dataConnRef.current = conn;
      conn.on('data', (data) => {
        const obj = typeof data === 'string' ? JSON.parse(data) : data;
        // 통화 종료 제어 메시지
        if (obj?.type === 'control' && obj?.action === 'end_call') {
          endCall({ sendSignal: false });
          return;
        }
        addMessage({
          from: 'remote',
          text: obj?.text ?? '',
          time: obj?.time ?? Date.now(),
        });
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
    if (!isCnsler) {
      setErrorMessage('상담사(cnsler)만 통화를 걸 수 있습니다.');
      return;
    }
    const peer = peerRef.current;
    const inputId = (chatIdInput != null ? String(chatIdInput) : '').trim();

    // 1. 입력값 검증
    if (!inputId) return setErrorMessage('방 번호를 입력해주세요.');

    try {
      setStatus('connecting');
      const { data, error } = await supabase
        .from('chat_msg')
        .select('chat_id, cnsl_id, cnsler_id, member_id')
        .eq('chat_id', inputId)
        .single();

      if (error || !data)
        throw new Error('방 번호가 잘못되었거나 존재하지 않습니다.');

      sessionInfoRef.current = {
        chat_id: data.chat_id,
        cnsl_id: data.cnsl_id,
        member_id: data.member_id,
        cnsler_id: data.cnsler_id,
      };

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
        finalizeOnceRef.current = false; // 새 세션 시작
        // 발신자: 채팅용 DataConnection 열기
        const conn = peer.connect(String(remoteId));
        dataConnRef.current = conn;
        conn.on('open', () => {
          conn.on('data', (data) => {
            const obj = typeof data === 'string' ? JSON.parse(data) : data;
            // 통화 종료 제어 메시지
            if (obj?.type === 'control' && obj?.action === 'end_call') {
              endCall({ sendSignal: false });
              return;
            }
            addMessage({
              from: 'remote',
              text: obj?.text ?? '',
              time: obj?.time ?? Date.now(),
            });
          });
        });
      });
      call.on('close', () => {
        if (dataConnRef.current) dataConnRef.current.close();
        dataConnRef.current = null;
        setRemoteStream(null);
        resetCallState();
        currentCallRef.current = null;
        // 상대방이 끊어도 상담사 화면에서 자동 요약/저장
        finalizeAndSaveOnce();
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

  // 5. 통화 종료: 한쪽 종료 시 양쪽 종료 + 상담사 요약/저장
  const endCall = async ({ sendSignal } = { sendSignal: true }) => {
    // 상대에게도 종료 신호 전송 (양쪽 동시 종료)
    if (sendSignal) {
      try {
        dataConnRef.current?.send({
          type: 'control',
          action: 'end_call',
          time: Date.now(),
        });
      } catch (e) {
        // 무시: dataConn이 없을 수 있음
      }
    }

    // 먼저 finalize를 실행(버튼/상대 종료 모두 동일 처리)
    await finalizeAndSaveOnce();

    if (currentCallRef.current) currentCallRef.current.close();
    if (dataConnRef.current) dataConnRef.current.close();
    setRemoteStream(null);
    resetCallState();
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
      <div className="top-right-actions">
        <button type="button" className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
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
        {isCnsler && (
          <button
            onClick={startCall}
            disabled={!myId || isConnected}
            className="btn-call"
          >
            2. 통화 걸기
          </button>
        )}
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

      {isCnsler && summaryResult && (
        <div className="summary-box">
          <h3>✨ AI 대화 요약</h3>
          <p>{summaryResult}</p>
        </div>
      )}

      <RecordPanel
        ref={recordPanelRef}
        localStream={localStream}
        remoteStream={remoteStream}
        disabled={!isConnected}
        autoStart={isConnected}
        showDownload={isMember}
      />
    </div>
  );
}

export default App;
