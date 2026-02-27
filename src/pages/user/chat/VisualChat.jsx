import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Peer from 'peerjs';
import { supabase } from '../../../lib/supabase';

// PeerJS ID: member_id/cnsler_id(이메일) 기반. 서버 호환을 위해 @ . 치환
function sanitizePeerId(email) {
  if (!email || typeof email !== 'string') return '';
  return email.replace(/@/g, '_at_').replace(/\./g, '_');
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

// 역할 표시: USER → 상담자, SYSTEM → 상담사
function roleDisplayLabel(role) {
  return role === 'USER' ? '상담자' : '상담사';
}

/** MediaRecorder 호환 MIME 타입 선택 (Safari 등 브라우저별 지원 차이 대응) */
function getSupportedAudioMime() {
  const options = ['audio/webm', 'audio/mp4', 'audio/ogg'];
  for (const m of options) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
}

function getSupportedVideoMime() {
  const options = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  for (const m of options) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
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
 *   path="/chat/visualchat/:chatId"
 *   element={
 *     <ProtectedRoute allowRoles={['USER']}>
 *       <VisualChat />
 *     </ProtectedRoute>
 *   }
 * />
 *
 * - URL 파라미터 id는 cnsl_id 기준. chat_msg는 cnsl_id로 조회
 * - 해당 row의 member_id / cnsler_id(이메일 문자열)를 기준으로
 *   로그인 사용자가 USER 인지 SYSTEM 인지 판별
 * - member 테이블의 member_id(PK, varchar=이메일) 기준으로 두 참여자 정보 조회
 */
const VisualChat = () => {
  const { id } = useParams();
  const chatId = id;
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [other, setOther] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 채팅 ID 입력 및 통화/요약 상태
  const [chatIdInput, setChatIdInput] = useState(chatId || '');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [deviceError, setDeviceError] = useState(false);
  const [peerError, setPeerError] = useState('');
  const mediaRecorderRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const videoRecordedChunksRef = useRef([]);
  const hadVideoRecordingRef = useRef(false);
  const videoRefMobile = useRef(null);
  const videoRefPc = useRef(null);
  const remoteVideoRefMobile = useRef(null);
  const remoteVideoRefPc = useRef(null);
  const peerRef = useRef(null);
  const currentCallRef = useRef(null);
  const updateCnslStatRef = useRef(null);
  const callEndCleanupRanRef = useRef(false);
  const runCallEndCleanupRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const fetchChatMessagesRef = useRef(null);
  const lastLocalAddAtRef = useRef(0);
  const chatScrollRefMobile = useRef(null);
  const chatScrollRefPc = useRef(null);

  // 하단 채팅 상태
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  // 상담 정보 (cnsl_reg)
  const [cnslInfo, setCnslInfo] = useState(null);
  // 통화 종료 후: 완료 메시지, 영상 다운로드 모달
  const [callEnded, setCallEnded] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadClicked, setDownloadClicked] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!chatId) {
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

        // 2) chat_msg에서 채팅방 정보 조회 (URL id = cnsl_id). 없으면 cnsl_reg fallback
        const cnslIdNum = parseInt(chatId, 10);
        if (isNaN(cnslIdNum) || cnslIdNum <= 0) {
          setErrorMsg('유효하지 않은 상담방입니다.');
          setLoading(false);
          return;
        }
        let member_id, cnsler_id;
        const { data: chatRow } = await supabase
          .from('chat_msg')
          .select('chat_id, cnsl_id, member_id, cnsler_id')
          .eq('cnsl_id', cnslIdNum)
          .maybeSingle();

        if (chatRow) {
          member_id = chatRow.member_id;
          cnsler_id = chatRow.cnsler_id;
        } else {
          const { data: cnslRow, error: cnslErr } = await supabase
            .from('cnsl_reg')
            .select('member_id, cnsler_id')
            .eq('cnsl_id', cnslIdNum)
            .maybeSingle();
          if (cnslErr || !cnslRow) {
            setErrorMsg('해당 상담방 정보를 찾을 수 없습니다.');
            setLoading(false);
            return;
          }
          member_id = cnslRow.member_id;
          cnsler_id = cnslRow.cnsler_id;
        }

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

        const myRow = memberRows.find(
          (m) => (m.email ?? m.member_id) === currentEmail,
        );
        const partnerRow = memberRows.find(
          (m) => (m.email ?? m.member_id) === partnerEmail,
        );

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
          // 로그인 사용자가 member_id → USER
          finalMe.role = 'USER';
          finalOther.role = 'SYSTEM';
        } else if (isCnslerSide) {
          // 로그인 사용자가 cnsler_id → SYSTEM
          finalMe.role = 'SYSTEM';
          finalOther.role = 'USER';
        }

        setMe(finalMe);
        setOther(finalOther);

        // 6) 상담 정보(cnsl_reg) 조회: 좌측 패널 표시용
        const { data: cnslReg } = await supabase
          .from('cnsl_reg')
          .select('cnsl_title, cnsl_content, member_id')
          .eq('cnsl_id', cnslIdNum)
          .maybeSingle();
        if (cnslReg) {
          const reqNick = memberRows.find((m) => (m.email ?? m.member_id) === cnslReg.member_id)?.nickname;
          setCnslInfo({
            title: cnslReg.cnsl_title || '',
            content: cnslReg.cnsl_content || '',
            requesterNick: reqNick || cnslReg.member_id || '',
          });
        }
      } catch (error) {
        console.error('VisualChat 초기화 오류', error);
        setErrorMsg('상담 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [chatId]);

  // URL 파라미터 변경 시 채팅 ID 입력값 동기화
  useEffect(() => {
    setChatIdInput(chatId || '');
  }, [chatId]);

  const mapApiMessagesToUI = (list) =>
    (Array.isArray(list) ? list : []).map((msg) => {
      const senderEmail =
        (msg.role || '').toLowerCase() === 'counselor'
          ? msg.cnslerId
          : msg.memberId;
      const nickname =
        senderEmail === me?.email
          ? me?.nickname
          : (other?.nickname ?? senderEmail ?? '');
      const createdAt = msg.createdAt ?? msg.created_at;
      return {
        id: msg.chatId ?? `msg-${createdAt ?? Date.now()}`,
        role:
          (msg.role || '').toLowerCase() === 'counselor' ? 'SYSTEM' : 'USER',
        nickname: nickname || (msg.role === 'SYSTEM' ? 'SYSTEM' : 'USER'),
        text: msg.content ?? '',
        timestamp: createdAt ? new Date(createdAt).getTime() : Date.now(),
      };
    });

  const fetchFromSupabase = async () => {
    const cnslIdNum = parseInt(chatId, 10);
    if (isNaN(cnslIdNum) || cnslIdNum <= 0) return [];
    const { data: rows, error } = await supabase
      .from('chat_msg')
      .select('chat_id, msg_data, member_id, cnsler_id')
      .eq('cnsl_id', cnslIdNum)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase chat_msg 조회 실패:', error);
      return [];
    }
    if (!rows?.length) return [];
    const row = rows[0];
    const content = row?.msg_data?.content;
    if (!Array.isArray(content)) return [];
    const memberId = row.member_id || '';
    const cnslerId = row.cnsler_id || '';
    return content.map((item, idx) => {
      const speaker = (item.speaker || 'user').toLowerCase();
      const role = speaker === 'counselor' || speaker === 'cnsler' ? 'counselor' : 'user';
      return {
        chatId: `${row.chat_id}-${idx}`,
        role,
        content: item.text ?? '',
        memberId,
        cnslerId,
        createdAt: item.timestamp,
        created_at: item.timestamp,
      };
    });
  };

  const fetchChatMessages = async () => {
    if (!chatId || !me?.email) return;
    const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

    try {
      let list = [];
      list = await fetchFromSupabase();
      if (list.length === 0 && base) {
        try {
          const res = await fetch(`${base}/cnsl/${chatId}/chat`, {
            headers: {
              Accept: 'application/json',
              'X-User-Email': me.email,
            },
            mode: 'cors',
          });
          if (res.ok) {
            const data = await res.json();
            list = Array.isArray(data) ? data : [];
          }
        } catch {
          /* API 실패 시 Supabase 결과 유지 */
        }
      }
      const mapped = mapApiMessagesToUI(list);
      setChatMessages((prev) => {
        if (mapped.length > 0) return mapped;
        const justAdded = Date.now() - lastLocalAddAtRef.current < 5000;
        if (justAdded && prev.length > 0) return prev;
        return mapped;
      });
    } catch (err) {
      console.warn('채팅 조회 실패:', err);
      try {
        const list = await fetchFromSupabase();
        const mapped = mapApiMessagesToUI(list);
        if (mapped.length > 0) setChatMessages(mapped);
      } catch (e) {
        console.warn('Supabase 채팅 조회 실패:', e);
      }
    }
  };

  // 방 입장 시 callEnded·모달·녹화 플래그 초기화
  useEffect(() => {
    setCallEnded(false);
    setShowDownloadModal(false);
    setDownloadClicked(false);
    hadVideoRecordingRef.current = false;
    callEndCleanupRanRef.current = false;
  }, [chatId]);

  // 방 입장 후 채팅 목록 로드 (API 사용 시)
  useEffect(() => {
    if (!me || !chatId) return;
    fetchChatMessages();
  }, [chatId, me?.email]);

  // 채팅 메시지 변경 시 최하단으로 스크롤
  useEffect(() => {
    const scrollToBottom = (el) => {
      if (el) el.scrollTop = el.scrollHeight;
    };
    scrollToBottom(chatScrollRefMobile.current);
    scrollToBottom(chatScrollRefPc.current);
  }, [chatMessages]);

  /** cnsl_stat 업데이트 (C=진행중, D=완료) */
  const updateCnslStat = async (stat) => {
    if (!chatId || !me?.email) return;
    const base = import.meta.env.VITE_API_BASE_URL || '';
    if (!base) return;
    try {
      await fetch(`${base.replace(/\/$/, '')}/cnsl/${chatId}/stat`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': me.email,
        },
        body: JSON.stringify({ cnslStat: stat }),
      });
    } catch (e) {
      console.warn('cnsl_stat 업데이트 실패:', e);
    }
  };
  updateCnslStatRef.current = updateCnslStat;

  fetchChatMessagesRef.current = fetchChatMessages;

  // Supabase Realtime (WebSocket) + 폴링 폴백: 실시간 채팅 동기화
  useEffect(() => {
    if (!chatId || !me?.email) return;
    const cnslIdNum = parseInt(chatId, 10);
    if (isNaN(cnslIdNum) || cnslIdNum <= 0) return;

    const onChatChange = () => fetchChatMessagesRef.current?.();

    const channel = supabase
      .channel(`chat_msg:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_msg',
          filter: `cnsl_id=eq.${cnslIdNum}`,
        },
        onChatChange,
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_msg',
          filter: `cnsl_id=eq.${cnslIdNum}`,
        },
        onChatChange,
      )
      .subscribe();

    const pollInterval = setInterval(onChatChange, 5000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [chatId, me?.email]);

  // mediaStream ref 동기화 (runCallEndCleanup에서 사용)
  useEffect(() => {
    mediaStreamRef.current = mediaStream;
  }, [mediaStream]);

  // 메인 비디오: callEnded면 스트림 적용 안 함(초기화됨)
  useEffect(() => {
    if (callEnded) return;
    const mainStream = remoteStream ?? mediaStream;
    const mainTargets = [videoRefMobile.current, videoRefPc.current];
    mainTargets.forEach((el) => {
      if (el && mainStream) {
        el.srcObject = mainStream;
        el.muted = !remoteStream; // 상대 영상이면 unmute, 내 영상이면 mute(에코 방지)
        el.play().catch(() => {});
      }
    });
    const pipTargets = [remoteVideoRefMobile.current, remoteVideoRefPc.current];
    pipTargets.forEach((el) => {
      if (el && mediaStream) {
        el.srcObject = mediaStream;
        el.muted = true;
        el.play().catch(() => {});
      }
    });
  }, [mediaStream, remoteStream, callEnded]);

  // PeerJS: me/other 확정 시 Peer 생성, 수신 콜 처리
  useEffect(() => {
    if (!me?.email || !other?.email) return;
    const myId = sanitizePeerId(me.email);
    if (!myId) return;

    const peer = new Peer(myId, {
      host: import.meta.env.VITE_PEER_HOST || '0.peerjs.com',
      secure: true,
      key: import.meta.env.VITE_PEER_KEY || 'peerjs',
    });
    peerRef.current = peer;

    peer.on('open', () => {
      setPeerError('');
    });

    peer.on('call', async (call) => {
      currentCallRef.current = call;
      try {
        // 카메라 필수, 음성 선택: 먼저 비디오만 시도 → 성공 시 오디오 추가 시도
        let stream = await navigator.mediaDevices
          .getUserMedia({ video: true })
          .catch(() => null);
        if (!stream) {
          setErrorMsg('카메라를 사용할 수 없습니다. 카메라 연결 및 권한을 확인해 주세요.');
          return;
        }
        try {
          const withAudio = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          stream.getTracks().forEach((t) => t.stop());
          stream = withAudio;
        } catch {
          // 오디오 실패 시 비디오만으로 진행
        }
        setMediaStream(stream);
        setIsCallActive(true);
        setCallEnded(false);
        setRemoteStream(null);
        call.answer(stream);
        updateCnslStatRef.current?.('C');
        const hasAudio = stream.getAudioTracks().length > 0;
        if (hasAudio && typeof MediaRecorder !== 'undefined') {
          try {
            const mime = getSupportedAudioMime();
            const opts = mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : { audioBitsPerSecond: 32000 };
            const audRec = new MediaRecorder(stream, opts);
            recordedChunksRef.current = [];
            audRec.ondataavailable = (e) => {
              if (e.data?.size) recordedChunksRef.current.push(e.data);
            };
            audRec.onstop = () => {
              if (recordedChunksRef.current.length > 0) setHasRecording(true);
            };
            audRec.start();
            mediaRecorderRef.current = audRec;
            setIsRecording(true);
          } catch (e) {
            console.warn('오디오 녹음 시작 실패, 녹음 생략:', e);
          }
        }
        if (stream.getVideoTracks().length > 0 && typeof MediaRecorder !== 'undefined') {
          try {
            const mime = getSupportedVideoMime();
            const opts = mime ? { mimeType: mime, videoBitsPerSecond: 1500000 } : {};
            const vRec = new MediaRecorder(stream, opts);
            hadVideoRecordingRef.current = true;
            videoRecordedChunksRef.current = [];
            vRec.ondataavailable = (e) => {
              if (e.data?.size) videoRecordedChunksRef.current.push(e.data);
            };
            vRec.start(1000);
            videoRecorderRef.current = vRec;
          } catch (e) {
            console.warn('영상 녹화 시작 실패, 녹화 생략:', e);
            hadVideoRecordingRef.current = false;
          }
        } else {
          hadVideoRecordingRef.current = false;
        }
        call.on('stream', (remote) => {
          setRemoteStream(remote);
        });
        call.on('close', () => {
          setRemoteStream(null);
          runCallEndCleanupRef.current?.();
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
        setErrorMsg(
          '상대방이 아직 대기 중이 아닙니다. 상대가 같은 방에 들어온 뒤 다시 시도해 주세요.',
        );
      }
    });

    return () => {
      if (currentCallRef.current) {
        currentCallRef.current.close();
        currentCallRef.current = null;
      }
      peer.destroy();
      peerRef.current = null;
      setRemoteStream(null);
    };
  }, [me?.email, other?.email]);

  // 공통 로딩 / 에러 뷰
  if (loading) {
    return (
      <>
        {/* MOBILE */}
        <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white flex items-center justify-center">
          <p className="text-sm text-gray-500">
            상담 정보를 불러오는 중입니다...
          </p>
        </div>

        {/* PC */}
        <div className="hidden lg:flex w-full min-h-screen bg-main-01 items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl px-16 py-12 text-center">
            <p className="text-lg text-gray-600">
              상담 정보를 불러오는 중입니다...
            </p>
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
          <p className="text-sm text-gray-500">
            상담 참여자 정보를 찾을 수 없습니다.
          </p>
        </div>

        {/* PC */}
        <div className="hidden lg:flex w-full min-h-screen bg-main-01 items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl px-16 py-12 text-center">
            <p className="text-lg text-gray-600">
              상담 참여자 정보를 찾을 수 없습니다.
            </p>
          </div>
        </div>
      </>
    );
  }

  const isMeUser = me.role === 'USER';
  const isMeSystem = me.role === 'SYSTEM';
  const userMember = isMeUser ? me : other;
  const systemMember = isMeUser ? other : me;
  const peer = isMeUser ? systemMember : userMember;
  const peerRoleLabel = isMeUser ? 'SYSTEM' : 'USER';

  const attachStreamToVideos = (stream) => {
    [videoRefMobile.current, videoRefPc.current].forEach((videoEl) => {
      if (videoEl && stream) {
        // eslint-disable-next-line no-param-reassign
        videoEl.srcObject = stream;
        videoEl.muted = true; // 로컬 스트림은 반드시 mute (에코 방지)
        videoEl.play().catch(() => {});
      }
    });
  };

  const handleStartCall = async () => {
    if (!isMeSystem || isCallActive || deviceError) return;

    setErrorMsg('');

    try {
      // 카메라 필수, 음성 선택: 비디오 먼저 시도 → 성공 시 오디오 추가 시도
      let stream = await navigator.mediaDevices
        .getUserMedia({ video: true })
        .catch(() => null);
      if (!stream) {
        setDeviceError(true);
        setErrorMsg(
          '카메라를 사용할 수 없습니다. 카메라 연결 및 브라우저 권한을 확인해 주세요.',
        );
        setIsCallActive(false);
        setMediaStream(null);
        return;
      }
      let canRecordAudio = false;
      try {
        const withAudio = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        stream.getTracks().forEach((t) => t.stop());
        stream = withAudio;
        canRecordAudio = true;
      } catch {
        // 오디오 실패 시 비디오만으로 진행
      }

      setMediaStream(stream);
      setRemoteStream(null);
      setIsCallActive(true);
      setCallEnded(false);
      setHasRecording(false);
      updateCnslStat('C');
      attachStreamToVideos(stream);
      setTimeout(() => attachStreamToVideos(stream), 0);

      // PeerJS: 상대방(USER)에게 발신 (peer open 대기 후 호출)
      const remoteId = sanitizePeerId(other?.email);
      const peer = peerRef.current;
      if (peer && remoteId) {
        const doCall = () => {
          try {
            const call = peer.call(remoteId, stream);
            if (call) {
              currentCallRef.current = call;
              call.on('stream', (remote) => setRemoteStream(remote));
              call.on('close', () => {
                setRemoteStream(null);
                runCallEndCleanupRef.current?.();
              });
              call.on('error', () => setRemoteStream(null));
            }
          } catch (err) {
            console.error('PeerJS 발신 실패:', err);
            setErrorMsg(
              '상대방 연결에 실패했습니다. 상대가 같은 방에 있는지 확인해 주세요.',
            );
          }
        };
        if (peer.open) {
          doCall();
        } else {
          peer.once('open', doCall);
        }
      } else if (!remoteId) {
        setErrorMsg('상대방 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      }

      // 오디오 녹음 (요약/STT용, 부하 최소화)
      if (canRecordAudio && typeof MediaRecorder !== 'undefined') {
        try {
          const mime = getSupportedAudioMime();
          const opts = mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : { audioBitsPerSecond: 32000 };
          const recorder = new MediaRecorder(stream, opts);
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
        } catch (e) {
          console.warn('오디오 녹음 시작 실패, 녹음 생략:', e);
        }
      }
      // 영상 녹화 (다운로드용)
      if (stream.getVideoTracks().length > 0 && typeof MediaRecorder !== 'undefined') {
        try {
          const mime = getSupportedVideoMime();
          const opts = mime ? { mimeType: mime, videoBitsPerSecond: 1500000 } : {};
          const vRecorder = new MediaRecorder(stream, opts);
          hadVideoRecordingRef.current = true;
          videoRecordedChunksRef.current = [];
          vRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              videoRecordedChunksRef.current.push(event.data);
            }
          };
          vRecorder.start(1000);
          videoRecorderRef.current = vRecorder;
        } catch (e) {
          console.warn('영상 녹화 시작 실패, 녹화 생략:', e);
          hadVideoRecordingRef.current = false;
        }
      } else {
        hadVideoRecordingRef.current = false;
      }
    } catch (error) {
      console.error('통화 시작 실패:', error);
      // 장치 없음 에러는 한 번만 안내
      if (
        error?.name === 'NotFoundError' ||
        String(error?.message || '').includes('Requested device')
      ) {
        setDeviceError(true);
        setErrorMsg('사용 가능한 카메라 장치를 찾을 수 없습니다.');
      } else {
        setErrorMsg('통화 시작 중 오류가 발생했습니다.');
      }
      setIsCallActive(false);
      setIsRecording(false);
      setMediaStream(null);
    }
  };

  /** 채팅 내역 + 마이크 입력(오디오) STT로 chat_msg 저장 */
  const saveSummaryInBackground = async () => {
    if (!chatId || !me?.email) return;
    const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    const summarizeUrl =
      import.meta.env.VITE_SUMMARIZE_API_URL ||
      (base ? `${base}/summarize` : '') ||
      'http://localhost:8000/api/summarize';

    const chatLogsPayload = chatMessages.map((msg) => ({
      type: 'chat',
      speaker: msg.role === 'SYSTEM' ? 'cnsler' : 'user',
      text: msg.text,
      timestamp: String(msg.timestamp || Date.now()),
    }));
    const basePayload = [
      ...chatLogsPayload,
      {
        type: 'chat',
        speaker: me.role === 'SYSTEM' ? 'cnsler' : 'user',
        text: '화상 상담 세션',
        timestamp: String(Date.now()),
      },
    ];

    let summaryText = '';
    let summaryLine = '';
    let msgDataList = basePayload;

    const audioChunks = recordedChunksRef.current;
    const formData = new FormData();
    formData.append('msg_data', JSON.stringify(basePayload));
    if (audioChunks?.length) {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      formData.append(
        me.role === 'SYSTEM' ? 'audio_cnsler' : 'audio_user',
        blob,
        (me.role === 'SYSTEM' ? 'cnsler' : 'user') + '.webm',
      );
    }

    if (summarizeUrl) {
      try {
        const summaryRes = await fetch(summarizeUrl, {
          method: 'POST',
          body: formData,
          mode: 'cors',
        });
        if (summaryRes.ok) {
          const data = await summaryRes.json();
          summaryText = (data.summary || '').slice(0, 300);
          summaryLine = (data.summary_line || '').trim();
          msgDataList = Array.isArray(data.msg_data) ? data.msg_data : basePayload;
        }
      } catch (e) {
        console.warn('요약 API 실패:', e);
      }
    }

    if (!summaryText && basePayload.length > 0) {
      const texts = basePayload
        .filter((x) => x.text && typeof x.text === 'string')
        .map((x) => x.text)
        .slice(0, 10);
      summaryText = texts.length > 0
        ? texts.join(' ').slice(0, 300)
        : `화상 상담 (${new Date().toLocaleString('ko-KR')})`.slice(0, 300);
      summaryLine = texts[0] || summaryText;
    } else if (!summaryText) {
      summaryText = `화상 상담 (${new Date().toLocaleString('ko-KR')})`.slice(0, 300);
      summaryLine = summaryText;
    }

    const summaryPayload = JSON.stringify({
      summary: summaryText,
      summary_line: summaryLine,
    });

    const saveToSupabase = async () => {
      if (!other) return;
      const cnslIdNum = parseInt(chatId, 10);
      if (isNaN(cnslIdNum) || cnslIdNum <= 0) return;
      const member_id = me.role === 'USER' ? me.email : other.email;
      const cnsler_id = me.role === 'USER' ? other.email : me.email;
      const msg_data = { content: msgDataList };

      const { data: existing } = await supabase
        .from('chat_msg')
        .select('chat_id')
        .eq('cnsl_id', cnslIdNum)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('chat_msg')
          .update({ msg_data, summary: summaryPayload })
          .eq('cnsl_id', cnslIdNum);
      } else {
        await supabase.from('chat_msg').insert({
          cnsl_id: cnslIdNum,
          member_id,
          cnsler_id,
          role: 'user',
          msg_data,
          summary: summaryPayload,
        });
      }
    };

    let apiSaved = false;
    if (base) {
      try {
        if (msgDataList.length > 0) {
          const r = await fetch(`${base}/cnsl/${chatId}/chat/summary-full`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Email': me.email,
            },
            body: JSON.stringify({
              summary: summaryText,
              summary_line: summaryLine || undefined,
              msg_data: msgDataList,
            }),
            mode: 'cors',
          });
          if (r.ok) apiSaved = true;
          else {
            const fallback = await fetch(`${base}/cnsl/${chatId}/chat`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-User-Email': me.email,
              },
              body: JSON.stringify({
                role: 'summary',
                content: summaryText,
                summary: summaryText,
              }),
              mode: 'cors',
            });
            if (fallback.ok) apiSaved = true;
          }
        } else {
          const r = await fetch(`${base}/cnsl/${chatId}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Email': me.email,
            },
            body: JSON.stringify({
              role: 'summary',
              content: summaryText,
              summary: summaryText,
            }),
            mode: 'cors',
          });
          if (r.ok) apiSaved = true;
        }
      } catch (err) {
        console.warn('chat_msg API 저장 실패:', err);
      }
    }
    if (!apiSaved) {
      try {
        await saveToSupabase();
      } catch (err) {
        console.warn('chat_msg Supabase 저장 오류:', err);
      }
    }
  };

  /** 통화 종료 시 공통 정리 로직 (양쪽 모두 실행). 원격 종료 시 call.on('close')에서도 호출 */
  const runCallEndCleanup = () => {
    if (callEndCleanupRanRef.current) return;
    callEndCleanupRanRef.current = true;

    updateCnslStatRef.current?.('D');
    setRemoteStream(null);

    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
    if (videoRecorderRef.current) {
      try {
        if (videoRecorderRef.current.state !== 'inactive') videoRecorderRef.current.stop();
      } catch {}
      videoRecorderRef.current = null;
    }

    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setMediaStream(null);
      mediaStreamRef.current = null;
    }

    setIsCallActive(false);
    setCallEnded(true);
    setTimeout(() => setShowDownloadModal(true), 300);

    [videoRefMobile.current, videoRefPc.current, remoteVideoRefMobile.current, remoteVideoRefPc.current].forEach(
      (el) => {
        if (el) el.srcObject = null;
      },
    );

    setTimeout(() => saveSummaryInBackground(), 1500);
  };
  runCallEndCleanupRef.current = runCallEndCleanup;

  const handleEndCall = () => {
    if (!isCallActive) return;

    if (currentCallRef.current) {
      currentCallRef.current.close();
      currentCallRef.current = null;
    }
    runCallEndCleanup();
  };

  const handleChatIdConnect = () => {
    const trimmed = (chatIdInput || '').trim();
    if (!trimmed) {
      setErrorMsg('채팅 ID를 입력한 뒤 연결해 주세요.');
      return;
    }
    setErrorMsg('');
    navigate(`/chat/visualchat/${trimmed}`);
  };

  const insertChatToSupabase = async (trimmed) => {
    const cnslIdNum = parseInt(chatId, 10);
    if (isNaN(cnslIdNum) || cnslIdNum <= 0 || !me || !other) return null;
    const member_id = me.role === 'USER' ? me.email : other.email;
    const cnsler_id = me.role === 'USER' ? other.email : me.email;
    const speaker = me.role === 'SYSTEM' ? 'cnsler' : 'user';
    const entry = { speaker, text: trimmed, type: 'chat', timestamp: Date.now() };

    const { data: existing } = await supabase
      .from('chat_msg')
      .select('chat_id, msg_data')
      .eq('cnsl_id', cnslIdNum)
      .maybeSingle();

    const content = Array.isArray(existing?.msg_data?.content)
      ? [...existing.msg_data.content, entry]
      : [entry];
    const msg_data = { content };

    if (existing) {
      const { error } = await supabase
        .from('chat_msg')
        .update({ msg_data })
        .eq('cnsl_id', cnslIdNum);
      return error ? null : { chatId: existing.chat_id };
    }
    const { data: inserted, error } = await supabase
      .from('chat_msg')
      .insert({ cnsl_id: cnslIdNum, member_id, cnsler_id, role: speaker, msg_data })
      .select('chat_id')
      .single();
    return error ? null : { chatId: inserted?.chat_id };
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || !me) return;

    const now = Date.now();
    const tempId = `local-${now}`;
    const newMsg = {
      id: tempId,
      role: me.role,
      nickname: me.nickname ?? '',
      text: trimmed,
      timestamp: now,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    lastLocalAddAtRef.current = now;
    setChatInput('');

    const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    const roleForApi = me.role === 'SYSTEM' ? 'counselor' : 'user';

    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/cnsl/${chatId}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': me.email ?? '',
          },
          body: JSON.stringify({ role: roleForApi, content: trimmed }),
          mode: 'cors',
        });
        if (res.ok) return;
      } catch (err) {
        console.warn('채팅 API 실패, Supabase fallback 시도:', err);
      }
    }

    try {
      await insertChatToSupabase(trimmed);
    } catch (err) {
      console.error('채팅 저장 오류:', err);
    }
  };

  return (
    <>
      {/* MOBILE 레이아웃: 가로 390 기준, 컨텐츠 폭 358 근처. */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white flex flex-col">
        {/* 상단 헤더 */}
        <header className="bg-main-02 h-16 flex items-center justify-center text-white font-bold text-lg">
          화상 상담
        </header>

        {/* 메인: 화상(sticky) + 상담정보 + 채팅. 스크롤 시 화상이 상단 고정 */}
        <main className="flex-1 flex flex-col px-[16px] pt-4 pb-20 gap-3 min-h-0 overflow-y-auto">
          {/* 화상 영역: sticky, 통화 종료 버튼 우측 */}
          <div className="sticky top-0 z-10 shrink-0 rounded-2xl overflow-hidden bg-[#020617]">
            <div className="relative w-full aspect-4/3 flex items-center justify-center text-white text-sm">
              {callEnded ? (
                <p className="text-white/90 text-base font-medium">상담 완료되었습니다.</p>
              ) : (
                <>
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
                  {/* 통화 종료 버튼: 화상 우측 */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    {isCallActive ? (
                      <button
                        type="button"
                        onClick={handleEndCall}
                        className="h-9 px-4 rounded-full text-[12px] font-semibold shadow-lg bg-[#ef4444] text-white"
                      >
                        통화 종료
                      </button>
                    ) : isMeSystem ? (
                      <button
                        type="button"
                        onClick={handleStartCall}
                        className="h-9 px-4 rounded-full text-[12px] font-semibold shadow-lg bg-main-02 text-white"
                      >
                        통화 시작
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 상담 정보 + 상대 정보 */}
          <section className="shrink-0 flex flex-col gap-3">
            <div className="max-h-[180px] overflow-y-auto flex flex-col gap-2 rounded-2xl border border-[#e5e7eb] p-3 bg-[#f9fafb]">
              {cnslInfo && (
                <div className="shrink-0">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-1">상담 정보</h2>
                  {cnslInfo.title && <p className="text-2xl font-medium text-gray-800 mb-0.5">제목: {cnslInfo.title}</p>}
                  {cnslInfo.requesterNick && <p className="text-[12px] text-[#6b7280] mb-1">예약자: {cnslInfo.requesterNick}</p>}
                  {cnslInfo.content && <p className="text-[12px] text-[#374151] leading-relaxed">{cnslInfo.content}</p>}
                </div>
              )}
              <div className="shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center justify-center px-2 py-[2px] rounded-full text-[10px] font-semibold ${
                      peerRoleLabel === 'SYSTEM'
                        ? 'bg-[#eef2ff] text-[#4f46e5]'
                        : 'bg-[#ecfdf5] text-[#047857]'
                    }`}
                  >
                    {roleDisplayLabel(peerRoleLabel)}
                  </span>
                  <span className="font-semibold text-2xl text-gray-800">
                    {peer.nickname}
                  </span>
                </div>
                {peerRoleLabel === 'SYSTEM' && systemMember.profile && (
                  <p className="text-[12px] mt-1 leading-relaxed whitespace-pre-line text-[#374151]">
                    {systemMember.profile}
                  </p>
                )}
                {peerRoleLabel === 'USER' && (
                  <>
                    {peer.mbti && (
                      <p className="text-[11px] text-[#6b7280] mb-1">
                        MBTI: {peer.mbti}
                      </p>
                    )}
                    {peer.persona && (
                      <p className="text-[12px] leading-relaxed whitespace-pre-line text-[#374151]">
                        {peer.persona}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 채팅 영역 */}
            <div className="flex flex-col gap-2 min-h-[160px]">
              <div
                ref={chatScrollRefMobile}
                className="flex-1 min-h-[120px] max-h-[200px] overflow-y-auto border border-[#e5e7eb] rounded-2xl px-3 py-2 bg-[#f9fafb]"
              >
                {chatMessages.length === 0 ? (
                  <p className="text-[10px] text-[#9ca3af]">
                    여기에 채팅이 표시됩니다.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col gap-0.5 ${
                          msg.role === me.role ? 'items-end' : 'items-start'
                        }`}
                      >
                        <p className="text-[10px] font-medium text-[#6b7280]">
                          {msg.nickname || roleDisplayLabel(msg.role)}
                        </p>
                        <div
                          className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-[11px] leading-tight border ${
                            msg.role === me.role
                              ? 'bg-[#e9f7ff] border-[#b8dcff] text-[#1d4ed8]'
                              : 'bg-[#f0fffd] border-[#b7f2ec] text-[#0f766e]'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <form
                onSubmit={handleChatSubmit}
                className="flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit(e);
                    }
                  }}
                  placeholder="메시지를 입력하세요"
                  className="flex-1 h-9 rounded-[10px] border border-[#dbe3f1] px-2 text-[12px] bg-white"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleChatSubmit(e);
                  }}
                  className="h-9 px-3 rounded-[10px] bg-main-02 text-white text-[12px] font-semibold"
                >
                  전송
                </button>
              </form>
            </div>
          </section>
        </main>
      </div>

      {/* PC 레이아웃: 정보+화상 600px, 채팅 300px 고정 (100vh 제한 없음) */}
      <div className="hidden lg:flex w-full bg-main-01">
          <div className="w-full max-w-[1520px] mx-auto flex flex-col px-4 py-4">
          {/* 상단 헤더 */}
          <header className="shrink-0 bg-linear-to-r from-main-02 to-[#1d4ed8] h-20 flex items-center justify-between text-white font-bold text-2xl shadow-lg rounded-t-2xl px-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                {peer.nickname?.slice(0, 1) || '상'}
              </div>
              <div className="flex flex-col">
                <span>
                  {peer.nickname}{' '}
                  {roleDisplayLabel(peerRoleLabel)}
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

          {/* 메인: 정보+화상 600px 고정, 채팅 300px 고정 (초과 시 스크롤) */}
          <main className="flex shrink-0 flex-col pt-2 pb-4">
            <div className="w-full flex flex-col bg-white rounded-b-2xl shadow-2xl overflow-hidden">
              <section className="flex shrink-0 gap-4 p-4 h-[600px]">
                {/* 좌측 정보창 480px × 600px 고정 */}
                <div
                  className="w-[480px] shrink-0 h-[600px] flex flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-[#f9fafb]"
                >
                  {/* 상담 정보 - 1:1 비율 */}
                  {cnslInfo ? (
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden border-b border-[#e5e7eb]">
                      <h3 className="text-2xl font-semibold text-gray-800 px-4 py-3 shrink-0">상담 정보</h3>
                      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2 text-sm text-[#374151]">
                        {cnslInfo.title && (
                          <p className="text-2xl font-medium text-gray-800 mb-1">제목: {cnslInfo.title}</p>
                        )}
                        {cnslInfo.requesterNick && (
                          <p className="text-[#6b7280] mb-1">예약자: {cnslInfo.requesterNick}</p>
                        )}
                        {cnslInfo.content && (
                          <p className="leading-relaxed whitespace-pre-line">
                            {cnslInfo.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}
                  {/* 상담자/상담사 정보 - 1:1 비율, 최소 높이로 내용 잘림 방지 */}
                  <div className="flex-1 min-h-[180px] flex flex-col overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-[3px] rounded-full text-[11px] font-semibold ${
                          peerRoleLabel === 'SYSTEM'
                            ? 'bg-[#eef2ff] text-[#4f46e5]'
                            : 'bg-[#ecfdf5] text-[#047857]'
                        }`}
                      >
                        {roleDisplayLabel(peerRoleLabel)}
                      </span>
                      <span className="font-semibold text-2xl text-gray-800">
                        {peer.nickname}
                      </span>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 text-sm text-[#374151]">
                      {peerRoleLabel === 'SYSTEM' && systemMember.profile && (
                        <p className="leading-relaxed whitespace-pre-line">
                          {systemMember.profile}
                        </p>
                      )}
                      {peerRoleLabel === 'USER' && (
                        <>
                          {peer.mbti && (
                            <p className="text-[12px] text-[#6b7280] mb-2">
                              MBTI: {peer.mbti}
                            </p>
                          )}
                          {peer.persona && (
                            <p className="leading-relaxed whitespace-pre-line">
                              {peer.persona}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 우측 화상 영역: 600px 고정 */}
                <div className="group relative flex-1 min-w-0 h-[600px] shrink-0 rounded-2xl bg-[#020617] overflow-hidden flex items-center justify-center">
                  {callEnded ? (
                    <p className="text-white/90 text-lg font-medium">상담 완료되었습니다.</p>
                  ) : (
                    <>
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
                  {/* 호버 시 반투명 어두운 레이어 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors pointer-events-none rounded-2xl" />
                  {/* 호버 시 플로팅 버튼: 미연결=통화 연결(상담사만), 연결됨=통화 종료(양쪽) */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    <div className="flex items-center gap-3">
                      {!isCallActive && isMeSystem && (
                        <button
                          type="button"
                          onClick={handleStartCall}
                          className="h-12 px-8 rounded-full text-sm font-semibold shadow-lg bg-[#3b82f6] text-white hover:bg-[#2563eb]"
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
                    </>
                  )}
                </div>
              </section>

              {/* 상단·하단 50px 간격, 채팅 영역 370px (메시지 영역 +20px) */}
              <footer className="shrink-0 h-[370px] flex flex-col border-t-2 border-gray-100 bg-white px-6 py-4 rounded-b-2xl mt-[50px]">
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] overflow-hidden flex flex-col h-full">
                    <h3 className="text-2xl font-semibold text-gray-800 px-4 py-2 border-b border-[#e5e7eb] shrink-0">
                      채팅
                    </h3>
                    <div
                      ref={chatScrollRefPc}
                      className="flex-1 min-h-0 overflow-y-auto px-4 py-2 flex flex-col gap-3"
                    >
                      {chatMessages.length === 0 ? (
                        <p className="text-xs text-[#9ca3af]">
                          메시지를 입력해 주세요.
                        </p>
                      ) : (
                        chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex flex-col gap-1 ${msg.role === me.role ? 'items-end' : 'items-start'}`}
                          >
                            <p className={`text-[11px] text-[#6b7280] ${msg.role === me.role ? 'text-right' : 'text-left'}`}>
                              {msg.nickname || roleDisplayLabel(msg.role)}
                            </p>
                            <div
                              className={`max-w-[75%] rounded-2xl px-3 py-2 text-[13px] leading-5 border ${
                                msg.role === me.role
                                  ? 'bg-[#e9f7ff] border-[#b8dcff] text-[#1d4ed8]'
                                  : 'bg-[#f0fffd] border-[#b7f2ec] text-[#0f766e]'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <form
                      onSubmit={handleChatSubmit}
                      className="flex gap-2 p-3 border-t border-[#e5e7eb] shrink-0"
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleChatSubmit(e);
                          }
                        }}
                        placeholder="메시지를 입력하세요"
                        className="flex-1 h-10 rounded-xl border border-[#dbe3f1] px-3 text-sm bg-white"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleChatSubmit(e);
                        }}
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

      {/* 통화 종료 후 상담 완료 모달 (PC/모바일 공통) */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">상담 완료</h3>
            <p className="text-sm text-gray-600 mb-4">
              통화 영상을 로컬에 저장할 수 있습니다.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={downloadClicked || (videoRecordedChunksRef.current?.length ?? 0) === 0}
                onClick={() => {
                  const chunks = videoRecordedChunksRef.current;
                  if (chunks.length > 0) {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `상담녹화_${chatId}_${Date.now()}.webm`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                  setDownloadClicked(true);
                }}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${
                  downloadClicked || (videoRecordedChunksRef.current?.length ?? 0) === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-main-02 text-white hover:opacity-90'
                }`}
              >
                {downloadClicked ? '다운로드 완료' : (videoRecordedChunksRef.current?.length ?? 0) > 0 ? '다운로드' : '영상 없음'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDownloadModal(false);
                  navigate('/');
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// id(cnsl_id) 변경 시 리마운트해 해당 방 로드
export function VisualChatRoute() {
  const { id } = useParams();
  return <VisualChat key={id ?? 'new'} />;
}

export default VisualChat;
