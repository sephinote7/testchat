import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Peer from 'peerjs';
import { supabase } from '../../../lib/supabase';

// PeerJS ID: cnsl_id 기반 방 매칭. 서버 호환을 위해 @ . 치환
function sanitizePeerId(email) {
  if (!email || typeof email !== 'string') return '';
  return email.replace(/@/g, '_at_').replace(/\./g, '_');
}
function getRoomPeerId(cnslId, email) {
  const base = sanitizePeerId(email);
  return base ? `cnsl_${cnslId}_${base}` : '';
}

// DB role → UI role 정규화: member / cnsler → USER / SYSTEM
function normalizeRole(rawRole) {
  if (!rawRole) return rawRole;
  const lower = rawRole.toLowerCase();

  if (lower === 'member') return 'USER';
  if (lower === 'cnsler' || lower === 'counselor') return 'SYSTEM';

  if (lower === 'user' || lower === 'system') {
    return lower.toUpperCase();
  }

  // 그 외 값들은 일단 대문자로만 노출
  return rawRole.toUpperCase();
}

// member row → UI에서 사용하기 좋은 형태로 매핑
// Supabase member: id, email 등. 이메일은 row.email 또는 row.member_id
function mapMemberRow(row) {
  if (!row) return null;
  const emailVal = row.email ?? row.member_id;

  return {
    id: row.id ?? emailVal,
    email: emailVal, // 채팅/PeerJS 식별용
    role: normalizeRole(row.role),
    nickname: row.nickname,
    mbti: row.mbti,
    persona: row.persona,
    profile: row.profile,
  };
}

/**
 * 화상 상담 UI 페이지
 *
 * 라우트 예시:
 * <Route
 *   path="/chat/visualchat/:id"
 *   element={
 *     <ProtectedRoute allowRoles={['USER']}>
 *       <VisualChat />
 *     </ProtectedRoute>
 *   }
 * />
 *
 * - URL 파라미터 id = cnsl_id (상담 등록 ID)
 * - chat_msg 테이블을 cnsl_id로 조회하여 member_id / cnsler_id 획득
 * - member 테이블 기준으로 두 참여자 정보 조회
 */
