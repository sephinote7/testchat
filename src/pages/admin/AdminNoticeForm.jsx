import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bbsApi } from '../../api/backendApi';
import useAuth from '../../hooks/useAuth';
import { useAuthStore } from '../../store/auth.store';

const FONT_OPTIONS = ['Regular', 'Medium', 'SemiBold', 'BM HANNA Pro'];
const HEADING_OPTIONS = ['본문', '제목1', '제목2', '제목3', '제목4'];
const SIZE_OPTIONS = ['10px', '12px', '14px', '16px', '18px', '22px', '28px'];

const AdminNoticeForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [font, setFont] = useState('Regular');
  const [heading, setHeading] = useState('본문');
  const [fontSize, setFontSize] = useState('10px');
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);

  const { email, nickname } = useAuthStore();

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const getFontFamily = (fontName) => {
    switch (fontName) {
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
      case 'Medium':
        return '500';
      case 'SemiBold':
        return '600';
      default:
        return '400';
    }
  };

  const getHeadingSize = (headingType, baseSize) => {
    const base = parseInt(baseSize, 10);
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

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        bbs_div: 'NOTI',
        title: title.trim(),
        content: content || '',
        mbti: null,
      };
      await bbsApi.create(body, user?.id);
      setIsCompleteOpen(true);
    } catch (e) {
      alert(e?.message || '공지사항 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* LEFT SIDEBAR - 뷰포트 전체 높이 고정 */}
      <aside className="fixed top-0 left-0 bottom-0 z-10 w-[280px] bg-[#2d3e50] text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-[#2ed3c6] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">★</span>
          </div>
          <span className="text-xl font-bold">고민순삭</span>
        </div>
        <nav className="px-4 py-8">
          <ul className="space-y-1">
            <li>
              <Link
                to="/alarm"
                className="flex items-center gap-4 px-6 py-4 rounded-lg bg-white/10 transition-colors text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="text-lg">최신 정보</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z"
                  />
                </svg>
                <span className="text-lg">대시보드</span>
              </Link>
            </li>
            <li>
              <Link
                to="/stats"
                className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="text-lg">통계자료</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                className="flex items-center gap-4 px-6 py-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-lg">마이페이지</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="min-h-screen flex flex-col pl-[280px] bg-[#f3f7ff]">
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <header className="bg-white px-10 py-5 flex items-center justify-end gap-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full" />
              <span className="text-lg font-semibold text-gray-700">
                {nickname || ''} 관리자님
              </span>
            </div>
            <button
              onClick={() => navigate('/alarm')}
              className="cursor-pointer px-6 py-2.5 bg-white border-2 border-[#2563eb] text-[#2563eb] rounded-lg text-base font-semibold hover:bg-blue-50 transition-colors"
            >
              Home
            </button>
          </header>

          <div className="flex-1 px-16 py-12 overflow-y-auto">
            <div className="max-w-[1520px] mx-auto">
              <h1 className="text-4xl font-bold text-gray-800 mb-8">글 작성</h1>

              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="flex flex-col gap-6">
                  {/* 제목 */}
                  <div>
                    <label className="block text-base font-normal mb-3 text-gray-700">
                      제목
                    </label>
                    <input
                      type="text"
                      placeholder="제목을 입력해주세요"
                      className="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 text-base focus:outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* 내용 */}
                  <div>
                    <label className="block text-base font-normal mb-3 text-gray-700">
                      내용
                    </label>
                    <div className="rounded-lg border border-gray-300 bg-white overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 border-b border-gray-200">
                        <label
                          htmlFor="admin-notice-image"
                          className="flex items-center gap-2 cursor-pointer font-normal"
                        >
                          <span className="text-xl leading-none">📎</span>
                          사진 첨부
                        </label>
                        <input
                          id="admin-notice-image"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </div>
                      {attachments.length > 0 && (
                        <div className="px-4 py-2 border-b border-gray-200 flex gap-2 flex-wrap">
                          {attachments.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt=""
                                className="w-20 h-20 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setAttachments((prev) =>
                                    prev.filter((_, i) => i !== index),
                                  )
                                }
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 px-4 py-3 border-b border-gray-200">
                        <select
                          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal"
                          value={font}
                          onChange={(e) => setFont(e.target.value)}
                        >
                          <option value="">본문</option>
                          {FONT_OPTIONS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                        <select
                          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal"
                          value={heading}
                          onChange={(e) => setHeading(e.target.value)}
                        >
                          {HEADING_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <select
                          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal"
                          value={fontSize}
                          onChange={(e) => setFontSize(e.target.value)}
                        >
                          {SIZE_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
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

                  <div className="flex justify-end gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(true)}
                      className="cursor-pointer px-8 py-3 rounded-lg border border-gray-300 text-gray-700 text-base font-normal hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="cursor-pointer px-8 py-3 rounded-lg bg-[#2f80ed] hover:bg-[#2670d4] text-white text-base font-normal transition-colors disabled:opacity-50"
                    >
                      {submitting ? '저장 중...' : '완료'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {showCancelModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40">
            <div className="relative z-10 w-full max-w-[400px] rounded-2xl bg-white px-8 py-10 text-center shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                글 작성을 그만두시겠습니까?
              </h3>
              <p className="text-base text-gray-600 mb-8">
                작성 중인 내용은 저장되지 않습니다
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 h-12 rounded-xl bg-[#2f80ed] text-white font-normal"
                >
                  돌아가기
                </button>
                <button
                  onClick={() => navigate('/alarm')}
                  className="flex-1 h-12 rounded-xl bg-red-500 text-white font-normal"
                >
                  나가기
                </button>
              </div>
            </div>
          </div>
        )}

        {isCompleteOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40">
            <div className="relative z-10 w-full max-w-[400px] rounded-2xl bg-white px-8 py-10 text-center shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                공지사항이 등록되었습니다
              </h3>
              <p className="text-base text-gray-600 mb-8">
                정상적으로 게시글이 등록되었습니다
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/alarm')}
                  className="flex-1 h-12 rounded-xl bg-[#2f80ed] text-white font-normal"
                >
                  최신 정보로
                </button>
                <Link
                  to="/board"
                  className="flex-1 h-12 rounded-xl bg-[#2f80ed] text-white font-normal flex items-center justify-center"
                >
                  게시판으로
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminNoticeForm;
