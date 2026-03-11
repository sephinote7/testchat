import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import { getPointHistory } from '../../../api/walletApi';

const PointUsageHistory = () => {
  const { accessToken } = useAuthStore();
  // TODO: DB 연동 시 실제 사용내역 조회
  const [usageHistory, setUsageHistory] = useState([]);

  useEffect(() => {
    const fetchPointHistory = async () => {
      const data = await getPointHistory();
      console.log(data);
      setUsageHistory(data);
      // id type amount title date balance
      // id ?? amount breif createdAt pointAfter
    };
    fetchPointHistory();
  }, [accessToken]);

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden w-full max-w-[390px] min-h-screen mx-auto bg-[#f3f7ff] pb-20">
        {/* HEADER */}
        <header className="bg-[#2563eb] h-14 flex items-center justify-between px-5">
          <Link to="/mypage" className="text-white text-xl">
            ←
          </Link>
          <h1 className="text-white text-lg font-bold">포인트 사용내역</h1>
          <div className="w-6" />
        </header>

        {/* CONTENT */}
        <div className="px-6 pt-6">
          <div className="space-y-3">
            {usageHistory?.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.amount > 0 ? 'bg-blue-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt)
                        .toLocaleString('sv-SE')
                        .replace('T', ' ')
                        .slice(0, 16)}
                    </span>
                  </div>
                  <span
                    className={`text-base font-bold ${
                      item.amount > 0 ? 'text-blue-600' : 'text-red-600'
                    }`}
                  >
                    {item.amount > 0 ? '+' : ''}
                    {item.amount?.toLocaleString()}P
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  {item.brief}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>잔액</span>
                  <span className="font-semibold">
                    {item.pointAfter?.toLocaleString()}P
                  </span>
                </div>
              </div>
            ))}
          </div>

          {usageHistory?.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <p className="text-base">사용내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* PC */}
      <div className="hidden lg:block w-full min-h-screen bg-[#f3f7ff]">
        <div className="max-w-[1520px] mx-auto px-8 py-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-3xl font-bold text-gray-800">
              포인트 사용내역
            </h1>
            <Link
              to="/mypage"
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-3 rounded-xl text-base font-semibold transition-colors"
            >
              마이페이지로
            </Link>
          </div>

          {/* CONTENT */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-5 gap-4 bg-gray-100 p-6 font-bold text-gray-700 text-center">
              <div>날짜</div>
              <div className="col-span-2">내용</div>
              <div>금액</div>
              <div>잔액</div>
            </div>

            <div className="divide-y divide-gray-200">
              {usageHistory?.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-5 gap-4 p-6 items-center text-center hover:bg-gray-50 transition-colors"
                >
                  <div className="text-sm text-gray-600">
                    {new Date(item.createdAt)
                      .toLocaleString('sv-SE')
                      .replace('T', ' ')
                      .slice(0, 16)}
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.amount > 0 ? 'bg-blue-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-base font-semibold text-gray-800">
                      {item.brief}
                    </span>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      item.amount > 0 ? 'text-blue-600' : 'text-red-600'
                    }`}
                  >
                    {item.amount > 0 ? '+' : ''}
                    {item.amount?.toLocaleString()}P
                  </div>
                  <div className="text-base font-semibold text-gray-700">
                    {item.pointAfter?.toLocaleString()}P
                  </div>
                </div>
              ))}
            </div>

            {usageHistory?.length === 0 && (
              <div className="text-center py-32 text-gray-500">
                <p className="text-xl">사용내역이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PointUsageHistory;