const VisualChat = () => {
  const { id: cnslId } = useParams();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [other, setOther] = useState(null);
  const [cnslReg, setCnslReg] = useState(null); // cnsl_reg: cnsl_title, cnsl_content, member_id, cnsl_start_time
  const [bookerNickname, setBookerNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 채팅 ID 입력 및 통화/요약 상태
  const [chatIdInput, setChatIdInput] = useState(cnslId || '');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [deviceError, setDeviceError] = useState(false);
  const [peerError, setPeerError] = useState('');
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const videoRefMobile = useRef(null);
  const videoRefPc = useRef(null);
  const remoteVideoRefMobile = useRef(null);
  const remoteVideoRefPc = useRef(null);
  const peerRef = useRef(null);
  const currentCallRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [peerReady, setPeerReady] = useState(false);
  const [callEndedByRemote, setCallEndedByRemote] = useState(false);

  // 하단 채팅 상태
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const init = async () => {
      if (!cnslId) {
        setErrorMsg('유효하지 않은 상담방입니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg('');

      try {
        // 1) 현재 로그인한 사용자 정보 (Supabase Auth)
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setErrorMsg('로그인 정보가 없습니다. 다시 로그인해 주세요.');
          setLoading(false);
          return;
        }
        const currentEmail = user.email;

        // 2) chat_msg 에서 cnsl_id로 채팅방 정보 조회
        const { data: chatRow, error: chatError } = await supabase
          .from('chat_msg')
          .select('chat_id, cnsl_id, member_id, cnsler_id')
          .eq('cnsl_id', cnslId)
          .limit(1)
          .maybeSingle();

        if (chatError || !chatRow) {
          console.error('chat_msg 조회 실패', chatError);
          setErrorMsg('해당 상담방 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        const { member_id, cnsler_id } = chatRow;

        // 3) 로그인 사용자가 이 상담방에 속해 있는지 확인 (이메일 기준)
        const isMemberSide = member_id === currentEmail;
        const isCnslerSide = cnsler_id === currentEmail;

        if (!isMemberSide && !isCnslerSide) {
          setErrorMsg('해당 상담방에 대한 접근 권한이 없습니다.');
          setLoading(false);
          return;
        }

        const partnerEmail = isMemberSide ? cnsler_id : member_id;

        // 4) member 테이블에서 두 참여자 정보 조회 (email 또는 member_id 기준)
        const { data: memberRows, error: memberError } = await supabase
          .from('member')
          .select('id, email, role, nickname, mbti, persona, profile')
          .in('email', [currentEmail, partnerEmail]);

        if (memberError || !memberRows || memberRows.length < 2) {
          console.error('member 조회 실패', memberError);
          setErrorMsg('상담 참여자 정보를 불러오는 데 실패했습니다.');
          setLoading(false);
          return;
        }

        const myRow = memberRows.find((m) => (m.email ?? m.member_id) === currentEmail);
        const partnerRow = memberRows.find((m) => (m.email ?? m.member_id) === partnerEmail);

        if (!myRow || !partnerRow) {
          setErrorMsg('상담 참여자 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        const meMapped = mapMemberRow(myRow);
        const otherMapped = mapMemberRow(partnerRow);

        // 5) 이 방에서의 최종 역할을 USER / SYSTEM 으로 강제 설정
        let finalMe = { ...meMapped };
        let finalOther = { ...otherMapped };

        if (isMemberSide) {
          finalMe.role = 'USER';
          finalOther.role = 'SYSTEM';
        } else if (isCnslerSide) {
          finalMe.role = 'SYSTEM';
          finalOther.role = 'USER';
        }

        setMe(finalMe);
        setOther(finalOther);

        // 6) cnsl_reg 조회 (상담 내용)
        const { data: cnslRow } = await supabase
          .from('cnsl_reg')
          .select('cnsl_title, cnsl_content, member_id, cnsl_start_time, cnsl_dt')
          .eq('cnsl_id', cnslId)
          .maybeSingle();
        if (cnslRow) {
          setCnslReg(cnslRow);
          const bookerRow = memberRows.find((m) => (m.email ?? m.member_id) === cnslRow.member_id);
          setBookerNickname(bookerRow?.nickname ?? cnslRow.member_id ?? '');
        }
      } catch (error) {
        console.error('VisualChat 초기화 오류', error);
        setErrorMsg('상담 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [cnslId]);

  // URL 파라미터 변경 시 입력값 동기화
  useEffect(() => {
    setChatIdInput(cnslId || '');
  }, [cnslId]);

  // 채팅 목록 API 조회 (명세: GET /api/cnsl/{cnslId}/chat)
  const fetchChatMessages = async () => {
    if (!cnslId || !me?.email) return;
    const base = import.meta.env.VITE_API_BASE_URL || '';
    if (!base) return;
    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/cnsl/${cnslId}/chat`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setChatMessages(
        list.map((msg) => {
          const senderEmail =
            (msg.role || '').toLowerCase() === 'counselor' ? msg.cnslerId : msg.memberId;
          const nickname =
            senderEmail === me.email ? me.nickname : (other?.nickname ?? senderEmail ?? '');
          const createdAt = msg.createdAt ?? msg.created_at;
          return {
            id: msg.chatId ?? `msg-${createdAt ?? Date.now()}`,
            role: (msg.role || '').toLowerCase() === 'counselor' ? 'SYSTEM' : 'USER',
            nickname: nickname || (msg.role === 'SYSTEM' ? 'SYSTEM' : 'USER'),
            text: msg.content ?? '',
            timestamp: createdAt ? new Date(createdAt).getTime() : Date.now(),
          };
        })
      );
    } catch (err) {
      console.warn('채팅 목록 조회 실패:', err);
    }
  };

  // 방 입장 후 채팅 목록 로드 (API 사용 시)
  useEffect(() => {
    if (!me || !cnslId) return;
    fetchChatMessages();
  }, [cnslId, me?.email]);

  // 메인 비디오: remoteStream 우선, 없으면 mediaStream. PIP: mediaStream(통화 중일 때만)
  useEffect(() => {
    const mainStream = remoteStream ?? mediaStream;
    const mainTargets = [videoRefMobile.current, videoRefPc.current];
    mainTargets.forEach((el) => {
      if (el) {
        el.srcObject = mainStream;
        if (mainStream) el.play().catch(() => {});
      }
    });
    const pipTargets = [remoteVideoRefMobile.current, remoteVideoRefPc.current];
    pipTargets.forEach((el) => {
      if (el && mediaStream) {
        el.srcObject = mediaStream;
        el.play().catch(() => {});
      }
    });
  }, [mediaStream, remoteStream]);

  // PeerJS: cnsl_id 기반 방 매칭. me/other 확정 시 Peer 생성, 수신 콜 처리
  useEffect(() => {
    if (!cnslId || !me?.email || !other?.email) return;
    const myId = getRoomPeerId(cnslId, me.email);
    if (!myId) return;

    const peer = new Peer(myId, {
      host: import.meta.env.VITE_PEER_HOST || '0.peerjs.com',
      secure: true,
      key: import.meta.env.VITE_PEER_KEY || 'peerjs',
    });
    peerRef.current = peer;

    peer.on('open', () => {
      setPeerError('');
      setPeerReady(true);
    });

    peer.on('call', async (call) => {
      currentCallRef.current = call;
      try {
        let stream = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => null);
          if (!stream) stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
        }
        if (!stream) {
          setErrorMsg('카메라/마이크를 사용할 수 없습니다.');
          return;
        }
        mediaStreamRef.current = stream;
        setMediaStream(stream);
        setIsCallActive(true);
        setRemoteStream(null);
        call.answer(stream);
        call.on('stream', (remote) => {
          setRemoteStream(remote);
          setCallEndedByRemote(false);
        });
        call.on('close', () => {
          setRemoteStream(null);
          setCallEndedByRemote(true);
          setIsCallActive(false);
          const ms = mediaStreamRef.current;
          if (ms) {
            ms.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
            setMediaStream(null);
          }
          if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        });
        call.on('error', () => {
          setRemoteStream(null);
        });
      } catch (err) {
        console.error('수신 통화 처리 실패:', err);
        setErrorMsg('수신 통화를 시작할 수 없습니다.');
      }
    });

    peer.on('error', (err) => {
      const msg = err?.message || String(err);
      setPeerError(msg);
      if (err?.type === 'peer-unavailable') {
        setErrorMsg('상대방이 아직 대기 중이 아닙니다. 상대가 같은 방에 들어온 뒤 다시 시도해 주세요.');
      }
    });

    return () => {
      setPeerReady(false);
      if (currentCallRef.current) {
        currentCallRef.current.close();
        currentCallRef.current = null;
      }
      peer.destroy();
      peerRef.current = null;
      setRemoteStream(null);
    };
  }, [cnslId, me?.email, other?.email]);

  // 공통 로딩 / 에러 뷰
  if (loading) {
    return (
      <>
        {/* MOBILE */}
        <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white flex items-center justify-center">
          <p className="text-sm text-gray-500">상담 정보를 불러오는 중입니다...</p>
        </div>

        {/* PC */}
        <div className="hidden lg:flex w-full min-h-screen bg-main-01 items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl px-16 py-12 text-center">
            <p className="text-lg text-gray-600">상담 정보를 불러오는 중입니다...</p>
          </div>
        </div>
      </>
    );
  }

  if (errorMsg) {
    return (
      <>
        {/* MOBILE */}
        <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white flex items-center justify-center">
          <p className="text-sm text-red-500">{errorMsg}</p>
        </div>

        {/* PC */}
        <div className="hidden lg:flex w-full min-h-screen bg-main-01 items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl px-16 py-12 text-center">
            <p className="text-lg text-red-500">{errorMsg}</p>
          </div>
        </div>
      </>
    );
  }

  if (!me || !other) {
    return (
      <>
        {/* MOBILE */}
        <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white flex items-center justify-center">
          <p className="text-sm text-gray-500">상담 참여자 정보를 찾을 수 없습니다.</p>
        </div>

        {/* PC */}
        <div className="hidden lg:flex w-full min-h-screen bg-main-01 items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl px-16 py-12 text-center">
            <p className="text-lg text-gray-600">상담 참여자 정보를 찾을 수 없습니다.</p>
          </div>
        </div>
      </>
    );
  }

  const isMeUser = me.role === 'USER';
  const isMeSystem = me.role === 'SYSTEM';
  const userMember = isMeUser ? me : other;   // 상담자
  const systemMember = isMeUser ? other : me; // 상담사
  const peer = isMeUser ? systemMember : userMember;
  const roleDisplayLabel = (role) => (role === 'USER' ? '상담자' : '상담사');
  const peerRoleLabel = peer?.role;

  const attachStreamToVideos = (stream) => {
    [videoRefMobile.current, videoRefPc.current].forEach((videoEl) => {
      if (videoEl) {
        // eslint-disable-next-line no-param-reassign
        videoEl.srcObject = stream;
        videoEl
          .play()
          .catch(() => {
            // autoplay 에러는 무시
          });
      }
    });
  };

  const handleStartCall = async () => {
    if (!isMeSystem || isCallActive || deviceError) return;
    if (!peerReady) {
      setErrorMsg('연결 대기 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    setErrorMsg('');

    try {
      let stream = null;
      let canRecordAudio = true;

      // 제약을 최소화해 NotFoundError 감소: 먼저 audio+video(true만), 실패 시 video만, 마지막으로 audio만
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch (err) {
        console.warn('오디오+비디오 실패, 비디오만 재시도:', err);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          canRecordAudio = false;
        } catch (videoErr) {
          console.warn('비디오 실패, 오디오만 재시도:', videoErr);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            canRecordAudio = true;
          } catch (audioErr) {
            console.error('오디오 요청도 실패:', audioErr);
            setDeviceError(true);
            setErrorMsg('카메라/마이크를 연결하고 브라우저 권한을 허용해 주세요.');
            setIsCallActive(false);
            setMediaStream(null);
            return;
          }
        }
      }

      mediaStreamRef.current = stream;
      setMediaStream(stream);
      setRemoteStream(null);
      setIsCallActive(true);
      setCallEndedByRemote(false);
      setHasRecording(false);
      attachStreamToVideos(stream);
      setTimeout(() => attachStreamToVideos(stream), 0);

      // PeerJS: cnsl_id 기반 방에서 상대방에게 발신
      const remoteId = getRoomPeerId(cnslId, peer?.email ?? other?.email);
      if (!peerRef.current || !remoteId) {
        setErrorMsg('연결 준비가 되지 않았습니다.');
        return;
      }
      try {
        const call = peerRef.current.call(remoteId, stream);
        if (call) {
          currentCallRef.current = call;
          call.on('stream', (remote) => {
            setRemoteStream(remote);
            setCallEndedByRemote(false);
          });
          call.on('close', () => {
            setRemoteStream(null);
            setCallEndedByRemote(true);
            setIsCallActive(false);
            const ms = mediaStreamRef.current;
            if (ms) {
              ms.getTracks().forEach((t) => t.stop());
              mediaStreamRef.current = null;
              setMediaStream(null);
            }
            if (mediaRecorderRef.current?.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
          });
          call.on('error', () => setRemoteStream(null));
        }
      } catch (err) {
        console.error('PeerJS 발신 실패:', err);
        setErrorMsg('상대방 연결에 실패했습니다. 상대가 같은 상담방에 입장했는지 확인해 주세요.');
      }

      // 오디오 장치가 있는 경우에만 녹음 시도
      if (canRecordAudio && typeof MediaRecorder !== 'undefined') {
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        recordedChunksRef.current = [];
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        recorder.onstop = () => {
          setIsRecording(false);
          if (recordedChunksRef.current.length > 0) {
            setHasRecording(true);
          }
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      }
    } catch (error) {
      console.error('통화 시작 실패:', error);
      // 장치 없음 에러는 한 번만 안내
      if (error?.name === 'NotFoundError' || String(error?.message || '').includes('Requested device')) {
        setDeviceError(true);
        setErrorMsg('사용 가능한 카메라/마이크 장치를 찾을 수 없습니다.');
      } else {
        setErrorMsg('통화 시작 중 오류가 발생했습니다.');
      }
      setIsCallActive(false);
      setIsRecording(false);
      setMediaStream(null);
    }
  };

  /** AI 요약 생성 후 백엔드에만 저장. 화면에는 표시하지 않음. 차후 조회 시 chat_msg.summary로 확인 */
  const saveSummaryInBackground = async () => {
    if (!cnslId || !me?.email || !recordedChunksRef.current?.length) return;
    const base = import.meta.env.VITE_API_BASE_URL || '';
    const summarizeUrl = import.meta.env.VITE_SUMMARIZE_API_URL || 'http://localhost:8000/api/summarize';
    try {
      const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      if (me.role === 'SYSTEM') {
        formData.append('audio_cnsler', blob, 'cnsler.webm');
      } else {
        formData.append('audio_user', blob, 'user.webm');
      }
      const chatLogsPayload = chatMessages.map((msg) => ({
        type: 'chat',
        speaker: msg.role === 'SYSTEM' ? 'cnsler' : 'user',
        text: msg.text,
        timestamp: String(msg.timestamp || Date.now()),
      }));
      formData.append('msg_data', JSON.stringify([
        ...chatLogsPayload,
        { type: 'chat', speaker: me.role === 'SYSTEM' ? 'cnsler' : 'user', text: '화상 상담 세션', timestamp: String(Date.now()) },
      ]));
      const summaryRes = await fetch(summarizeUrl, { method: 'POST', body: formData });
      if (!summaryRes.ok) return;
      const data = await summaryRes.json();
      const summaryText = data.summary || '';
      if (!summaryText || !base) return;
      await fetch(`${base.replace(/\/$/, '')}/cnsl/${cnslId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': me.email,
        },
        body: JSON.stringify({ role: 'summary', content: summaryText, summary: summaryText }),
      });
    } catch (err) {
      console.warn('AI 요약 저장 실패:', err);
    }
  };

  const handleEndCall = () => {
    if (!isCallActive) return;

    if (currentCallRef.current) {
      currentCallRef.current.close();
      currentCallRef.current = null;
    }
    setRemoteStream(null);
    setCallEndedByRemote(false);

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    const ms = mediaStreamRef.current || mediaStream;
    if (ms) {
      ms.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      setMediaStream(null);
    }

    setIsCallActive(false);
    // 녹음이 있으면 요약 생성 후 백엔드에만 저장(UI 미표시)
    setTimeout(() => {
      if (recordedChunksRef.current.length > 0) {
        saveSummaryInBackground();
      }
    }, 800);
  };

  const handleChatIdConnect = () => {
    const trimmed = (chatIdInput || '').trim();
    if (!trimmed) {
      setErrorMsg('채팅 ID를 입력한 뒤 연결해 주세요.');
      return;
    }
    setErrorMsg('');
    navigate(`/chat/visualchat/${trimmed}`); // trimmed = cnsl_id
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || !me) return;

    const apiBase = import.meta.env.VITE_API_BASE_URL || '';
    const roleForApi = me.role === 'SYSTEM' ? 'counselor' : 'user'; // 명세: user / counselor

    if (apiBase) {
      try {
        const res = await fetch(
          `${apiBase.replace(/\/$/, '')}/cnsl/${cnslId}/chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Email': me.email ?? '',
            },
            body: JSON.stringify({ role: roleForApi, content: trimmed }),
          }
        );
        if (!res.ok) {
          setErrorMsg('메시지 전송에 실패했습니다.');
          return;
        }
        const saved = await res.json();
        const now = Date.now();
        setChatMessages((prev) => [
          ...prev,
          {
            id: saved.chatId ?? `local-${now}`,
            role: me.role,
            nickname: me.nickname ?? '',
            text: trimmed,
            timestamp: (saved.createdAt ?? saved.created_at) ? new Date(saved.createdAt ?? saved.created_at).getTime() : now,
          },
        ]);
      } catch (err) {
        console.error('채팅 전송 오류:', err);
        setErrorMsg('메시지 전송 중 오류가 발생했습니다.');
        return;
      }
    } else {
      const now = Date.now();
      setChatMessages((prev) => [
        ...prev,
        {
          id: `local-${now}`,
          role: me.role,
          nickname: me.nickname ?? '',
          text: trimmed,
          timestamp: now,
        },
      ]);
    }
    setChatInput('');
  };

  return (
    <>
      {/* MOBILE 레이아웃: 가로 390 기준, 컨텐츠 폭 358 근처 */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white flex flex-col">
        {/* 상단 헤더 */}
        <header className="bg-main-02 h-16 flex items-center justify-center text-white font-bold text-lg">
          화상 상담
        </header>

        {/* 메인: 헤더와 간격(50px) + 상담자=상담사+상담내용, 상담사=상담자+상담내용 */}
        <main className="flex-1 flex flex-col px-[16px] pt-[50px] pb-24 gap-4">
          <section className="flex-1 flex flex-col gap-3 min-h-0">
            {/* 상담 내용 (공통) */}
            {cnslReg && (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden shrink-0">
                <h2 className="text-[15px] text-[#4b5563] font-semibold mb-1">상담 내용</h2>
                <div className="flex-1 overflow-y-auto max-h-24 rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-3 text-[14px] text-[#374151]">
                  {cnslReg.cnsl_title && (
                    <p className="font-bold text-[16px] mb-1">제목: {cnslReg.cnsl_title}</p>
                  )}
                  {bookerNickname && (
                    <p className="text-[13px] text-[#6b7280] mb-2">예약자: {bookerNickname}</p>
                  )}
                  {cnslReg.cnsl_content && (
                    <p className="leading-relaxed whitespace-pre-line">{cnslReg.cnsl_content}</p>
                  )}
                </div>
              </div>
            )}

            {/* 상담자=상담사 정보만, 상담사=상담자 정보만 */}
            <div className="flex flex-col gap-2 shrink-0">
              {isMeUser && (
                <div>
                  <h2 className="text-[15px] text-[#4b5563] font-semibold mb-1">상담사 정보</h2>
                  <div className="overflow-y-auto max-h-28 rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-3 text-[14px] text-[#374151]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex px-2 py-[2px] rounded-full text-[12px] font-semibold bg-[#eef2ff] text-[#4f46e5]">상담사</span>
                      <span className="font-bold text-[15px]">{systemMember.nickname}</span>
                    </div>
                    {systemMember.profile && (
                      <p className="mt-1 leading-relaxed whitespace-pre-line">{systemMember.profile}</p>
                    )}
                  </div>
                </div>
              )}
              {isMeSystem && (
                <div>
                  <h2 className="text-[15px] text-[#4b5563] font-semibold mb-1">상담자 정보</h2>
                  <div className="overflow-y-auto max-h-28 rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-3 text-[14px] text-[#374151]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex px-2 py-[2px] rounded-full text-[12px] font-semibold bg-[#ecfdf5] text-[#047857]">상담자</span>
                      <span className="font-bold text-[15px]">{userMember.nickname}</span>
                    </div>
                    {userMember.mbti && <p className="text-[13px] text-[#6b7280] mb-1">MBTI: {userMember.mbti}</p>}
                    {userMember.persona && (
                      <p className="mt-1 leading-relaxed whitespace-pre-line">{userMember.persona}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 영상 영역 - 600px 고정, 상담 종료 시 안내 */}
            <div className="relative w-full h-[300px] min-h-[300px] rounded-2xl bg-[#020617] flex items-center justify-center text-white text-sm overflow-hidden shrink-0">
              <video
                ref={videoRefMobile}
                className="w-full h-full object-cover"
                playsInline
                muted={!remoteStream}
              />
              {remoteStream && (
                <video
                  ref={remoteVideoRefMobile}
                  className="absolute bottom-2 right-2 w-24 aspect-video object-cover rounded-lg border-2 border-white shadow-lg bg-black"
                  playsInline
                  muted
                />
              )}
              {callEndedByRemote && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 rounded-2xl">
                  <p className="text-white text-base font-semibold">상담이 종료되었습니다.</p>
                </div>
              )}
            </div>

            {/* 하단 채팅 영역 */}
            <section className="mt-2 flex flex-col gap-2 h-40">
              <div className="flex-1 overflow-y-auto border border-[#e5e7eb] rounded-2xl px-3 py-2 bg-[#f9fafb]">
                {chatMessages.length === 0 ? (
                  <p className="text-[11px] text-[#9ca3af]">여기에 채팅이 표시됩니다.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`text-[11px] ${
                          msg.role === me.role ? 'text-right' : 'text-left'
                        }`}
                      >
                        <span className="font-semibold mr-1">
                          {msg.nickname || roleDisplayLabel(msg.role)}
                        </span>
                        <span className="text-[#4b5563]">{msg.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="메시지를 입력하세요"
                  className="flex-1 h-9 rounded-[10px] border border-[#dbe3f1] px-2 text-[12px] bg-white"
                />
                <button
                  type="submit"
                  className="h-9 px-3 rounded-[10px] bg-main-02 text-white text-[12px] font-semibold"
                >
                  전송
                </button>
              </form>
            </section>
          </section>
        </main>

        {/* 하단 컨트롤 바: 모바일 Nav(하단 탭) 위에 오도록 bottom-14 사용 */}
        <footer className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 pb-4">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur border border-[#e5e7eb] rounded-2xl px-3 py-3 shadow-lg">
            <button
              type="button"
              onClick={isCallActive ? handleEndCall : handleStartCall}
              disabled={(!isMeSystem && !isCallActive) || (isMeSystem && !isCallActive && !peerReady)}
              className={`flex-1 h-10 rounded-full text-[13px] font-semibold ${
                isCallActive
                  ? 'bg-[#ef4444] text-white'
                  : isMeSystem
                  ? 'bg-main-02 text-white'
                  : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
              }`}
            >
              {isCallActive ? '통화 종료' : isMeSystem ? (peerReady ? '통화 시작' : '연결 대기 중...') : '상담사만 통화 시작 가능'}
            </button>
          </div>
        </footer>
      </div>

      {/* PC 레이아웃: 페이지 1920, 내부 컨텐츠 1520px */}
      <div className="hidden lg:flex w-full min-h-screen bg-main-01">
        <div className="w-full max-w-[1520px] mx-auto flex flex-col px-4 pt-6">
          {/* 상단 헤더 - 앱 최상단 네비와 간격(pt-6) */}
          <header className="bg-linear-to-r from-main-02 to-[#1d4ed8] h-20 flex items-center justify-between text-white font-bold text-2xl shadow-lg rounded-t-2xl rounded-b-none px-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                {peer.nickname?.slice(0, 1) || '상'}
              </div>
              <div className="flex flex-col">
                <span>
                  {peer.nickname} {peerRoleLabel === 'SYSTEM' ? '상담사' : '상담자'}
                </span>
                <span className="text-sm font-normal opacity-90">
                  실시간 화상 상담이 진행 중입니다.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
              <span
                className={`w-3 h-3 rounded-full ${
                  isCallActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
              <span className="text-sm font-medium text-blue-700">
                {isCallActive ? '연결됨' : '대기 중'}
              </span>
            </div>
          </header>

          {/* 메인: 상담 진행 중 바로 아래 붙이기 (rounded 상단 제거) */}
          <main className="flex-1 flex min-h-0 pb-4 -mt-0.5">
            <div className="w-full max-w-[1520px] flex-1 flex bg-white rounded-b-2xl shadow-2xl overflow-hidden flex-col">
              <section className="flex-1 flex min-h-0 gap-4 p-4">
                {/* 좌측 정보창: 상담자=상담사+상담내용, 상담사=상담자+상담내용, 1:1 높이, 스크롤 */}
                <div
                  className="flex-1 min-w-0 flex flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] h-[600px]"
                >
                  {/* 상담 내용 (공통, 상단) */}
                  {cnslReg && (
                    <div className="shrink-0 overflow-y-auto max-h-[40%] border-b border-[#e5e7eb]">
                      <div className="px-4 py-2 text-[13px] font-semibold text-[#6b7280]">상담 내용</div>
                      <div className="px-4 pb-4 text-[15px] text-[#374151]">
                        {cnslReg.cnsl_title && <p className="font-bold text-[17px] mb-2">제목: {cnslReg.cnsl_title}</p>}
                        {bookerNickname && <p className="text-[14px] text-[#6b7280] mb-2">예약자: {bookerNickname}</p>}
                        {cnslReg.cnsl_content && <p className="leading-relaxed whitespace-pre-line text-[14px]">{cnslReg.cnsl_content}</p>}
                      </div>
                    </div>
                  )}
                  {/* 상담자에게는 상담사 정보만, 상담사에게는 상담자 정보만 */}
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {isMeUser && (
                      <>
                        <div className="px-4 py-2 text-[13px] font-semibold text-[#6b7280]">상담사 정보</div>
                        <div className="px-4 pb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex px-2.5 py-[3px] rounded-full text-[13px] font-semibold bg-[#eef2ff] text-[#4f46e5]">상담사</span>
                            <span className="font-bold text-[17px]">{systemMember.nickname}</span>
                          </div>
                          {systemMember.profile && (
                            <p className="text-[15px] leading-relaxed whitespace-pre-line">{systemMember.profile}</p>
                          )}
                        </div>
                      </>
                    )}
                    {isMeSystem && (
                      <>
                        <div className="px-4 py-2 text-[13px] font-semibold text-[#6b7280]">상담자 정보</div>
                        <div className="px-4 pb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex px-2.5 py-[3px] rounded-full text-[13px] font-semibold bg-[#ecfdf5] text-[#047857]">상담자</span>
                            <span className="font-bold text-[17px]">{userMember.nickname}</span>
                          </div>
                          {userMember.mbti && <p className="text-[14px] text-[#6b7280] mb-1">MBTI: {userMember.mbti}</p>}
                          {userMember.persona && (
                            <p className="text-[15px] leading-relaxed whitespace-pre-line">{userMember.persona}</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 우측 화상 영역: 600px 고정, 상담 종료 시 안내 오버레이 */}
                <div className="flex-1 min-w-0 h-[600px] shrink-0 rounded-2xl overflow-hidden flex flex-col">
                <div className="group relative w-full h-full min-h-[600px] bg-[#020617] overflow-hidden flex items-center justify-center">
                  <video
                    ref={videoRefPc}
                    className="w-full h-full object-cover"
                    playsInline
                    muted={!remoteStream}
                  />
                  {remoteStream && (
                    <video
                      ref={remoteVideoRefPc}
                      className="absolute bottom-4 right-4 w-40 aspect-video object-cover rounded-xl border-2 border-white shadow-lg bg-black"
                      playsInline
                      muted
                    />
                  )}
                  {/* 상담 종료 안내 오버레이 */}
                  {callEndedByRemote && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 rounded-2xl">
                      <p className="text-white text-xl font-semibold">상담이 종료되었습니다.</p>
                    </div>
                  )}
                  {/* 호버 시 반투명 어두운 레이어 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors pointer-events-none rounded-2xl" />
                  {/* 호버 시 플로팅 버튼: 미연결=통화 연결(상담사만), 연결됨=통화 종료(양쪽) */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    <div className="flex items-center gap-3">
                      {!isCallActive && isMeSystem && (
                        <button
                          type="button"
                          onClick={handleStartCall}
                          className="h-12 px-8 rounded-full text-sm font-semibold shadow-lg bg-main-02 text-white hover:opacity-90"
                        >
                          통화 시작
                        </button>
                      )}
                      {isCallActive && (
                        <button
                          type="button"
                          onClick={handleEndCall}
                          className="h-12 px-8 rounded-full text-sm font-semibold shadow-lg bg-[#ef4444] text-white hover:bg-[#dc2626]"
                        >
                          통화 종료
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              </section>

              {/* 하단: 채팅 영역만 */}
              <footer className="border-t-2 border-gray-100 bg-white px-6 py-4 rounded-b-2xl">
                <div className="max-w-[1520px] mx-auto flex flex-col gap-4">
                  {/* 채팅 영역 - 고정 높이 + 스크롤 */}
                  <div className="rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] overflow-hidden flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-800 px-4 py-2 border-b border-[#e5e7eb]">
                      채팅
                    </h3>
                    <div className="h-[160px] overflow-y-auto px-4 py-2 flex flex-col gap-1">
                      {chatMessages.length === 0 ? (
                        <p className="text-xs text-[#9ca3af]">메시지를 입력해 주세요.</p>
                      ) : (
                        chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`text-sm ${msg.role === me.role ? 'text-right' : 'text-left'}`}
                          >
                            <span className="font-semibold mr-1">
                              {msg.nickname || roleDisplayLabel(msg.role)}
                            </span>
                            <span className="text-[#4b5563]">{msg.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <form onSubmit={handleChatSubmit} className="flex gap-2 p-3 border-t border-[#e5e7eb]">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="메시지를 입력하세요"
                        className="flex-1 h-10 rounded-xl border border-[#dbe3f1] px-3 text-sm bg-white"
                      />
                      <button
                        type="submit"
                        className="h-10 px-4 rounded-xl bg-main-02 text-white text-sm font-semibold"
                      >
                        전송
                      </button>
                    </form>
                  </div>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

// cnslId 변경 시 리마운트해 연결 시 해당 방이 확실히 로드되도록 함
export function VisualChatRoute() {
  const { id: cnslId } = useParams();
  return <VisualChat key={cnslId ?? 'new'} />;
}

export default VisualChat;

