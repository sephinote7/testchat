import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

function normalizeRole(rawRole) {
  if (!rawRole) return rawRole;
  const lower = (rawRole || '').toLowerCase();
  if (lower === 'member') return 'USER';
  if (lower === 'cnsler' || lower === 'counselor') return 'SYSTEM';
  if (lower === 'user' || lower === 'system') return lower.toUpperCase();
  return (rawRole || '').toUpperCase();
}

function roleDisplayLabel(role) {
  return role === 'USER' ? '상담자' : '상담사';
}

function mapMemberRow(row) {
  if (!row) return null;
  const emailVal = row.email ?? row.member_id;
  return {
    id: row.id ?? emailVal,
    email: emailVal,
    role: normalizeRole(row.role),
    nickname: row.nickname,
    mbti: row.mbti,
    persona: row.persona,
    profile: row.profile,
  };
}

/**
 * cnsl_tp=4 상담사 1:1 채팅 (텍스트)
 * 라우트: /chat/counselor/:cnsl_id
 * 좌측 정보 패널, 우측 채팅 영역. chat_msg 사용.
 */
const CounselorChat = () => {
  const { cnsl_id } = useParams();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [other, setOther] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [cnslStat, setCnslStat] = useState(null); // A=대기, C=진행중, D=완료
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [cnslInfo, setCnslInfo] = useState(null);
  const [summary, setSummary] = useState(null);

  const chatScrollRefMobile = useRef(null);
  const chatScrollRefPc = useRef(null);
  const fetchChatMessagesRef = useRef(null);
  const lastLocalAddAtRef = useRef(0);

  useEffect(() => {
    const init = async () => {
      if (!cnsl_id) {
        setErrorMsg('유효하지 않은 상담방입니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg('');

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          setErrorMsg('로그인 정보가 없습니다. 다시 로그인해 주세요.');
          setLoading(false);
          return;
        }
        const currentEmail = user.email;

        const cnslIdNum = parseInt(cnsl_id, 10);
        if (isNaN(cnslIdNum) || cnslIdNum <= 0) {
          setErrorMsg('유효하지 않은 상담방입니다.');
          setLoading(false);
          return;
        }

        const { data: cnslRow, error: cnslErr } = await supabase
          .from('cnsl_reg')
          .select('member_id, cnsler_id, cnsl_stat, cnsl_tp, cnsl_title, cnsl_content')
          .eq('cnsl_id', cnslIdNum)
          .maybeSingle();

        if (cnslErr || !cnslRow) {
          setErrorMsg('해당 상담방 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        const cnslTp = String(cnslRow.cnsl_tp || '').trim();
        if (cnslTp !== '4') {
          setErrorMsg('해당 상담 유형(cnsl_tp=4)이 아닙니다.');
          setLoading(false);
          return;
        }

        if (cnslRow.cnsl_stat === 'D') {
          setErrorMsg('완료된 상담은 재진입할 수 없습니다.');
          setLoading(false);
          return;
        }

        const stat = String(cnslRow.cnsl_stat || 'A').trim().toUpperCase() || 'A';
        if (stat === 'A') {
          const { data: inProgressRows } = await supabase
            .from('cnsl_reg')
            .select('cnsl_id, member_id, cnsler_id')
            .eq('cnsl_tp', '4')
            .eq('cnsl_stat', 'C');
          const inProgressItem = inProgressRows?.find(
            (r) => (String(r.member_id || '') === currentEmail || String(r.cnsler_id || '') === currentEmail) && Number(r.cnsl_id) !== cnslIdNum
          );
          if (inProgressItem?.cnsl_id) {
            setLoading(false);
            navigate(`/chat/counselor/${inProgressItem.cnsl_id}`, { replace: true });
            return;
          }
        }

        setCnslStat(stat);
        const member_id = cnslRow.member_id || '';
        const cnsler_id = cnslRow.cnsler_id || '';

        const isMemberSide = member_id === currentEmail;
        const isCnslerSide = cnsler_id === currentEmail;

        if (!isMemberSide && !isCnslerSide) {
          setErrorMsg('해당 상담방에 대한 접근 권한이 없습니다.');
          setLoading(false);
          return;
        }

        const partnerEmail = isMemberSide ? cnsler_id : member_id;

        const { data: memberRows, error: memberError } = await supabase
          .from('member')
          .select('id, email, role, nickname, mbti, persona, profile')
          .in('email', [currentEmail, partnerEmail]);

        if (memberError || !memberRows || memberRows.length < 2) {
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

        if (isMemberSide) {
          setMe({ ...meMapped, role: 'USER' });
          setOther({ ...otherMapped, role: 'SYSTEM' });
        } else {
          setMe({ ...meMapped, role: 'SYSTEM' });
          setOther({ ...otherMapped, role: 'USER' });
        }

        setCnslInfo({
          title: cnslRow.cnsl_title || '',
          content: cnslRow.cnsl_content || '',
          requesterNick: memberRows.find((m) => (m.email ?? m.member_id) === member_id)?.nickname || member_id,
        });
      } catch (error) {
        console.error('CounselorChat 초기화 오류', error);
        setErrorMsg('상담 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [cnsl_id]);

  const mapApiMessagesToUI = (list) =>
    (Array.isArray(list) ? list : []).map((msg) => {
      const role = (msg.role || '').toLowerCase() === 'counselor' ? 'SYSTEM' : 'USER';
      const senderEmail = role === 'SYSTEM' ? msg.cnslerId : msg.memberId;
      const nickname =
        senderEmail === me?.email ? me?.nickname : (other?.nickname ?? senderEmail ?? role);
      const createdAt = msg.createdAt ?? msg.created_at;
      return {
        id: msg.chatId ?? `msg-${createdAt ?? Date.now()}`,
        role,
        nickname: nickname || (role === 'SYSTEM' ? '상담사' : '상담자'),
        text: msg.content ?? '',
        timestamp: createdAt ? (typeof createdAt === 'number' ? createdAt : new Date(createdAt).getTime()) : Date.now(),
      };
    });

  const fetchFromSupabase = async () => {
    const cnslIdNum = parseInt(cnsl_id, 10);
    if (isNaN(cnslIdNum) || cnslIdNum <= 0) return [];
    const { data: rows, error } = await supabase
      .from('chat_msg')
      .select('chat_id, msg_data, summary, member_id, cnsler_id')
      .eq('cnsl_id', cnslIdNum)
      .order('created_at', { ascending: false });

    if (error) return [];
    if (!rows?.length) return [];
    const row = rows[0];
    const content = row?.msg_data?.content;
    if (!Array.isArray(content)) return [];

    const memberId = row.member_id || '';
    const cnslerId = row.cnsler_id || '';
    if (row.summary) {
      try {
        const s = typeof row.summary === 'string' ? JSON.parse(row.summary) : row.summary;
        setSummary(s.summary || s.summary_line || null);
      } catch {
        setSummary(row.summary);
      }
    }

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
    if (!cnsl_id || !me?.email) return;
    const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    const apiBase = base.endsWith('/api') ? base : base ? `${base}/api` : '';

    try {
      let list = [];
      list = await fetchFromSupabase();
      if (list.length === 0 && apiBase) {
        try {
          const res = await fetch(`${apiBase}/cnsl/${cnsl_id}/chat`, {
            headers: { Accept: 'application/json', 'X-User-Email': me.email },
            mode: 'cors',
          });
          if (res.ok) {
            const data = await res.json();
            list = Array.isArray(data) ? data : [];
          }
        } catch {
          /* ignore */
        }
      }
      const mapped = mapApiMessagesToUI(list);
      setChatMessages((prev) => {
        if (mapped.length > 0) return mapped;
        if (Date.now() - lastLocalAddAtRef.current < 5000 && prev.length > 0) return prev;
        return mapped;
      });
    } catch (err) {
      console.warn('채팅 조회 실패:', err);
      const list = await fetchFromSupabase();
      setChatMessages(mapApiMessagesToUI(list));
    }
  };
  fetchChatMessagesRef.current = fetchChatMessages;

  const updateCnslStatApi = async (stat) => {
    const base = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
    if (!base || !me?.email) return false;
    const apiBase = base.endsWith('/api') ? base : `${base}/api`;
    try {
      const res = await fetch(`${apiBase}/cnsl/${cnsl_id}/stat`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': me.email },
        body: JSON.stringify({ cnslStat: stat }),
      });
      if (res.ok) {
        setCnslStat(stat);
        return true;
      }
    } catch (e) {
      console.warn('cnsl_stat 업데이트 실패:', e);
    }
    return false;
  };

  const saveSummaryAndMsgData = async () => {
    const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    const apiBase = base.endsWith('/api') ? base : base ? `${base}/api` : '';
    const basePayload = chatMessages.map((msg) => ({
      type: 'chat',
      speaker: msg.role === 'SYSTEM' ? 'cnsler' : 'user',
      text: msg.text,
      timestamp: String(msg.timestamp || Date.now()),
    }));

    let summaryText = '';
    let summaryLine = '';
    if (basePayload.length > 0) {
      const texts = basePayload.filter((x) => x.text && typeof x.text === 'string').map((x) => x.text).slice(0, 10);
      summaryText = texts.length > 0 ? texts.join(' ').slice(0, 300) : `상담 (${new Date().toLocaleString('ko-KR')})`.slice(0, 300);
      summaryLine = texts[0] || summaryText;
    } else {
      summaryText = `상담 (${new Date().toLocaleString('ko-KR')})`.slice(0, 300);
      summaryLine = summaryText;
    }

    if (apiBase) {
      try {
        const r = await fetch(`${apiBase}/cnsl/${cnsl_id}/chat/summary-full`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-User-Email': me.email ?? '' },
          body: JSON.stringify({ summary: summaryText, summary_line: summaryLine, msg_data: basePayload }),
          mode: 'cors',
        });
        if (r.ok) return;
      } catch (err) {
        console.warn('summary-full API 실패:', err);
      }
    }

    const cnslIdNum = parseInt(cnsl_id, 10);
    if (isNaN(cnslIdNum) || !me || !other) return;
    const member_id = me.role === 'USER' ? me.email : other.email;
    const cnsler_id = me.role === 'USER' ? other.email : me.email;
    const msg_data = { content: basePayload };
    const summaryPayload = JSON.stringify({ summary: summaryText, summary_line: summaryLine });
    const { data: existing } = await supabase.from('chat_msg').select('chat_id').eq('cnsl_id', cnslIdNum).maybeSingle();
    if (existing) {
      await supabase.from('chat_msg').update({ msg_data, summary: summaryPayload }).eq('cnsl_id', cnslIdNum);
    } else {
      await supabase.from('chat_msg').insert({ cnsl_id: cnslIdNum, member_id, cnsler_id, role: 'user', msg_data, summary: summaryPayload });
    }
  };

  const handleStartCounseling = async () => {
    if (me?.role !== 'SYSTEM' || cnslStat !== 'A') return;
    await updateCnslStatApi('C');
  };

  const handleEndCounseling = async () => {
    if (cnslStat !== 'C') return;
    await saveSummaryAndMsgData();
    const ok = await updateCnslStatApi('D');
    if (!ok) setCnslStat('C');
  };

  useEffect(() => {
    if (!me || !cnsl_id) return;
    fetchChatMessages();
  }, [cnsl_id, me?.email]);

  useEffect(() => {
    const scroll = (el) => el && (el.scrollTop = el.scrollHeight);
    scroll(chatScrollRefMobile.current);
    scroll(chatScrollRefPc.current);
  }, [chatMessages]);

  useEffect(() => {
    if (!cnsl_id || !me?.email) return;
    const cnslIdNum = parseInt(cnsl_id, 10);
    if (isNaN(cnslIdNum) || cnslIdNum <= 0) return;

    const channel = supabase
      .channel(`counselor_chat:${cnsl_id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_msg', filter: `cnsl_id=eq.${cnslIdNum}` }, () =>
        fetchChatMessagesRef.current?.()
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_msg', filter: `cnsl_id=eq.${cnslIdNum}` }, () =>
        fetchChatMessagesRef.current?.()
      )
      .subscribe();

    const poll = setInterval(() => fetchChatMessagesRef.current?.(), 5000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [cnsl_id, me?.email]);

  const insertChatToSupabase = async (trimmed) => {
    const cnslIdNum = parseInt(cnsl_id, 10);
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

    const content = Array.isArray(existing?.msg_data?.content) ? [...existing.msg_data.content, entry] : [entry];
    const msg_data = { content };

    if (existing) {
      const { error } = await supabase.from('chat_msg').update({ msg_data }).eq('cnsl_id', cnslIdNum);
      return error ? null : { chatId: existing.chat_id };
    }
    const { data: inserted, error } = await supabase
      .from('chat_msg')
      .insert({ cnsl_id: cnslIdNum, member_id, cnsler_id, role: speaker, msg_data })
      .select('chat_id')
      .single();
    return error ? null : { chatId: inserted?.chat_id };
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || !me) return;

    const now = Date.now();
    setChatMessages((prev) => [...prev, { id: `local-${now}`, role: me.role, nickname: me.nickname ?? '', text: trimmed, timestamp: now }]);
    lastLocalAddAtRef.current = now;
    setChatInput('');

    const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    const base = apiBase.endsWith('/api') ? apiBase : apiBase ? `${apiBase}/api` : '';
    const roleForApi = me.role === 'SYSTEM' ? 'counselor' : 'user';

    if (base) {
      try {
        const res = await fetch(`${base}/cnsl/${cnsl_id}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-User-Email': me.email ?? '' },
          body: JSON.stringify({ role: roleForApi, content: trimmed }),
          mode: 'cors',
        });
        if (res.ok) return;
      } catch (err) {
        console.warn('채팅 API 실패, Supabase fallback:', err);
      }
    }

    try {
      await insertChatToSupabase(trimmed);
    } catch (err) {
      console.error('채팅 저장 오류:', err);
    }
  };

  const peerRoleLabel = other?.role || 'USER';
  const peer = other || { nickname: '상담사', profile: '' };
  const memberInfo = me?.role === 'USER' ? me : other;
  const isInputDisabled = cnslStat !== 'C';
  const isBeforeStart = cnslStat === 'A';
  const isEnded = cnslStat === 'D';

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f3f7ff]">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#f3f7ff] gap-4">
        <p className="text-gray-800">{errorMsg}</p>
        <Link to="/chat/counselor" className="text-[#2f80ed] font-semibold hover:underline">
          상담 목록으로
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-white flex flex-col">
        <header className="bg-[#2f80ed] h-16 flex items-center justify-between px-4 text-white font-bold text-lg">
          <span>{peer.nickname} 상담</span>
          <div className="flex gap-2">
            {me?.role === 'SYSTEM' && isBeforeStart && (
              <button type="button" onClick={handleStartCounseling} className="h-8 px-3 rounded-lg bg-white/20 text-sm font-semibold">
                상담 시작
              </button>
            )}
            {!isEnded && !isBeforeStart && (
              <button type="button" onClick={handleEndCounseling} className="h-8 px-3 rounded-lg bg-white/20 text-sm font-semibold">
                상담 종료
              </button>
            )}
          </div>
        </header>
        <main className="flex-1 flex flex-col px-4 pt-4 pb-24 gap-3 min-h-0 overflow-y-auto">
          <section className="shrink-0 flex flex-col gap-2 rounded-2xl border border-[#e5e7eb] p-3 bg-[#f9fafb] max-h-[200px] overflow-y-auto">
            {cnslInfo && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">상담 정보</h2>
                {cnslInfo.title && <p className="font-medium text-gray-800 mb-0.5">{cnslInfo.title}</p>}
                {cnslInfo.requesterNick && <p className="text-xs text-[#6b7280] mb-1">예약자: {cnslInfo.requesterNick}</p>}
                {cnslInfo.content && <p className="text-xs text-[#374151] leading-relaxed">{cnslInfo.content}</p>}
              </div>
            )}
            {memberInfo && (
              <div className="border-t border-[#e5e7eb] pt-2 mt-2">
                <h2 className="text-base font-semibold text-gray-800 mb-1">상담자 정보</h2>
                <p className="text-sm font-medium text-gray-800">{memberInfo.nickname || memberInfo.email}</p>
                {memberInfo.mbti && <p className="text-xs text-[#6b7280]">MBTI: {memberInfo.mbti}</p>}
                {memberInfo.persona && <p className="text-xs text-[#374151] leading-relaxed mt-1">{memberInfo.persona}</p>}
              </div>
            )}
          </section>
          <div className="flex-1 min-h-[120px] flex flex-col gap-2 rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] overflow-hidden">
            <div ref={chatScrollRefMobile} className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
              {isEnded ? (
                <p className="text-sm text-[#6b7280] py-4 text-center">상담 종료 처리되었습니다.</p>
              ) : isBeforeStart && me?.role === 'USER' ? (
                <p className="text-sm text-[#6b7280] py-4 text-center">상담 시작까지 조금 기다려 주세요.</p>
              ) : chatMessages.length === 0 ? (
                <p className="text-xs text-[#9ca3af]">메시지를 입력해 주세요.</p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col gap-0.5 ${msg.role === me.role ? 'items-end' : 'items-start'}`}>
                    <p className="text-[10px] text-[#6b7280]">{msg.nickname}</p>
                    <div
                      className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-xs border ${
                        msg.role === me.role ? 'bg-[#e9f7ff] border-[#b8dcff] text-[#1d4ed8]' : 'bg-[#f0fffd] border-[#b7f2ec] text-[#0f766e]'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleChatSubmit} className="flex gap-2 p-3 border-t border-[#e5e7eb] shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isInputDisabled ? '상담 시작 후 메시지를 입력할 수 있습니다.' : '메시지를 입력하세요'}
                disabled={isInputDisabled}
                className={`flex-1 h-9 rounded-[10px] border border-[#dbe3f1] px-2 text-xs ${isInputDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              />
              <button type="submit" disabled={isInputDisabled} className="h-9 px-3 rounded-[10px] bg-[#2f80ed] text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                전송
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* PC: 좌측 정보 패널(채팅창 높이 맞춤), 우측 채팅 영역 */}
      <div className="hidden lg:flex w-full min-h-screen bg-[#f3f7ff]">
        <div className="w-full max-w-[1520px] mx-auto flex flex-col px-4 py-4">
          <header className="shrink-0 bg-gradient-to-r from-[#2f80ed] to-[#1d4ed8] h-20 flex items-center justify-between text-white font-bold text-2xl shadow-lg rounded-t-2xl px-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                {peer.nickname?.slice(0, 1) || '상'}
              </div>
              <div className="flex flex-col">
                <span>{peer.nickname} {roleDisplayLabel(peerRoleLabel)}</span>
                <span className="text-sm font-normal opacity-90">1:1 텍스트 상담</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {me?.role === 'SYSTEM' && isBeforeStart && (
                <button type="button" onClick={handleStartCounseling} className="h-10 px-5 rounded-xl bg-white/20 text-sm font-semibold hover:bg-white/30">
                  상담 시작
                </button>
              )}
              {!isEnded && !isBeforeStart && (
                <button type="button" onClick={handleEndCounseling} className="h-10 px-5 rounded-xl bg-white/20 text-sm font-semibold hover:bg-white/30">
                  상담 종료
                </button>
              )}
              <Link to="/chat/counselor" className="text-white/90 text-sm hover:underline">
                상담 목록
              </Link>
            </div>
          </header>

          <main className="flex-1 flex gap-4 pt-4 min-h-0">
            {/* 좌측 정보 패널 - 채팅 영역과 동일 높이 */}
            <div className="w-[480px] shrink-0 flex flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] min-h-0 self-stretch">
              {cnslInfo && (
                <div className="shrink-0 flex flex-col overflow-hidden border-b border-[#e5e7eb]">
                  <h3 className="text-xl font-semibold text-gray-800 px-4 py-3 shrink-0">상담 정보</h3>
                  <div className="overflow-y-auto px-4 py-2 text-sm text-[#374151] max-h-[120px]">
                    {cnslInfo.title && <p className="font-medium text-gray-800 mb-1">{cnslInfo.title}</p>}
                    {cnslInfo.requesterNick && <p className="text-[#6b7280] mb-1">예약자: {cnslInfo.requesterNick}</p>}
                    {cnslInfo.content && <p className="leading-relaxed whitespace-pre-line">{cnslInfo.content}</p>}
                  </div>
                </div>
              )}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden border-b border-[#e5e7eb]">
                <h3 className="text-lg font-semibold text-gray-800 px-4 py-3 shrink-0">상담자 정보</h3>
                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 text-sm text-[#374151]">
                  {memberInfo && (
                    <>
                      <p className="font-medium text-gray-800">{memberInfo.nickname || memberInfo.email}</p>
                      {memberInfo.mbti && <p className="text-[#6b7280] mt-1">MBTI: {memberInfo.mbti}</p>}
                      {memberInfo.persona && <p className="mt-2 leading-relaxed whitespace-pre-line">{memberInfo.persona}</p>}
                    </>
                  )}
                  {peer.profile && (
                    <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
                      <p className="text-xs font-semibold text-[#6b7280] mb-1">상담사 프로필</p>
                      <p className="leading-relaxed whitespace-pre-line">{peer.profile}</p>
                    </div>
                  )}
                  {summary && (
                    <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
                      <p className="text-xs font-semibold text-[#6b7280] mb-1">요약</p>
                      <p className="text-sm leading-relaxed">{summary}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 우측 채팅 영역 */}
            <div className="flex-1 min-w-0 flex flex-col rounded-2xl border border-[#e5e7eb] bg-white shadow-lg overflow-hidden min-h-0">
              <h3 className="text-xl font-semibold text-gray-800 px-6 py-4 border-b border-[#e5e7eb] shrink-0">채팅</h3>
              <div
                ref={chatScrollRefPc}
                className="flex-1 min-h-0 overflow-y-auto px-6 py-4 flex flex-col gap-3"
              >
                {isEnded ? (
                  <p className="text-base text-[#6b7280] py-8 text-center">상담 종료 처리되었습니다.</p>
                ) : isBeforeStart && me?.role === 'USER' ? (
                  <p className="text-base text-[#6b7280] py-8 text-center">상담 시작까지 조금 기다려 주세요.</p>
                ) : chatMessages.length === 0 ? (
                  <p className="text-sm text-[#9ca3af]">메시지를 입력해 주세요.</p>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === me.role ? 'items-end' : 'items-start'}`}>
                      <p className={`text-xs text-[#6b7280] ${msg.role === me.role ? 'text-right' : 'text-left'}`}>
                        {msg.nickname}
                      </p>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed border ${
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
              <form onSubmit={handleChatSubmit} className="flex gap-3 p-4 border-t border-[#e5e7eb] shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isInputDisabled ? '상담 시작 후 메시지를 입력할 수 있습니다.' : '메시지를 입력하세요'}
                  disabled={isInputDisabled}
                  className={`flex-1 h-12 rounded-xl border border-[#dbe3f1] px-4 text-sm focus:outline-none focus:border-[#2f80ed] ${isInputDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                />
                <button type="submit" disabled={isInputDisabled} className="h-12 px-6 rounded-xl bg-[#2f80ed] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  전송
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default CounselorChat;
