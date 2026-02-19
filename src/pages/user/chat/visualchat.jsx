import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Peer from 'peerjs';
import useAuth from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';

const SUMMARY_API_URL =
  import.meta.env.VITE_SUMMARY_API_URL || 'https://testchatpy.onrender.com';

/** PeerJS ID: 이메일 특수문자 치환 (testchat과 동일 규칙) */
function getSafePeerId(email) {
  if (!email) return null;
  return String(email)
    .toLowerCase()
    .replace(/[@]/g, '_at_')
    .replace(/[.]/g, '_');
}

/** 브라우저가 지원하는 MediaRecorder 옵션 반환 (NotSupportedError 방지) */
function getSupportedRecorderOptions(stream) {
  const hasVideo = stream.getVideoTracks().length > 0;
  const types = hasVideo
    ? [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4',
        'audio/webm',
      ]
    : ['audio/webm', 'audio/mp4'];
  for (const mimeType of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mimeType)) {
      const opts = { mimeType };
      if (mimeType.startsWith('video/')) {
        opts.videoBitsPerSecond = 1500000;
      } else {
        opts.audioBitsPerSecond = 64000;
      }
      return opts;
    }
  }
  return hasVideo ? { mimeType: 'video/webm', videoBitsPerSecond: 1500000 } : { mimeType: 'audio/webm', audioBitsPerSecond: 64000 };
}

/** 지원되는 형식으로 MediaRecorder 생성 후 start. 실패 시 브라우저 기본값으로 재시도 */
function startMediaRecorderSafe(stream, options, onData, onStop) {
  const tryStart = (opts) => {
    const rec = new MediaRecorder(stream, opts);
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) onData(e.data);
    };
    rec.onstop = onStop;
    rec.start(1000);
    return rec;
  };
  try {
    return tryStart(options);
  } catch (e1) {
    try {
      return tryStart({});
    } catch (e2) {
      console.warn('MediaRecorder 시작 실패:', e2);
      return null;
    }
  }
}

/**
 * 화상 상담 페이지
 *
 * [녹화 설계]
 * - 로컬 다운로드용: 고화질 영상 1개 (video+audio 또는 audio만) → mediaRecorderRef → recordedBlob → "녹화 다운로드"
 * - STT/DB 저장용: 저화질 음성 2개 (상담사 음성, 상담자 음성) → localAudioBlobRef, remoteAudioBlobRef
 *   → testchatpy /api/summarize (Whisper STT) → msg_data + summary → chat_msg 테이블 저장
 *
 * - 상담 내용: cnsl_reg (cnsl_title, cnsl_content, cnsl_start_time)
 * - 통화 걸기(상담사만) / 통화 종료
 */
function calcAge(birth) {
  if (!birth) return null;
  const d = new Date(birth);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  return age;
}

function formatGender(gender) {
  if (!gender) return '';
  const g = String(gender).toUpperCase();
  if (g === 'M') return '남성';
  if (g === 'F') return '여성';
  return gender;
}

