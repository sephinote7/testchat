import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { acceptCounsel, fetchCounselDetail, rejectCounsel } from '../../../api/counselApi';
import { useAuthStore } from '../../../store/auth.store';

const MyCounselDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const messagesEndRef = useRef(null);
  const { nickname, email } = useAuthStore();

  const [counselData, setCounselData] = useState(null);

  console.log('ㅇ르암ㄴ르망ㄴ리', counselData);
  // 채팅 메시지 (상담 진행중/완료 시 사용) - 테스트용 메시지 추가
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'counselor',
      senderName: '가을치',
      text: '안녕하세요 임살미님!\n#코인만담 #파이어족 되기 #워라밸잡기',
      time: '오전 4:06',
    },
    {
      id: 2,
      sender: 'client',
      senderName: '임살미',
      text: '안녕하세요 상담사님. 저 요즘 너무 힘들어요...',
      time: '오전 4:08',
    },
    {
      id: 3,
      sender: 'counselor',
      senderName: '가을치',
      text: '무엇이 가장 힘드신가요? 편하게 말씀해 주세요.',
      time: '오전 4:09',
    },
    {
      id: 4,
      sender: 'client',
      senderName: '임살미',
      text: '일이 너무 많고, 해야 할 일들을 계획은 하는데 실행에 옮기기가 어렵네요.',
      time: '오전 4:11',
    },
    {
      id: 5,
      sender: 'counselor',
      senderName: '가을치',
      text: '계획을 세우는 것과 실행하는 것 사이에 어떤 장벽이 있다고 느끼시나요?',
      time: '오전 4:13',
    },
    {
      id: 6,
      sender: 'client',
      senderName: '임살미',
      text: '완벽하게 하고 싶은 마음이 커서 시작하기가 두렵습니다.',
      time: '오전 4:15',
    },
    {
      id: 7,
      sender: 'counselor',
      senderName: '가을치',
      text: '완벽주의가 오히려 시작을 가로막고 있군요. 작은 것부터 시작해보는 건 어떨까요?',
      time: '오전 4:17',
    },
    {
      id: 8,
      sender: 'client',
      senderName: '임살미',
      text: '네, 좋은 방법인 것 같아요. 구체적으로 어떻게 해야 할까요?',
      time: '오전 4:19',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  // ========== 더미 데이터 끝 (여기까지 삭제) ==========

  // 상담 상태 매핑 (API → 내부 status)
  const mapStatus = (cnslStatNm) => {
    if (cnslStatNm === '상담 예정') return 'scheduled';
    if (cnslStatNm === '상담 진행 중') return 'inProgress';
    if (cnslStatNm === '상담 완료') return 'completed';
    return 'scheduled';
  };

  // 상담 상태 라벨
  const getStatusLabel = (status) => {
    if (status === 'scheduled') return { text: '상담 예정', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (status === 'inProgress')
      return {
        text: '상담 진행중',
        color: 'text-orange-600',
        bg: 'bg-orange-100',
      };
    if (status === 'completed') return { text: '상담 완료', color: 'text-green-600', bg: 'bg-green-100' };
    return { text: '상담 예정', color: 'text-blue-600', bg: 'bg-blue-100' };
  };

  const statusInfo = getStatusLabel(counselData?.status);

  // 상담 시작하기 (상담 예정 → 진행중)
  const handleStartCounsel = async () => {
    // TODO: DB 연동 시 API 호출
    // const response = await fetch(`/api/counselors/me/counsels/${id}/start`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    // const data = await response.json();

    // 상태 변경
    setCounselData({ ...counselData, status: 'inProgress' });

    // 초기 메시지 추가
    setMessages([
      {
        id: 1,
        sender: 'counselor',
        senderName: nickname,
        text: `안녕하세요 ${nickname}님!\n#코인만담 #파이어족 되기 #워라밸잡기`,
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  const handleAcceptCounsel = async () => {
    const data = await acceptCounsel({
      cnslId: parseInt(id),
      message: '늦지 않게 오쇼',
    });

    setCounselData({ ...counselData, status: 'inProgress' });
    // show modal
    console.log('accept', data);
    if (data) navigate('/system/info/counsel-reservation-list');
  };

  const handleRejectCounsel = async () => {
    const data = await rejectCounsel({
      cnslId: parseInt(id),
      reason: '진상은 안받아줍니다.',
    });

    console.log('reject', data);
    if (data) navigate('/system/info/counsel-reservation-list');
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // TODO: DB 연동 시 API 호출
    // await fetch(`/api/counselors/me/counsels/${id}/messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     message: inputMessage,
    //     senderType: 'counselor'
    //   })
    // });

    const newMessage = {
      id: messages.length + 1,
      sender: 'counselor',
      senderName: nickname,
      text: inputMessage,
      time: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
  };

  // 상담 완료하기 (진행중 → 완료)
  const handleCompleteCounsel = async () => {
    if (!window.confirm('상담을 완료하시겠습니까?')) return;

    // TODO: DB 연동 시 API 호출
    // await fetch(`/api/counselors/me/counsels/${id}/complete`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });

    setCounselData({ ...counselData, status: 'completed' });
  };

  // 메시지 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    const getCounselDetail = async () => {
      const data = await fetchCounselDetail(parseInt(id));
      setCounselData({
        ...data,
        status: mapStatus(data.cnslStatNm),
      });
      console.log('test', data);
    };

    getCounselDetail();
  }, [id]);

  // Enter 키로 메시지 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 상담 예정 화면
  const renderScheduledView = () => (
    <>
      {/* MOBILE */}
      <div className="lg:hidden min-h-screen bg-gray-200 pb-20">
        {/* 헤더 */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <img src="/logo.png" alt="고민순삭" className="h-8 mx-auto" />
          </div>
          <button onClick={() => navigate(-1)} className="px-3 py-1 border border-white rounded text-sm">
            뒤로가기
          </button>
        </div>

        {/* 제목 */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">상담 예약 내용</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusInfo.bg} ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>

        {/* 예약일자 */}
        <div className="px-4 mb-4">
          <p className="text-base text-gray-600">
            예약일자 : <span className="font-semibold text-gray-800">{counselData?.cnslDt}</span>
          </p>
        </div>

        {/* 상담 내용 */}
        <div className="mx-4 mb-6 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">상담 내용</h2>
            <h3 className="text-base font-semibold text-gray-800 mb-2">{counselData?.cnslTitle}</h3>
            <p className="text-sm text-gray-600 mb-4">예약자 : {counselData?.nickname}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{counselData?.cnslContent}</p>
          </div>
        </div>

        {/* 상담자 정보 */}
        <div className="px-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-3">상담자 정보</h2>
        </div>

        <div className="mx-4 mb-4 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden">
              <img
                src={'https://picsum.photos/200'}
                alt={email}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '';
                }}
              />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-lg">{nickname}</h4>
              <p className="text-sm text-gray-600">MBTI : {counselData?.mbti}</p>
              <p className="text-sm text-gray-500">
                성별 : {counselData?.gender} / 나이 : {counselData?.age}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">상담사 페르소나</h3>
            <p className="text-xs text-gray-600 leading-relaxed break-all">{counselData?.text}</p>
          </div>
        </div>

        {counselData?.cnslStatNm === '상담 예정' ? (
          <>
            {/* 상담 시작하기 */}
            <div className="flex justify-center">
              <button
                onClick={handleStartCounsel}
                className="px-20 py-5 bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white text-2xl font-bold rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                상담 시작하기
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 상담 수락/거절 버튼 */}
            <div className="flex justify-end gap-2.5 mr-5">
              <button
                onClick={handleRejectCounsel}
                className="bg-white text-blue-600 border border-blue-600 text-xs px-1 py-1.5 rounded-lg hover:bg-gray-200 transition"
              >
                상담 거절
              </button>
              <button
                onClick={handleAcceptCounsel}
                className="bg-white text-blue-600 border border-blue-600 text-xs px-1 py-1.5 rounded-lg hover:bg-gray-200 transition"
              >
                상담 수락
              </button>
            </div>
          </>
        )}
      </div>

      {/* PC VERSION */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <h1 className="text-4xl font-bold text-gray-800">상담 예약 내용</h1>
              <span className={`px-6 py-3 rounded-full text-xl font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-3 bg-white border-2 border-[#2563eb] text-[#2563eb] text-lg font-bold rounded-xl hover:bg-blue-50 transition-all"
            >
              뒤로가기
            </button>
          </div>

          {/* 예약 일자 */}
          <div className="mb-8">
            <p className="text-2xl text-gray-600">
              예약일자 : <span className="font-bold text-gray-800">{counselData?.cnslDt}</span>
            </p>
          </div>

          {/* 상담 내용 */}
          <div className="bg-white rounded-3xl p-10 shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">상담 내용</h2>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{counselData?.cnslTitle}</h3>
              <p className="text-base text-gray-600 mb-2">예약자 : {counselData?.nickname}</p>
            </div>
            <div className="space-y-4">
              <p className="text-base text-gray-700 leading-relaxed">{counselData?.cnslContent}</p>
            </div>
          </div>

          {/* 상담자 정보 */}
          <div className="bg-white rounded-3xl p-10 shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">상담자 정보</h2>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-32 h-32 rounded-full bg-gray-300 overflow-hidden">
                <img
                  src={'https://picsum.photos/200'}
                  alt={nickname}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '';
                  }}
                />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{nickname}</h3>
                <p className="text-lg text-gray-600 mb-1">MBTI : {counselData?.mbti}</p>
                <p className="text-base text-gray-500">
                  성별 : {counselData?.gender} / 나이 : {counselData?.age}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">상담사 페르소나</h3>
              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-base text-gray-700 leading-relaxed break-all">{counselData?.text}</p>
              </div>
            </div>
          </div>

          {counselData?.cnslStatNm === '상담 예정' ? (
            <>
              {/* 상담 시작하기 */}
              <div className="flex justify-center">
                <button
                  onClick={handleStartCounsel}
                  className="px-20 py-5 bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white text-2xl font-bold rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  상담 시작하기
                </button>
              </div>
            </>
          ) : (
            <>
              {/* 상담 수락/거절 버튼 */}
              <div className="flex justify-end gap-2.5 mr-5">
                <button
                  onClick={handleRejectCounsel}
                  className="bg-white text-blue-600 border border-blue-600 text-xs px-1 py-1.5 rounded-lg hover:bg-gray-200 transition"
                >
                  상담 거절
                </button>
                <button
                  onClick={handleAcceptCounsel}
                  className="bg-white text-blue-600 border border-blue-600 text-xs px-1 py-1.5 rounded-lg hover:bg-gray-200 transition"
                >
                  상담 수락
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  // 상담 진행중 화면 (채팅)
  const renderInProgressView = () => (
    <>
      {/* MOBILE */}
      <div className="lg:hidden min-h-screen bg-gray-50 flex flex-col">
        {/* 헤더 */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="font-bold text-lg">상담 상세 내용</h1>
            </div>
          </div>
          <button
            onClick={handleCompleteCounsel}
            className="px-4 py-2 bg-cyan-400 text-white rounded-md text-sm font-semibold hover:bg-cyan-500"
          >
            상담 완료
          </button>
        </div>

        {/* 예약일자 */}
        <div className="bg-white px-4 py-3 border-b">
          <p className="text-sm text-gray-600">
            예약일자 : <span className="font-semibold text-gray-800">{counselData?.cnslDt}</span>
          </p>
        </div>

        {/* 상담 내용 */}
        <div className="bg-white px-4 py-4 border-b">
          <h2 className="text-base font-bold text-gray-800 mb-2">상담 내용</h2>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">{counselData?.cnslTitle}</h3>
          <p className="text-xs text-gray-600 mb-2">예약자 : {counselData?.nickname}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{counselData?.cnslContent}</p>
        </div>

        {/* 상담자 정보 */}
        <div className="bg-white px-4 py-4 border-b">
          <h2 className="text-base font-bold text-gray-800 mb-3">상담자 정보</h2>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
              <img
                src={'https://picsum.photos/200'}
                alt={nickname}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '';
                }}
              />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">{nickname}</h4>
              <p className="text-xs text-gray-600">
                MBTI : {counselData?.mbti} / 성별 : {counselData?.gender} / 나이 : {counselData?.age}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">상담사 페르소나</h3>
            <p className="text-xs text-gray-600 leading-relaxed break-all line-clamp-3">{counselData?.text}</p>
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="flex-1 bg-white overflow-y-auto p-4 space-y-4">
          <h2 className="text-base font-bold text-gray-800 mb-4">상담사와의 상담 내용</h2>

          {/* 상담사 프로필 헤더 */}
          <div className="bg-blue-600 text-white p-4 rounded-lg flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white overflow-hidden">
              <img
                src={'https://picsum.photos/200'}
                alt={nickname}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '';
                }}
              />
            </div>
            <div>
              <p className="font-bold">{`안녕 상담사 ${nickname}입니다`}</p>
              <p className="text-sm">#코인만담 #파이어족 되기 #워라밸잡기</p>
            </div>
          </div>

          {/* 메시지 목록 */}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'counselor' ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[80%] ${
                  msg.sender === 'counselor' ? 'bg-white border border-gray-300' : 'bg-blue-500 text-white'
                } rounded-lg p-3`}
              >
                {msg.sender === 'counselor' && <p className="text-xs font-semibold mb-1">{msg.senderName}</p>}
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'counselor' ? 'text-gray-500' : 'text-blue-100'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="bg-white border-t p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="그 외 문의"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="bg-white border-t p-4 flex gap-3">
          <button className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50">
            뒤로 가기
          </button>
          <button
            onClick={handleCompleteCounsel}
            className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50"
          >
            상담 완료하기
          </button>
        </div>
      </div>

      {/* PC VERSION */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <h1 className="text-4xl font-bold text-gray-800">상담 상세 내용</h1>
              <span className={`px-6 py-3 rounded-full text-xl font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleCompleteCounsel}
                className="px-8 py-3 bg-cyan-400 text-white text-lg font-bold rounded-xl hover:bg-cyan-500 transition-all"
              >
                상담 완료
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-8 py-3 bg-white border-2 border-[#2563eb] text-[#2563eb] text-lg font-bold rounded-xl hover:bg-blue-50 transition-all"
              >
                뒤로가기
              </button>
            </div>
          </div>

          {/* 2열 레이아웃 - 새로운 비율 (왼쪽 작게, 오른쪽 채팅창 크게) */}
          <div className="flex gap-6">
            {/* 왼쪽: 상담 정보 - 크기 줄임 (원래의 약 1/3) */}
            <div className="w-[380px] flex-shrink-0 space-y-4">
              {/* 이전 버전 (1:1 비율) - 주석처리 */}
              {/* <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6"> */}
              {/* 예약 일자 */}
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <p className="text-sm text-gray-600">
                  예약일자 : <span className="font-bold text-gray-800">{counselData?.cnslDt}</span>
                </p>
              </div>

              {/* 상담 내용 */}
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <h2 className="text-base font-bold text-gray-800 mb-3">상담 내용</h2>
                <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">{counselData?.cnslTitle}</h3>
                <p className="text-xs text-gray-600 mb-2">예약자 : {counselData?.nickname}</p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{counselData?.cnslContent}</p>
                </div>
              </div>

              {/* 상담자 정보 */}
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <h2 className="text-base font-bold text-gray-800 mb-3">상담자 정보</h2>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                    <img
                      src={'https://picsum.photos/200'}
                      alt={nickname}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800 mb-1">{nickname}</h3>
                    <p className="text-xs text-gray-600">MBTI : {counselData?.mbti}</p>
                    <p className="text-xs text-gray-500">
                      {counselData?.gender} / {counselData?.age}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-2">상담사 페르소나</h3>
                  <div className="bg-gray-50 rounded-xl p-3 max-h-24 overflow-hidden">
                    <p className="text-xs text-gray-700 leading-relaxed break-all line-clamp-4">{counselData?.text}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 채팅 영역 - 크게 확장 */}
            <div
              className="flex-1 bg-white rounded-3xl shadow-xl flex flex-col"
              style={{ height: 'calc(100vh - 200px)' }}
            >
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">상담사와의 상담 내용</h2>
              </div>

              {/* 상담사 프로필 헤더 - 크기 축소 */}
              <div className="mx-4 mt-3 bg-blue-600 text-white p-3 rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white overflow-hidden">
                  <img
                    src={'https://picsum.photos/200'}
                    alt={nickname}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '';
                    }}
                  />
                </div>
                <div>
                  <p className="text-base font-bold">{`안녕 상담사 ${nickname}입니다`}</p>
                  <p className="text-xs">#코인만담 #파이어족 되기 #워라밸잡기</p>
                </div>
              </div>

              {/* 메시지 목록 - 간격 축소 */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'counselor' ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[70%] ${
                        msg.sender === 'counselor' ? 'bg-gray-100 border border-gray-200' : 'bg-blue-500 text-white'
                      } rounded-xl p-3`}
                    >
                      {msg.sender === 'counselor' && <p className="text-xs font-semibold mb-1">{msg.senderName}</p>}
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'counselor' ? 'text-gray-500' : 'text-blue-100'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력 영역 - 크기 축소 */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="그 외 문의"
                    className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 하단 버튼 - 크기 축소 */}
              <div className="px-4 pb-4 flex gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-xl text-base font-bold hover:bg-blue-50 transition"
                >
                  뒤로가기
                </button>
                <button
                  onClick={handleCompleteCounsel}
                  className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-xl text-base font-bold hover:bg-blue-50 transition"
                >
                  상담 완료하기
                </button>
              </div>
            </div>
          </div>
          {/* 주석처리된 이전 버전 닫는 태그 */}
          {/* </div>
          </div> */}
        </div>
      </div>
    </>
  );

  // 상담 완료 화면 (채팅 기록)
  const renderCompletedView = () => (
    <>
      {/* MOBILE */}
      <div className="lg:hidden min-h-screen bg-gray-50 flex flex-col">
        {/* 헤더 */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="font-bold text-lg">상담 상세 내용</h1>
            </div>
          </div>
          <span className="px-4 py-2 bg-orange-500 rounded-md text-sm font-semibold">상담 완료중</span>
        </div>

        {/* 예약일자 */}
        <div className="bg-white px-4 py-3 border-b">
          <p className="text-sm text-gray-600">
            예약일자 : <span className="font-semibold text-gray-800">{counselData?.cnslDt}</span>
          </p>
        </div>

        {/* 상담 내용 */}
        <div className="bg-white px-4 py-4 border-b">
          <h2 className="text-base font-bold text-gray-800 mb-2">상담 내용</h2>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">{counselData?.cnslTitle}</h3>
          <p className="text-xs text-gray-600 mb-2">예약자 : {counselData?.nickname}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{counselData?.cnslContent}</p>
        </div>

        {/* 상담자 정보 */}
        <div className="bg-white px-4 py-4 border-b">
          <h2 className="text-base font-bold text-gray-800 mb-3">상담자 정보</h2>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
              <img
                src={'https://picsum.photos/200'}
                alt={nickname}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '';
                }}
              />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">{nickname}</h4>
              <p className="text-xs text-gray-600">
                MBTI : {counselData?.mbti} / {counselData?.gender} / {counselData?.age}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">상담사 페르소나</h3>
            <p className="text-xs text-gray-600 leading-relaxed break-all line-clamp-3">{counselData?.text}</p>
          </div>
        </div>

        {/* 채팅 기록 */}
        <div className="flex-1 bg-white overflow-y-auto p-4 space-y-4">
          <h2 className="text-base font-bold text-gray-800 mb-4">상담사와의 상담 내용</h2>

          {/* 상담사 프로필 헤더 */}
          <div className="bg-blue-600 text-white p-4 rounded-lg flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white overflow-hidden">
              <img
                src={'https://picsum.photos/200'}
                alt={nickname}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '';
                }}
              />
            </div>
            <div>
              <p className="font-bold">{`안녕 상담사 ${nickname}입니다`}</p>
              <p className="text-sm">#코인만담 #파이어족 되기 #워라밸잡기</p>
            </div>
          </div>

          {/* 메시지 목록 (읽기 전용) */}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'counselor' ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[80%] ${
                  msg.sender === 'counselor' ? 'bg-white border border-gray-300' : 'bg-blue-500 text-white'
                } rounded-lg p-3`}
              >
                {msg.sender === 'counselor' && <p className="text-xs font-semibold mb-1">{msg.senderName}</p>}
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'counselor' ? 'text-gray-500' : 'text-blue-100'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 버튼 */}
        <div className="bg-white border-t p-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition"
          >
            상담 종료하기
          </button>
        </div>
      </div>

      {/* PC VERSION */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <h1 className="text-4xl font-bold text-gray-800">상담 상세 내용</h1>
              <span className="px-6 py-3 rounded-full text-xl font-bold bg-orange-100 text-orange-600">
                상담 완료중
              </span>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-3 bg-white border-2 border-[#2563eb] text-[#2563eb] text-lg font-bold rounded-xl hover:bg-blue-50 transition-all"
            >
              뒤로가기
            </button>
          </div>

          {/* 2열 레이아웃 - 새로운 비율 (왼쪽 작게, 오른쪽 채팅창 크게) */}
          <div className="flex gap-6">
            {/* 왼쪽: 상담 정보 - 크기 줄임 (원래의 약 1/3) */}
            <div className="w-[380px] flex-shrink-0 space-y-4">
              {/* 이전 버전 (1:1 비율) - 주석처리 */}
              {/* <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6"> */}
              {/* 예약 일자 */}
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <p className="text-sm text-gray-600">
                  예약일자 : <span className="font-bold text-gray-800">{counselData?.cnslDt}</span>
                </p>
              </div>

              {/* 상담 내용 */}
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <h2 className="text-base font-bold text-gray-800 mb-3">상담 내용</h2>
                <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">{counselData?.cnslTitle}</h3>
                <p className="text-xs text-gray-600 mb-2">예약자 : {counselData?.nickname}</p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{counselData?.cnslContent}</p>
                </div>
              </div>

              {/* 상담자 정보 */}
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <h2 className="text-base font-bold text-gray-800 mb-3">상담자 정보</h2>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                    <img
                      src={'https://picsum.photos/200'}
                      alt={nickname}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800 mb-1">{nickname}</h3>
                    <p className="text-xs text-gray-600">MBTI : {counselData?.mbti}</p>
                    <p className="text-xs text-gray-500">
                      {counselData?.gender} / {counselData?.age}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-2">상담사 페르소나</h3>
                  <div className="bg-gray-50 rounded-xl p-3 max-h-24 overflow-hidden">
                    <p className="text-xs text-gray-700 leading-relaxed break-all line-clamp-4">{counselData?.text}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 채팅 기록 - 크게 확장 */}
            <div
              className="flex-1 bg-white rounded-3xl shadow-xl flex flex-col"
              style={{ height: 'calc(100vh - 200px)' }}
            >
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">상담사와의 상담 내용</h2>
              </div>

              {/* 상담사 프로필 헤더 - 크기 축소 */}
              <div className="mx-4 mt-3 bg-blue-600 text-white p-3 rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white overflow-hidden">
                  <img
                    src={'https://picsum.photos/200'}
                    alt={nickname}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '';
                    }}
                  />
                </div>
                <div>
                  <p className="text-base font-bold">{`안녕 상담사 ${nickname}입니다`}</p>
                  <p className="text-xs">#코인만담 #파이어족 되기 #워라밸잡기</p>
                </div>
              </div>

              {/* 메시지 목록 (읽기 전용) - 간격 축소 */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'counselor' ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[70%] ${
                        msg.sender === 'counselor' ? 'bg-gray-100 border border-gray-200' : 'bg-blue-500 text-white'
                      } rounded-xl p-3`}
                    >
                      {msg.sender === 'counselor' && <p className="text-xs font-semibold mb-1">{msg.senderName}</p>}
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'counselor' ? 'text-gray-500' : 'text-blue-100'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 하단 버튼 - 크기 축소 */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition"
                >
                  상담 종료하기
                </button>
              </div>
            </div>
          </div>
          {/* 주석처리된 이전 버전 닫는 태그 */}
          {/* </div>
          </div> */}
        </div>
      </div>
    </>
  );

  if (!counselData) return null;

  // 상태에 따라 다른 화면 렌더링
  return (
    <>
      {counselData?.status === 'scheduled' && renderScheduledView()}
      {counselData?.status === 'inProgress' && renderInProgressView()}
      {counselData?.status === 'completed' && renderCompletedView()}
    </>
  );
};

export default MyCounselDetail;
