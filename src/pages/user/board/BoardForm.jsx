import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MBTI_OPTIONS = [
  'INTJ',
  'INTP',
  'ENTJ',
  'ENTP',
  'INFJ',
  'INFP',
  'ENFJ',
  'ENFP',
  'ISTJ',
  'ISFJ',
  'ESTJ',
  'ESFJ',
  'ISTP',
  'ISFP',
  'ESTP',
  'ESFP',
];

const FONT_OPTIONS = ['Regular', 'Medium', 'SemiBold', 'BM HANNA Pro'];
const HEADING_OPTIONS = ['본문', '제목1', '제목2', '제목3', '제목4'];
const SIZE_OPTIONS = ['10px', '12px', '14px', '16px', '18px', '22px', '28px'];

const BoardForm = ({ mode = 'write' }) => {
  const navigate = useNavigate();
  const [boardType, setBoardType] = useState('전체');
  const [mbtiType, setMbtiType] = useState('');
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [font, setFont] = useState('Regular');
  const [heading, setHeading] = useState('본문');
  const [fontSize, setFontSize] = useState('10px');
  const [attachments, setAttachments] = useState([]);

  const pageTitle = mode === 'edit' ? '글 수정' : '글 작성';
  const completeTitle = mode === 'edit' ? '수정이 완료되었습니다' : '게시글이 작성되었습니다';
  const completeDesc = mode === 'edit' ? '정상적으로 게시글이 등록되었습니다' : '정상적으로 게시글이 등록되었습니다';

  const showMbtiSelect = boardType === 'MBTI';

  const selectValue = useMemo(() => (showMbtiSelect ? mbtiType : ''), [mbtiType, showMbtiSelect]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const getFontFamily = (fontName) => {
    switch (fontName) {
      case 'Regular':
        return 'inherit';
      case 'Medium':
        return 'inherit';
      case 'SemiBold':
        return 'inherit';
      case 'BM HANNA Pro':
        return '"BM HANNA Pro", sans-serif';
      default:
        return 'inherit';
    }
  };

  const getFontWeight = (fontName, headingType) => {
    if (headingType === '제목1') return 'bold';
    if (headingType === '제목2') return '700';
    if (headingType === '제목3') return '600';
    if (headingType === '제목4') return '500';

    switch (fontName) {
      case 'Regular':
        return '400';
      case 'Medium':
        return '500';
      case 'SemiBold':
        return '600';
      default:
        return '400';
    }
  };

  const getHeadingSize = (headingType, baseSize) => {
    const base = parseInt(baseSize);
    switch (headingType) {
      case '제목1':
        return `${base + 8}px`;
      case '제목2':
        return `${base + 6}px`;
      case '제목3':
        return `${base + 4}px`;
      case '제목4':
        return `${base + 2}px`;
      default:
        return baseSize;
    }
  };

  return (
    <div className="w-full">
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-28">
        <header className="bg-[#1f4ecf] h-14 flex items-center justify-center text-white font-bold">
          고민순삭
        </header>

        <div className="px-5 pt-4">
          {/* Mobile 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">{pageTitle}</h2>
            <Link to="/board" className="border border-blue-500 text-blue-500 text-xs px-3 py-1 rounded-md">
              뒤로가기
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {/* 게시판 선택 */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">게시판</label>
              <select
                value={boardType}
                onChange={(event) => {
                  setBoardType(event.target.value);
                  if (event.target.value !== 'MBTI') setMbtiType('');
                }}
                className="w-full h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
              >
                <option value="전체">게시판을 선택해주세요</option>
                <option value="자유">자유</option>
                <option value="MBTI">MBTI</option>
              </select>
            </div>

            {/* MBTI 유형 선택 */}
            {showMbtiSelect && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">유형 선택</label>
                <select
                  value={selectValue}
                  onChange={(event) => setMbtiType(event.target.value)}
                  className="w-full h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                >
                  <option value="">MBTI 유형을 선택해주세요</option>
                  {MBTI_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 제목 */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">제목</label>
              <input
                type="text"
                placeholder="게시글의 설명하는 제목"
                className="w-full h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">내용</label>
              <div className="rounded-xl border border-gray-300 bg-white overflow-hidden">
                {/* 사진 첨부 영역 */}
                <div className="flex items-center gap-3 px-4 py-3 text-xs text-gray-600 border-b border-gray-200">
                  <label htmlFor="board-image" className="flex items-center gap-2 cursor-pointer font-normal">
                    <span className="text-lg leading-none">📎</span>
                    사진 첨부
                  </label>
                  <input
                    id="board-image"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                {/* 첨부된 이미지 미리보기 */}
                {attachments.length > 0 && (
                  <div className="px-4 py-2 border-b border-gray-200 flex gap-2 flex-wrap">
                    {attachments.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`attachment-${index}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <button
                          onClick={() => {
                            const newAttachments = attachments.filter((_, i) => i !== index);
                            setAttachments(newAttachments);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 폰트 설정 */}
                <div className="flex gap-2 px-4 py-2 border-b border-gray-200">
                  <select
                    className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-normal"
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                  >
                    <option value="">본문</option>
                    {FONT_OPTIONS.map((fontOption) => (
                      <option key={fontOption} value={fontOption}>
                        {fontOption}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-normal"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                  >
                    <option value="">가로</option>
                    {HEADING_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-normal"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                  >
                    {SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 텍스트 입력 영역 */}
                <div className="px-4 py-3">
                  <textarea
                    rows={10}
                    className="w-full resize-none text-sm font-normal outline-none"
                    placeholder="본문을 입력해주세요"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{
                      fontFamily: getFontFamily(font),
                      fontWeight: getFontWeight(font, heading),
                      fontSize: getHeadingSize(heading, fontSize),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex justify-end gap-3 mt-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-normal hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-[#2f80ed] hover:bg-[#2670d4] text-white text-sm font-normal transition-colors"
                onClick={() => setIsCompleteOpen(true)}
              >
                완료
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-8">
          {/* PC 헤더 */}
          <div className="mb-8">
            <h2 className="text-[30px] font-semibold text-gray-800">{pageTitle}</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex flex-col gap-6">
              {/* 게시판 선택 */}
              <div>
                <label className="block text-base font-normal mb-3 text-gray-700">게시판</label>
                <select
                  value={boardType}
                  onChange={(event) => {
                    setBoardType(event.target.value);
                    if (event.target.value !== 'MBTI') setMbtiType('');
                  }}
                  className="w-auto min-w-[400px] h-12 rounded-lg border border-gray-300 bg-white px-4 text-base font-normal focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                >
                  <option value="전체">게시판을 선택해주세요</option>
                  <option value="자유">자유</option>
                  <option value="MBTI">MBTI</option>
                </select>
              </div>

              {/* MBTI 유형 선택 */}
              {showMbtiSelect && (
                <div>
                  <label className="block text-base font-normal mb-3 text-gray-700">유형 선택</label>
                  <select
                    value={selectValue}
                    onChange={(event) => setMbtiType(event.target.value)}
                    className="w-auto min-w-[400px] h-12 rounded-lg border border-gray-300 bg-white px-4 text-base font-normal focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                  >
                    <option value="">MBTI 유형을 선택해주세요</option>
                    {MBTI_OPTIONS.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 제목 */}
              <div>
                <label className="block text-base font-normal mb-3 text-gray-700">제목</label>
                <input
                  type="text"
                  placeholder="게시글의 설명하는 제목"
                  className="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 text-base font-normal focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-base font-normal mb-3 text-gray-700">내용</label>
                <div className="rounded-lg border border-gray-300 bg-white overflow-hidden">
                  {/* PC 사진 첨부 영역 */}
                  <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 border-b border-gray-200">
                    <label htmlFor="board-image-pc" className="flex items-center gap-2 cursor-pointer font-normal">
                      <span className="text-xl leading-none">📎</span>
                    </label>
                    <input
                      id="board-image-pc"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    {/* 툴바 아이콘 */}
                    <button type="button" className="p-1">
                      <span className="text-xl">≣</span>
                    </button>
                    <button type="button" className="p-1">
                      <span className="text-xl">≣</span>
                    </button>
                    <button type="button" className="p-1">
                      <span className="text-xl">≣</span>
                    </button>
                    <button type="button" className="p-1">
                      <span className="text-xl">≣</span>
                    </button>
                  </div>

                  {/* 첨부된 이미지 미리보기 */}
                  {attachments.length > 0 && (
                    <div className="px-4 py-2 border-b border-gray-200 flex gap-2 flex-wrap">
                      {attachments.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`attachment-${index}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <button
                            onClick={() => {
                              const newAttachments = attachments.filter((_, i) => i !== index);
                              setAttachments(newAttachments);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 폰트 설정 */}
                  <div className="flex gap-2 px-4 py-3 border-b border-gray-200">
                    <select
                      className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal"
                      value={font}
                      onChange={(e) => setFont(e.target.value)}
                    >
                      <option value="">본문</option>
                      {FONT_OPTIONS.map((fontOption) => (
                        <option key={fontOption} value={fontOption}>
                          {fontOption}
                        </option>
                      ))}
                    </select>
                    <select
                      className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal"
                      value={heading}
                      onChange={(e) => setHeading(e.target.value)}
                    >
                      <option value="">가로</option>
                      {HEADING_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <select
                      className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal"
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                    >
                      {SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 텍스트 입력 영역 */}
                  <div className="px-4 py-4">
                    <textarea
                      rows={15}
                      className="w-full min-h-[400px] resize-none text-base font-normal outline-none"
                      placeholder="본문을 입력해주세요"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      style={{
                        fontFamily: getFontFamily(font),
                        fontWeight: getFontWeight(font, heading),
                        fontSize: getHeadingSize(heading, fontSize),
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 버튼 영역 */}
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 text-base font-normal hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  className="px-8 py-3 rounded-lg bg-[#2f80ed] hover:bg-[#2670d4] text-white text-base font-normal transition-colors"
                  onClick={() => setIsCompleteOpen(true)}
                >
                  완료
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 취소 확인 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40">
          <div className="relative z-10 w-full max-w-[340px] lg:max-w-[400px] rounded-2xl lg:rounded-3xl bg-white px-6 lg:px-8 py-8 lg:py-10 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-4 lg:mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg lg:text-xl">★</span>
              </div>
              <div>
                <div className="text-xs lg:text-sm text-gray-600 font-normal">Healing Therapy</div>
                <div className="font-bold text-base lg:text-lg text-gray-800">고민순삭</div>
              </div>
            </div>
            <h3 className="text-xl lg:text-[24px] font-bold lg:font-medium mb-3 lg:mb-4 text-gray-800">
              글 작성을 그만두시겠습니까?
            </h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6 lg:mb-8 font-normal">
              작성 중인 내용은 저장되지 않습니다
            </p>
            <div className="flex gap-3 lg:gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 h-11 lg:h-12 rounded-lg lg:rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-sm lg:text-base font-normal transition-colors"
              >
                돌아가기
              </button>
              <button
                onClick={() => navigate('/board')}
                className="flex-1 h-11 lg:h-12 rounded-lg lg:rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm lg:text-base font-normal transition-colors"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 완료 모달 */}
      {isCompleteOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40">
          <div className="relative z-10 w-full max-w-[340px] lg:max-w-[400px] rounded-2xl lg:rounded-3xl bg-white px-6 lg:px-8 py-8 lg:py-10 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-4 lg:mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#2ed3c6] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg lg:text-xl">★</span>
              </div>
              <div>
                <div className="text-xs lg:text-sm text-gray-600 font-normal">Healing Therapy</div>
                <div className="font-bold text-base lg:text-lg text-gray-800">고민순삭</div>
              </div>
            </div>
            <h3 className="text-xl lg:text-[24px] font-bold lg:font-medium mb-3 lg:mb-4 text-gray-800">
              {completeTitle}
            </h3>
            <p className="text-sm lg:text-base text-gray-600 mb-6 lg:mb-8 font-normal">{completeDesc}</p>
            <div className="flex gap-3 lg:gap-4">
              <button
                onClick={() => setIsCompleteOpen(false)}
                className="flex-1 h-11 lg:h-12 rounded-lg lg:rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-sm lg:text-base font-normal transition-colors"
              >
                돌아가기
              </button>
              <Link
                to="/board"
                className="flex-1 h-11 lg:h-12 rounded-lg lg:rounded-xl bg-[#2f80ed] hover:bg-[#2670d4] text-white text-sm lg:text-base font-normal flex items-center justify-center transition-colors"
              >
                게시판으로
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardForm;