function formatStartTime(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes) {
  if (bytes == null || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
}

const VisualChat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const currentCallRef = useRef(null);
  const dataConnRef = useRef(null);
  const finalizeOnceRef = useRef(false);
  const endCallRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counselInfo, setCounselInfo] = useState(null);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [inCall, setInCall] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [recordingReady, setRecordingReady] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [summaryResult, setSummaryResult] = useState('');

  const localStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const localAudioChunksRef = useRef([]);
  const remoteAudioChunksRef = useRef([]);
  const localAudioRecorderRef = useRef(null);
  const remoteAudioRecorderRef = useRef(null);
  const localAudioBlobRef = useRef(null);
  const remoteAudioBlobRef = useRef(null);
  const messagesRef = useRef([]);
  const canvasRef = useRef(null);
  const compositeLoopRef = useRef(null);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 접속자 구분: member 테이블의 role 사용. 이메일로 counselor/client 매칭 후 role 대조 → SYSTEM이면 상담사, USER면 상담자 (counselInfo 선언 이후에 계산해 TDZ 방지)
  const currentUserEmail = (user?.email || '').trim().toLowerCase();
  const isSystem = (() => {
    if (!counselInfo || !currentUserEmail) return false;
    const counselorEmail = (counselInfo.counselor?.email || '').trim().toLowerCase();
    const clientEmail = (counselInfo.client?.email || '').trim().toLowerCase();
    if (counselorEmail === currentUserEmail) {
      return String(counselInfo.counselor?.role || '').toUpperCase() === 'SYSTEM';
    }
    if (clientEmail === currentUserEmail) {
      return String(counselInfo.client?.role || '').toUpperCase() === 'SYSTEM';
    }
    return false;
  })();

  useEffect(() => {
    if (!id) {
      setError('상담 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // cnsl_reg 한 테이블에 상담 정보 + cnsler_id(상담사), member_id(상담자) 포함
        const { data: cnslRow, error: cnslErr } = await supabase
          .from('cnsl_reg')
          .select('cnsl_id, cnsl_title, cnsl_content, cnsl_start_time, cnsler_id, member_id')
          .eq('cnsl_id', id)
          .maybeSingle();

        if (cnslErr) throw cnslErr;
        if (!cnslRow) {
          setError('해당 상담 정보가 없습니다.');
          setLoading(false);
          return;
        }

        if (!cnslRow.cnsler_id || !cnslRow.member_id) {
          setError('상담사/상담자 매칭 정보가 없습니다.');
          setLoading(false);
          return;
        }

        // cnsl_reg의 cnsler_id, member_id는 이메일 값 → member는 email로 조회, role로 상담사(SYSTEM)/상담자(USER) 구분
        const { data: members, error: memErr } = await supabase
          .from('member')
          .select('id, email, role, nickname, gender, birth, persona, profile')
          .in('email', [String(cnslRow.cnsler_id), String(cnslRow.member_id)]);

        if (memErr) throw memErr;

        const cnslerEmail = String(cnslRow.cnsler_id).trim().toLowerCase();
        const memberEmail = String(cnslRow.member_id).trim().toLowerCase();
        const counselor = members?.find((m) => (m.email || '').trim().toLowerCase() === cnslerEmail) || {};
        const client = members?.find((m) => (m.email || '').trim().toLowerCase() === memberEmail) || {};

        setCounselInfo({
          cnsl_id: cnslRow.cnsl_id,
          title: cnslRow.cnsl_title || '',
          content: cnslRow.cnsl_content || '',
          startedAt: formatStartTime(cnslRow.cnsl_start_time),
          startedAtRaw: cnslRow.cnsl_start_time,
          counselor: {
            id: counselor.id,
            email: counselor.email || cnslRow.cnsler_id || '',
            role: counselor.role ?? '',
            nickname: counselor.nickname || '',
            profile: counselor.profile || null,
          },
          client: {
            id: client.id,
            email: client.email || cnslRow.member_id || '',
            role: client.role ?? '',
            nickname: client.nickname || '',
            gender: formatGender(client.gender),
            age: calcAge(client.birth),
            persona: client.persona || '',
          },
        });
      } catch (e) {
        console.error('화상상담 데이터 로드 실패:', e);
        setError(e?.message || '데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [peerReady, setPeerReady] = useState(false);
  const [peerError, setPeerError] = useState(null);
  const [receiveCallError, setReceiveCallError] = useState(null);

  // PeerJS: 상담사/상담자 모두 자신의 이메일로 Peer 생성 (open 성공 시에만 사용)
  useEffect(() => {
    if (!counselInfo || !currentUserEmail) return;
    const counselorEmail = (counselInfo.counselor?.email || '').trim().toLowerCase();
    const clientEmail = (counselInfo.client?.email || '').trim().toLowerCase();
    if (currentUserEmail !== counselorEmail && currentUserEmail !== clientEmail) return;
    const mySafeId = getSafePeerId(currentUserEmail);
    if (!mySafeId) return;

    setPeerError(null);
    const peer = new Peer(String(mySafeId), {
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    peer.on('open', () => {
      console.log('[PeerJS] 내 ID:', mySafeId);
      peerRef.current = peer;
      setPeerReady(true);
      setPeerError(null);
    });

    peer.on('error', (err) => {
      const errType = err?.type ?? '';
      const errMsg = err?.message || errType || 'Peer 연결 실패';
      console.error('[PeerJS]', errType, errMsg);
      if (errType === 'unavailable-id' || errMsg.includes('unavailable')) {
        setPeerError('같은 계정이 이미 다른 탭에서 접속 중입니다. 다른 탭을 닫고 새로고침해 주세요.');
      } else {
        setPeerError(errMsg);
      }
      try {
        peer.destroy();
      } catch (_) {}
      peerRef.current = null;
      setPeerReady(false);
    });

    peer.on('disconnected', () => {
      setPeerReady(false);
    });

    // 상담자(USER): 상담사가 걸면 수신 후 자신 미디어로 응답
    peer.on('call', async (call) => {
      if (!call) return;
      console.log('[PeerJS] 통화 수신');
      try {
        let stream = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: true,
          });
        } catch (videoAudioErr) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'user' },
              audio: false,
            });
          } catch (videoOnlyErr) {
            try {
              stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (_) {
              throw videoAudioErr;
            }
          }
        }
        if (stream) {
          localStreamRef.current = stream;
          call.answer(stream);
          currentCallRef.current = call;
          recordedChunksRef.current = [];
          call.on('stream', (s) => {
            setRemoteStream(s);
            setReceiveCallError(null);
            setInCall(true);
          });
          call.on('close', () => {
            setRemoteStream(null);
            setInCall(false);
            currentCallRef.current = null;
            localStreamRef.current?.getTracks().forEach((t) => t.stop());
            localStreamRef.current = null;
          });
        }
      } catch (err) {
        console.error('[PeerJS] 수신 응답 오류:', err);
        const msg = err?.message || String(err);
        if (err?.name === 'NotFoundError' || msg.includes('not found')) {
          setReceiveCallError('카메라/마이크를 찾을 수 없습니다. 장치를 연결한 뒤 새로고침해 주세요.');
        } else {
          setReceiveCallError('미디어 접근 실패: ' + msg);
        }
      }
    });

    peer.on('connection', (conn) => {
      dataConnRef.current = conn;
      conn.on('data', (data) => {
        const obj = typeof data === 'string' ? JSON.parse(data) : data;
        if (obj?.type === 'control' && obj?.action === 'end_call') {
          endCallRef.current?.();
          return;
        }
        if (obj?.type === 'chat' && obj?.text != null) {
          const senderRole = obj.sender === 'cnsler' ? 'SYSTEM' : 'USER';
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              sender: senderRole,
              senderName: senderRole === 'SYSTEM' ? '상담사' : '상담자',
              text: obj.text,
              time: new Date((obj.time || Date.now())).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              timeMs: obj.time,
            },
          ]);
        }
      });
    });

    return () => {
      setPeerReady(false);
      try {
        dataConnRef.current?.close();
      } catch (_) {}
      dataConnRef.current = null;
      try {
        peer.destroy();
      } catch (_) {}
      peerRef.current = null;
    };
  }, [counselInfo, currentUserEmail]);

  // 통화 중 비디오 연결: 큰 화면 = 상대(remote), 없으면 자기(local). 작은 화면 = 항상 자기(local)
  // useLayoutEffect: DOM 반영 직후 스트림 할당 → 회색 화면 방지. 할당 후 play()로 재생 보장.
  useLayoutEffect(() => {
    if (!inCall) return;
    const localVideo = localVideoRef.current;
    const remoteVideo = remoteVideoRef.current;
    const localStream = localStreamRef.current;
    if (localVideo && localStream) {
      localVideo.srcObject = localStream;
      localVideo.play().catch(() => {});
    }
    if (remoteVideo) {
      const stream = remoteStream || localStream || null;
      remoteVideo.srcObject = stream;
      remoteVideo.muted = !remoteStream;
      if (stream) remoteVideo.play().catch(() => {});
    }
    return () => {
      if (localVideo) {
        localVideo.srcObject = null;
      }
      if (remoteVideo) {
        remoteVideo.srcObject = null;
        remoteVideo.muted = true;
      }
    };
  }, [inCall, remoteStream]);

  // 로컬 다운로드용 녹화: 상대 연결 전에는 단일 스트림, 연결 후에는 상담사+상담자 합성(캔버스) 녹화
  useEffect(() => {
    if (!inCall || !localStreamRef.current) {
      if (compositeLoopRef.current) {
        cancelAnimationFrame(compositeLoopRef.current);
        compositeLoopRef.current = null;
      }
      return;
    }
    const localStream = localStreamRef.current;
    const remoteStreamVal = remoteStream;
    recordedChunksRef.current = [];

    const onRecordStop = (type = 'video/webm') => {
      setRecordedBlob(new Blob(recordedChunksRef.current, { type }));
      setRecordingReady(true);
    };

    if (remoteStreamVal && remoteVideoRef.current && localVideoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      canvasRef.current = canvas;
      const ctx = canvas.getContext('2d');
      const rVideo = remoteVideoRef.current;
      const lVideo = localVideoRef.current;

      const draw = () => {
        if (!ctx || !rVideo || !lVideo) return;
        if (rVideo.readyState >= 2) {
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const rAspect = rVideo.videoWidth / rVideo.videoHeight;
          const cAspect = canvas.width / canvas.height;
          let dx = 0, dy = 0, dw = canvas.width, dh = canvas.height;
          if (rAspect > cAspect) {
            dw = canvas.height * rAspect;
            dx = (canvas.width - dw) / 2;
          } else {
            dh = canvas.width / rAspect;
            dy = (canvas.height - dh) / 2;
          }
          ctx.drawImage(rVideo, dx, dy, dw, dh);
        }
        if (lVideo.readyState >= 2) {
          const pw = 240;
          const ph = 180;
          const px = canvas.width - pw - 16;
          const py = canvas.height - ph - 16;
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.strokeRect(px, py, pw, ph);
          ctx.drawImage(lVideo, px, py, pw, ph);
        }
        compositeLoopRef.current = requestAnimationFrame(draw);
      };
      draw();

      try {
        const compositeStream = canvas.captureStream(30);
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) compositeStream.addTrack(audioTrack);
        const opts = getSupportedRecorderOptions(compositeStream);
        const rec = new MediaRecorder(compositeStream, opts);
        mediaRecorderRef.current = rec;
        rec.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        rec.onstop = () => onRecordStop(opts.mimeType?.split(';')[0] || 'video/webm');
        rec.start(1000);
      } catch (e) {
        console.warn('합성 녹화 실패, 단일 스트림으로 대체:', e);
        const mainOpts = getSupportedRecorderOptions(localStream);
        const mainRec = startMediaRecorderSafe(localStream, mainOpts, (d) => recordedChunksRef.current.push(d), () => onRecordStop(mainOpts.mimeType?.split(';')[0]));
        if (mainRec) mediaRecorderRef.current = mainRec;
      }
    } else {
      const mainOpts = getSupportedRecorderOptions(localStream);
      const mainRec = startMediaRecorderSafe(
        localStream,
        mainOpts,
        (d) => recordedChunksRef.current.push(d),
        () => onRecordStop(mainOpts.mimeType?.split(';')[0] || 'video/webm')
      );
      if (mainRec) mediaRecorderRef.current = mainRec;
    }

    return () => {
      if (compositeLoopRef.current) {
        cancelAnimationFrame(compositeLoopRef.current);
        compositeLoopRef.current = null;
      }
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
      canvasRef.current = null;
    };
  }, [inCall, remoteStream]);

  // 원격 스트림 수신 시 STT용 저화질 오디오만 녹화 (상담자 음성 → audio_user)
  useEffect(() => {
    if (!inCall || !remoteStream || remoteAudioRecorderRef.current) return;
    const audioTracks = remoteStream.getAudioTracks();
    if (audioTracks.length === 0) return;
    const audioOnlyStream = new MediaStream(audioTracks);
    const opts = getSupportedRecorderOptions(audioOnlyStream);
    remoteAudioChunksRef.current = [];
    const rec = startMediaRecorderSafe(
      audioOnlyStream,
      { mimeType: opts.mimeType, audioBitsPerSecond: opts.audioBitsPerSecond ?? 64000 },
      (data) => remoteAudioChunksRef.current.push(data),
      () => {
        remoteAudioBlobRef.current = new Blob(remoteAudioChunksRef.current, {
          type: opts.mimeType?.split(';')[0] || 'audio/webm',
        });
      }
    );
    if (!rec) return;
    remoteAudioRecorderRef.current = rec;
    return () => {
      if (rec.state === 'recording') rec.stop();
      remoteAudioRecorderRef.current = null;
    };
  }, [inCall, remoteStream]);

  const startCall = async () => {
    if (typeof window === 'undefined') return;

    if (!window.isSecureContext) {
      alert(
        '카메라/마이크는 보안 연결(HTTPS) 또는 localhost에서만 사용할 수 있습니다.\n' +
          '주소창이 https:// 또는 http://localhost 로 시작하는지 확인해 주세요.'
      );
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      alert(
        '이 브라우저는 카메라/마이크 접근을 지원하지 않습니다.\n' +
          'Chrome, Edge, Firefox, Safari 최신 버전을 사용해 주세요.'
      );
      return;
    }

    const peer = peerRef.current;
    if (!peer || !peer.open) {
      if (peerError) {
        alert(
          '연결에 실패했습니다. 같은 계정으로 다른 탭이 열려 있으면 닫고, 페이지를 새로고침한 뒤 다시 시도해 주세요.'
        );
      } else {
        alert('연결 준비가 아직 완료되지 않았습니다. 잠시 후 다시 시도해 주세요.');
      }
      return;
    }

    const oppositeEmail = isSystem
      ? (counselInfo?.client?.email || '').trim().toLowerCase()
      : (counselInfo?.counselor?.email || '').trim().toLowerCase();
    const oppositeSafeId = getSafePeerId(oppositeEmail);
    if (!oppositeSafeId) {
      alert('상대방 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: true,
        });
      } catch (firstErr) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false,
          });
        } catch (videoOnlyErr) {
          throw firstErr;
        }
      }
      if (!stream) throw new Error('미디어 스트림을 얻지 못했습니다.');

      localStreamRef.current = stream;
      setInCall(true);
      setRemoteStream(null);
      setRecordingReady(false);
      setRecordedBlob(null);
      setSummaryResult('');
      recordedChunksRef.current = [];
      finalizeOnceRef.current = false;

      // 상담사만 통화 걸기 가능 → 상담자(USER) 쪽 Peer에 발신
      const call = peer.call(String(oppositeSafeId), stream);
      if (!call) {
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
        setInCall(false);
        alert('통화 연결에 실패했습니다. 상대방이 같은 화상상담 페이지에 있는지 확인 후 다시 시도해 주세요.');
        return;
      }
      currentCallRef.current = call;
      call.on('stream', (s) => {
        setRemoteStream(s);
        if (isSystem) {
          const conn = peer.connect(String(oppositeSafeId));
          if (conn) {
            dataConnRef.current = conn;
            conn.on('open', () => {
              conn.on('data', (data) => {
              const obj = typeof data === 'string' ? JSON.parse(data) : data;
              if (obj?.type === 'control' && obj?.action === 'end_call') {
                endCallRef.current?.();
                return;
              }
              if (obj?.type === 'chat' && obj?.text != null) {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now() + Math.random(),
                    sender: 'USER',
                    senderName: '상담자',
                    text: obj.text,
                    time: new Date((obj.time || Date.now())).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                    timeMs: obj.time,
                  },
                ]);
              }
            });
          });
          }
        }
      });
      call.on('close', () => {
        setRemoteStream(null);
        setInCall(false);
        currentCallRef.current = null;
      });
      call.on('error', (err) => {
        console.error('[PeerJS] 발신 오류:', err);
      });

      // 1) 로컬 다운로드용 고화질 영상은 단일/합성 녹화 useEffect에서 시작 (상담사+상담자 함께 저장)
      // 2) STT용 저화질 음성 (상담사 쪽) — 영상 여부와 관계없이 항상 오디오만 64kbps로 별도 녹음
      const localAudioTracks = stream.getAudioTracks();
      if (localAudioTracks.length > 0) {
        const localAudioOnlyStream = new MediaStream(localAudioTracks);
        const sttAudioOpts = getSupportedRecorderOptions(localAudioOnlyStream);
        const sttMime = sttAudioOpts.mimeType?.startsWith('audio/') ? sttAudioOpts.mimeType : 'audio/webm';
        const audioRec = startMediaRecorderSafe(
          localAudioOnlyStream,
          { mimeType: sttMime, audioBitsPerSecond: 64000 },
          (data) => localAudioChunksRef.current.push(data),
          () => {
            localAudioBlobRef.current = new Blob(localAudioChunksRef.current, {
              type: sttMime?.split(';')[0] || 'audio/webm',
            });
          }
        );
        if (audioRec) localAudioRecorderRef.current = audioRec;
      }
    } catch (err) {
      console.error('미디어 장치 오류:', err);
      const name = err?.name || '';
      const msg = err?.message || String(err);
      if (name === 'NotSupportedError' || msg.includes('MediaRecorder')) {
        alert(
          '이 브라우저에서는 녹화를 지원하지 않습니다. 통화는 가능합니다.\n\n' +
            'Chrome 또는 Edge 최신 버전을 사용해 보세요.'
        );
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
        setInCall(false);
        return;
      }
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || msg.includes('Permission')) {
        alert(
          '카메라/마이크 접근이 거부되었습니다.\n\n' +
            '• 브라우저 주소창 왼쪽 자물쇠(또는 아이콘)를 클릭한 뒤 카메라/마이크를 "허용"으로 설정해 주세요.\n' +
            '• 또는 브라우저 설정에서 이 사이트의 카메라·마이크 권한을 허용한 뒤 페이지를 새로고침해 주세요.'
        );
      } else if (name === 'NotFoundError' || msg.includes('NotFound')) {
        alert('연결된 카메라 또는 마이크를 찾을 수 없습니다. 장치가 연결되어 있는지 확인해 주세요.');
      } else if (name === 'NotReadableError' || name === 'AbortError') {
        alert(
          '카메라 또는 마이크를 사용할 수 없습니다. 다른 프로그램에서 사용 중이 아닌지 확인한 뒤 다시 시도해 주세요.'
        );
      } else {
        alert(
          '카메라/마이크에 접근할 수 없습니다.\n\n' +
            '1) 주소가 https:// 또는 http://localhost 인지 확인\n' +
            '2) 브라우저에서 이 사이트의 카메라·마이크 권한 허용\n' +
            '3) 페이지 새로고침 후 다시 통화 걸기\n\n' +
            `오류: ${msg}`
        );
      }
    }
  };

  /** 통화 종료 후 1회 실행: 저화질 음성(상담사/상담자) + 채팅 → testchatpy STT → msg_data·summary → chat_msg 저장 */
  const finalizeAndSaveOnce = async () => {
    if (finalizeOnceRef.current) return;
    if (!isSystem || !counselInfo) return;
    finalizeOnceRef.current = true;

    const chatMessages = (messagesRef.current || []).map((m) => ({
      type: 'chat',
      speaker: m.sender === 'SYSTEM' ? 'cnsler' : 'user',
      text: m.text,
      timestamp: String(m.timeMs ?? Date.now()),
    }));

    const apiUrl = (SUMMARY_API_URL || '').replace(/\/$/, '');
    let finalMessages = chatMessages;
    let finalSummary = '(요약 없음)';

    if (apiUrl) {
      try {
        let waited = 0;
        const maxWait = 3000;
        const step = 200;
        while (waited < maxWait) {
          const localBlob = localAudioBlobRef.current;
          const remoteBlob = remoteAudioBlobRef.current;
          const localReady = localBlob && localBlob.size > 0;
          const remoteReady = remoteBlob && remoteBlob.size > 0;
          if (localReady && remoteReady) break;
          await new Promise((r) => setTimeout(r, step));
          waited += step;
        }

        const form = new FormData();
        form.append('msg_data', JSON.stringify(chatMessages));
        const localBlob = localAudioBlobRef.current;  // STT용 저화질 상담사 음성
        const remoteBlob = remoteAudioBlobRef.current; // STT용 저화질 상담자 음성
        if (remoteBlob && remoteBlob.size > 0) {
          form.append('audio_user', remoteBlob, 'user.webm');
        }
        if (localBlob && localBlob.size > 0) {
          form.append('audio_cnsler', localBlob, 'cnsler.webm');
        }

        const res = await fetch(`${apiUrl}/api/summarize`, {
          method: 'POST',
          body: form,
        });
        if (res.ok) {
          const apiResult = await res.json();
          finalMessages = Array.isArray(apiResult?.msg_data) ? apiResult.msg_data : chatMessages;
          finalSummary = (apiResult?.summary && String(apiResult.summary)) || finalSummary;
        }
      } catch (e) {
        console.warn('요약 API 오류:', e);
      }
    }

    try {
      const { data: existing } = await supabase
        .from('chat_msg')
        .select('chat_id')
        .eq('cnsl_id', id)
        .maybeSingle();

      const payload = {
        msg_data: { messages: finalMessages },
        summary: finalSummary,
        role: 'cnsler',
        cnsler_id: counselInfo.counselor?.email ?? '',
        member_id: counselInfo.client?.email ?? '',
      };

      if (existing?.chat_id) {
        await supabase.from('chat_msg').update(payload).eq('chat_id', existing.chat_id);
      } else {
        await supabase.from('chat_msg').insert({
          cnsl_id: Number(id) || id,
          ...payload,
        });
      }
      setSummaryResult(finalSummary);
    } catch (e) {
      console.error('chat_msg 저장 실패:', e);
    }
  };

  const endCall = () => {
    endCallRef.current = null;
    try {
      dataConnRef.current?.send(
        JSON.stringify({ type: 'control', action: 'end_call', time: Date.now() })
      );
    } catch (_) {}
    try {
      dataConnRef.current?.close();
    } catch (_) {}
    dataConnRef.current = null;
    if (currentCallRef.current) {
      try {
        currentCallRef.current.close();
      } catch (_) {}
      currentCallRef.current = null;
    }
    remoteStream?.getTracks?.().forEach((t) => t.stop());
    setRemoteStream(null);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (localAudioRecorderRef.current?.state === 'recording') {
      localAudioRecorderRef.current.stop();
    }
    if (remoteAudioRecorderRef.current?.state === 'recording') {
      remoteAudioRecorderRef.current.stop();
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setInCall(false);
    setTimeout(() => finalizeAndSaveOnce(), 1200);
  };

  useEffect(() => {
    endCallRef.current = endCall;
    return () => {
      endCallRef.current = null;
    };
  });

  const downloadRecording = () => {
    if (!recordedBlob || !counselInfo) return;
    const dateStr = (counselInfo.startedAtRaw || '').replace(/[\s.:]/g, '-') || '녹화';
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `화상상담_녹화_${dateStr}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed) return;
    const senderRole = isSystem ? 'SYSTEM' : 'USER';
    const senderName = isSystem
      ? counselInfo?.counselor?.nickname
      : counselInfo?.client?.nickname;
    const timeMs = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: timeMs,
        sender: senderRole,
        senderName: senderName || (senderRole === 'SYSTEM' ? '상담사' : '상담자'),
        text: trimmed,
        time: new Date(timeMs).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        timeMs,
      },
    ]);
    setInputMessage('');
    try {
      dataConnRef.current?.send(
        JSON.stringify({
          type: 'chat',
          text: trimmed,
          time: timeMs,
          sender: isSystem ? 'cnsler' : 'user',
        })
      );
    } catch (err) {
      console.warn('채팅 전송 실패:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-500">
        로딩 중...
      </div>
    );
  }

  if (error || !counselInfo) {
    return (
      <div className="max-w-[1520px] mx-auto px-8 py-8">
        <p className="text-red-600">{error || '상담 정보가 없습니다.'}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  const oppositeLabel = isSystem ? '상담자' : '상담사';
  const oppositeInfo = isSystem ? counselInfo.client : counselInfo.counselor;

  const layout = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">화상 상담</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {inCall && (
            <>
              <button
                type="button"
                onClick={endCall}
                className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                통화 종료
              </button>
              <span className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold">
                상담 진행 중
              </span>
            </>
          )}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            뒤로 가기
          </button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 min-h-[520px] lg:h-[600px]">
        {/* 좌측: 상담 시작 / 상담 내용(300px 스크롤) / 상담자 정보 / 페르소나·프로필 */}
        <div className="lg:w-[400px] xl:w-[440px] lg:h-[600px] flex flex-col bg-white rounded-2xl shadow-lg p-4 overflow-hidden shrink-0">
          <div className="shrink-0 py-2 border-b border-gray-100">
            <p className="text-xs text-gray-500">상담 시작</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{counselInfo.startedAt}</p>
          </div>
          <div className="shrink-0 py-3 border-b border-gray-100 h-[300px] flex flex-col min-h-0 overflow-hidden">
            <p className="text-xs font-semibold text-gray-500 mb-1">상담 내용</p>
            <p className="text-xs font-medium text-gray-800">{counselInfo.title}</p>
            <div className="flex-1 min-h-0 overflow-y-auto mt-1.5">
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap pr-1">
                {counselInfo.content || '(내용 없음)'}
              </p>
            </div>
          </div>
          <div className="shrink-0 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-1.5">{oppositeLabel} 정보</p>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                {!isSystem && counselInfo.counselor.profile && /^\s*(https?:\/\/|\/)/.test(String(counselInfo.counselor.profile)) ? (
                  <img
                    src={counselInfo.counselor.profile}
                    alt={counselInfo.counselor.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-bold">
                    {oppositeInfo.nickname?.slice(0, 1) || '?'}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">{oppositeInfo.nickname || '-'}</p>
                {isSystem && (
                  <p className="text-xs text-gray-600">
                    {counselInfo.client.gender}
                    {counselInfo.client.age != null && ` / ${counselInfo.client.age}세`}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {!isSystem && (
              <div className="py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-1">상담사 프로필</p>
                {counselInfo.counselor.profile && !/^\s*(https?:\/\/|\/)/.test(String(counselInfo.counselor.profile)) ? (
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {counselInfo.counselor.profile}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">(프로필 이미지로만 등록된 경우)</p>
                )}
              </div>
            )}
            {isSystem && counselInfo.client.persona && (
              <div className="py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-1">상담자 페르소나</p>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {counselInfo.client.persona}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 우측: 화상 통화 영역 - 줄인 뷰포트/모바일에서도 항상 출력 (고정 높이), PC 600px */}
        <div className="flex-1 w-full h-[300px] min-h-[300px] lg:h-[600px] bg-gray-900 rounded-2xl overflow-hidden relative shrink-0">
          <div className="absolute inset-0 w-full h-full bg-gray-800">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            {!inCall && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80">
                <p className="text-lg">화상 통화 영역</p>
                {typeof window !== 'undefined' && !window.isSecureContext && (
                  <p className="mt-2 text-amber-300 text-sm text-center max-w-md">
                    카메라/마이크는 HTTPS 또는 localhost에서만 사용 가능합니다.
                  </p>
                )}
                {peerError && (
                  <p className="mt-2 text-amber-300 text-sm text-center max-w-md px-4">
                    {peerError}
                  </p>
                )}
                {isSystem && (
                  <>
                    {!peerReady && !peerError && (
                      <p className="mt-2 text-white/60 text-sm">연결 준비 중...</p>
                    )}
                    <button
                      type="button"
                      onClick={startCall}
                      disabled={!peerReady}
                      className="mt-4 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      통화 걸기
                    </button>
                  </>
                )}
                {!isSystem && (
                  <>
                    <p className="mt-4 text-sm">상담사가 통화를 걸 때까지 기다려 주세요.</p>
                    {receiveCallError && (
                      <p className="mt-2 text-amber-300 text-sm text-center max-w-md px-4">
                        {receiveCallError}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          {/* 모바일: 내 화면 비표시(오프스크린). PC: 우하단 PiP. 합성 녹화용으로 DOM 유지 */}
          {inCall && (
            <div className="absolute -left-[9999px] lg:left-auto right-4 bottom-4 w-[160px] h-[120px] lg:w-[240px] lg:h-[180px] rounded-xl overflow-hidden border-2 border-white shadow-xl bg-gray-700">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 하단: 통화 종료 후 녹화 다운로드(상담사·상담자 모두), 용량 표기, 상담사 요약 */}
      <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 mt-4">
        <div className="flex items-center gap-3 flex-wrap">
          {!inCall && (recordingReady || recordedBlob) && (
            <>
              <button
                type="button"
                onClick={downloadRecording}
                className="px-5 py-2.5 rounded-xl bg-gray-200 text-gray-600 font-medium hover:bg-gray-300 transition"
              >
                녹화 다운로드
              </button>
              {recordedBlob?.size != null && (
                <span className="text-xs text-gray-500">
                  (용량: {formatFileSize(recordedBlob.size)})
                </span>
              )}
            </>
          )}
        </div>
        {isSystem && summaryResult && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">상담 요약</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{summaryResult}</p>
          </div>
        )}
      </div>

      {/* 채팅: 통화가 연결된 후에만 사용 가능. 모바일에서 푸터에 가리지 않도록 하단 여백 */}
      <div className="mt-6 mb-12 lg:mb-0 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col min-h-0" style={{ minHeight: '200px' }}>
        <div className="px-4 py-2 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">채팅</h2>
        </div>
        {!inCall ? (
          <div className="flex-1 flex items-center justify-center min-h-[160px] p-4">
            <p className="text-sm text-gray-400 text-center">
              통화가 연결된 후 채팅을 사용할 수 있습니다.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 p-4 min-h-[160px] max-h-[280px]">
              {messages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">메시지를 입력해 보내주세요.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === (isSystem ? 'SYSTEM' : 'USER') ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        msg.sender === (isSystem ? 'SYSTEM' : 'USER')
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-xs font-semibold opacity-90">{msg.senderName}</p>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className="text-xs mt-1 opacity-80">{msg.time}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-4 border-t border-gray-100">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="메시지를 입력하세요"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
                aria-label="전송"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* 모바일: 채팅 입력란 푸터에 가리지 않도록 하단 여백·safe-area 적용 */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] px-4 py-4">
        <div
          className="max-w-[358px] mx-auto flex flex-col min-h-[calc(100vh-2rem)]"
          style={{ paddingBottom: 'max(8rem, env(safe-area-inset-bottom, 8rem))' }}
        >
          {layout}
        </div>
      </div>
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-8 flex flex-col min-h-screen">{layout}</div>
      </div>
    </>
  );
};

export default VisualChat;
