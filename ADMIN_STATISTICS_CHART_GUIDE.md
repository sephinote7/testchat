# 관리자 통계 페이지 차트 및 실시간 연동 가이드

## 목차
1. [차트 라이브러리 선택](#1-차트-라이브러리-선택)
2. [Chart.js 설치 및 기본 설정](#2-chartjs-설치-및-기본-설정)
3. [파이 차트 구현](#3-파이-차트-구현)
4. [바 차트 구현](#4-바-차트-구현)
5. [실시간 데이터 연동](#5-실시간-데이터-연동)
6. [대안: Recharts 사용](#6-대안-recharts-사용)
7. [성능 최적화](#7-성능-최적화)

---

## 1. 차트 라이브러리 선택

### 추천 라이브러리

#### 🎯 Chart.js (추천)
**장점:**
- ✅ 가볍고 빠름
- ✅ 문서화가 잘 되어있음
- ✅ 커스터마이징이 쉬움
- ✅ 애니메이션 지원
- ✅ 반응형 지원

**단점:**
- ❌ React 전용은 아님 (react-chartjs-2 필요)

#### 🎨 Recharts
**장점:**
- ✅ React 전용으로 설계
- ✅ 컴포넌트 기반
- ✅ SVG 기반으로 확장성 좋음

**단점:**
- ❌ Chart.js보다 무거움

#### 📊 Victory
**장점:**
- ✅ React Native도 지원
- ✅ 매우 강력한 커스터마이징

**단점:**
- ❌ 학습 곡선이 높음

### 결론
**Chart.js + react-chartjs-2 조합을 추천합니다.**
- 가장 널리 사용됨
- 성능이 좋음
- 커뮤니티가 활발함

---

## 2. Chart.js 설치 및 기본 설정

### 패키지 설치

```bash
npm install chart.js react-chartjs-2
```

### 버전 확인 (2026년 기준)
```json
{
  "dependencies": {
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0"
  }
}
```

---

## 3. 파이 차트 구현

### 📁 파일 위치
`c:\KSJ\Fiveguys\pjt-gmss\frontend\src\pages\admin\Statistics.jsx`

### 3.1. 기본 파이 차트

```javascript
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import useAuth from '../../hooks/useAuth';
import axios from '../api/axios';

// Chart.js 컴포넌트 등록
ChartJS.register(ArcElement, Tooltip, Legend);

const Statistics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('2026-01-19 ~ 2026-01-25');
  const [keywordData, setKeywordData] = useState(null);
  const [avgTimeData, setAvgTimeData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 키워드 통계 조회
  useEffect(() => {
    const fetchKeywordStats = async () => {
      try {
        setLoading(true);
        const [start, end] = dateRange.split(' ~ ');
        const response = await axios.get('/api/admin/statistics/keywords', {
          params: { startDate: start, endDate: end }
        });

        const data = response.data.data.keywords;
        
        // Chart.js 데이터 형식으로 변환
        setKeywordData({
          labels: data.map(item => item.label),
          datasets: [{
            label: '키워드 빈도',
            data: data.map(item => item.count),
            backgroundColor: data.map(item => item.color),
            borderColor: '#fff',
            borderWidth: 2,
            hoverOffset: 10
          }]
        });
      } catch (error) {
        console.error('키워드 통계 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKeywordStats();
  }, [dateRange]);

  // 파이 차트 옵션
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false // 범례는 커스텀으로 표시
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 16
        },
        bodyFont: {
          size: 14
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}건 (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  return (
    <div className="flex min-h-screen bg-[#e8eef7]">
      {/* LEFT SIDEBAR - 생략 */}
      
      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        {/* TOP BAR - 생략 */}

        {/* CONTENT AREA */}
        <div className="flex-1 px-16 py-12 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-10">통계 자료</h1>

            {/* 파이차트와 키워드 범례 */}
            <div className="bg-white rounded-3xl p-10 shadow-xl mb-10">
              <div className="grid grid-cols-2 gap-12">
                {/* 파이차트 */}
                <div className="flex items-center justify-center">
                  {loading ? (
                    <div className="w-[380px] h-[380px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2563eb]"></div>
                    </div>
                  ) : keywordData ? (
                    <div className="w-[380px] h-[380px]">
                      <Pie data={keywordData} options={pieOptions} />
                    </div>
                  ) : (
                    <div className="text-gray-500">데이터가 없습니다</div>
                  )}
                </div>

                {/* 키워드 범례 */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">이번주 키워드</h2>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="h-12 px-6 bg-white border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:border-[#2563eb] transition-colors"
                    >
                      <option value="2026-01-19 ~ 2026-01-25">2026-01-19 ~ 2026-01-25</option>
                      <option value="2026-01-12 ~ 2026-01-18">2026-01-12 ~ 2026-01-18</option>
                      <option value="2026-01-05 ~ 2026-01-11">2026-01-05 ~ 2026-01-11</option>
                    </select>
                  </div>

                  {keywordData && (
                    <div className="grid grid-cols-2 gap-4">
                      {keywordData.labels.map((label, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div
                            className="w-8 h-8 rounded-full shadow-md flex-shrink-0"
                            style={{ backgroundColor: keywordData.datasets[0].backgroundColor[index] }}
                          ></div>
                          <div>
                            <span className="text-lg font-semibold text-gray-800">{label}</span>
                            <p className="text-sm text-gray-600">
                              {keywordData.datasets[0].data[index]}건
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 바 차트 부분은 아래 섹션 참고 */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Statistics;
```

---

## 4. 바 차트 구현

### 4.1. Chart.js 바 차트

```javascript
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// 바 차트용 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Statistics = () => {
  // ... 이전 코드 ...

  // 평균 상담 시간 조회
  useEffect(() => {
    const fetchAvgTimeStats = async () => {
      try {
        const [start, end] = dateRange.split(' ~ ');
        const response = await axios.get('/api/admin/statistics/avg-time', {
          params: { startDate: start, endDate: end }
        });

        const data = response.data.data.avgTimes;

        setAvgTimeData({
          labels: data.map(item => item.label),
          datasets: [{
            label: '평균 상담 시간 (분)',
            data: data.map(item => item.avgMinutes),
            backgroundColor: data.map(item => item.color),
            borderColor: data.map(item => item.color),
            borderWidth: 1,
            borderRadius: 8,
            barThickness: 60
          }]
        });
      } catch (error) {
        console.error('평균 시간 통계 조회 실패:', error);
      }
    };

    fetchAvgTimeStats();
  }, [dateRange]);

  // 바 차트 옵션
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // 가로 막대
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function(context) {
            return `${context.parsed.x}분`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '분';
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#e8eef7]">
      {/* ... 이전 코드 ... */}

      {/* 카테고리별 평균 상담 시간 */}
      <div className="bg-white rounded-3xl p-10 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">카테고리별 평균 상담 시간</h2>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-12 px-6 bg-white border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:border-[#2563eb] transition-colors"
          >
            <option value="2026-01-19 ~ 2026-01-25">2026-01-19 ~ 2026-01-25</option>
            <option value="2026-01-12 ~ 2026-01-18">2026-01-12 ~ 2026-01-18</option>
            <option value="2026-01-05 ~ 2026-01-11">2026-01-05 ~ 2026-01-11</option>
          </select>
        </div>

        {/* Chart.js 바 차트 */}
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2563eb]"></div>
          </div>
        ) : avgTimeData ? (
          <div className="h-[300px]">
            <Bar data={avgTimeData} options={barOptions} />
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            데이터가 없습니다
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 5. 실시간 데이터 연동

### 5.1. WebSocket 방식 (추천)

실시간 데이터 업데이트에 가장 적합합니다.

#### 백엔드 (Socket.io)

```bash
npm install socket.io
```

```javascript
// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Socket.io 연결
io.on('connection', (socket) => {
  console.log('관리자 연결됨:', socket.id);

  // 통계 데이터 변경 이벤트
  socket.on('subscribe-stats', (dateRange) => {
    console.log('통계 구독:', dateRange);
    
    // 클라이언트를 특정 룸에 추가
    socket.join('admin-stats');
  });

  socket.on('disconnect', () => {
    console.log('관리자 연결 해제:', socket.id);
  });
});

// 새로운 상담이 완료되거나 키워드가 추가될 때
function notifyStatsUpdate(updatedStats) {
  io.to('admin-stats').emit('stats-updated', updatedStats);
}

// 예시: 상담 완료 시 호출
router.post('/api/counsels/:id/complete', async (req, res) => {
  // ... 상담 완료 처리 ...
  
  // 통계 업데이트 알림
  const updatedStats = await getLatestStats();
  notifyStatsUpdate(updatedStats);
  
  res.json({ success: true });
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

#### 프론트엔드 (Socket.io Client)

```bash
npm install socket.io-client
```

```javascript
// src/hooks/useRealtimeStats.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const useRealtimeStats = (dateRange) => {
  const [socket, setSocket] = useState(null);
  const [keywordData, setKeywordData] = useState(null);
  const [avgTimeData, setAvgTimeData] = useState(null);

  useEffect(() => {
    // Socket 연결
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('adminToken')
      }
    });

    newSocket.on('connect', () => {
      console.log('WebSocket 연결됨');
      newSocket.emit('subscribe-stats', dateRange);
    });

    // 실시간 업데이트 수신
    newSocket.on('stats-updated', (data) => {
      console.log('통계 업데이트:', data);
      
      // 키워드 데이터 업데이트
      if (data.keywords) {
        setKeywordData({
          labels: data.keywords.map(item => item.label),
          datasets: [{
            label: '키워드 빈도',
            data: data.keywords.map(item => item.count),
            backgroundColor: data.keywords.map(item => item.color),
            borderColor: '#fff',
            borderWidth: 2,
            hoverOffset: 10
          }]
        });
      }

      // 평균 시간 데이터 업데이트
      if (data.avgTimes) {
        setAvgTimeData({
          labels: data.avgTimes.map(item => item.label),
          datasets: [{
            label: '평균 상담 시간 (분)',
            data: data.avgTimes.map(item => item.avgMinutes),
            backgroundColor: data.avgTimes.map(item => item.color),
            borderColor: data.avgTimes.map(item => item.color),
            borderWidth: 1,
            borderRadius: 8,
            barThickness: 60
          }]
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket 연결 해제됨');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [dateRange]);

  return { keywordData, avgTimeData };
};
```

#### Statistics.jsx에서 사용

```javascript
import { useRealtimeStats } from '../../hooks/useRealtimeStats';

const Statistics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('2026-01-19 ~ 2026-01-25');
  
  // 실시간 통계 데이터
  const { keywordData, avgTimeData } = useRealtimeStats(dateRange);

  return (
    <div className="flex min-h-screen bg-[#e8eef7]">
      {/* ... */}
      
      {/* 파이차트 */}
      {keywordData && (
        <div className="w-[380px] h-[380px]">
          <Pie data={keywordData} options={pieOptions} />
        </div>
      )}
      
      {/* 바차트 */}
      {avgTimeData && (
        <div className="h-[300px]">
          <Bar data={avgTimeData} options={barOptions} />
        </div>
      )}
    </div>
  );
};
```

### 5.2. Polling 방식 (대안)

WebSocket을 사용할 수 없는 경우 polling 방식을 사용할 수 있습니다.

```javascript
const Statistics = () => {
  const [keywordData, setKeywordData] = useState(null);
  const [dateRange, setDateRange] = useState('2026-01-19 ~ 2026-01-25');

  // 주기적으로 데이터 갱신 (30초마다)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [start, end] = dateRange.split(' ~ ');
        const response = await axios.get('/api/admin/statistics/keywords', {
          params: { startDate: start, endDate: end }
        });
        
        const data = response.data.data.keywords;
        setKeywordData({
          labels: data.map(item => item.label),
          datasets: [{
            label: '키워드 빈도',
            data: data.map(item => item.count),
            backgroundColor: data.map(item => item.color),
            borderColor: '#fff',
            borderWidth: 2
          }]
        });
      } catch (error) {
        console.error('통계 조회 실패:', error);
      }
    };

    // 초기 데이터 로드
    fetchData();

    // 30초마다 갱신
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [dateRange]);

  // ... rest of component
};
```

---

## 6. 대안: Recharts 사용

만약 React 전용 라이브러리를 선호한다면 Recharts도 좋은 선택입니다.

### 설치

```bash
npm install recharts
```

### 파이 차트 예시

```javascript
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Statistics = () => {
  const [keywordData, setKeywordData] = useState([
    { name: '고민', value: 120, color: '#5DD8D0' },
    { name: '커리어', value: 96, color: '#5FC4E7' },
    { name: '불안', value: 86, color: '#6B9EFF' },
    { name: '자존감문제', value: 72, color: '#9B7EFF' },
    { name: '스트레스', value: 58, color: '#C77EFF' },
    { name: '자기계발', value: 48, color: '#82E8E8' }
  ]);

  return (
    <div className="w-[380px] h-[380px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={keywordData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {keywordData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
```

### 바 차트 예시

```javascript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const avgTimeData = [
  { name: '커리어', time: 40, color: '#FF6B6B' },
  { name: '취업', time: 50, color: '#FFA07A' },
  { name: '고민', time: 35, color: '#FFD93D' }
];

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={avgTimeData} layout="vertical">
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis type="number" unit="분" />
    <YAxis dataKey="name" type="category" />
    <Tooltip />
    <Bar dataKey="time" fill="#8884d8" radius={[0, 8, 8, 0]}>
      {avgTimeData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

---

## 7. 성능 최적화

### 7.1. 차트 리렌더링 최적화

```javascript
import { memo, useMemo } from 'react';

// 차트 컴포넌트 메모이제이션
const KeywordPieChart = memo(({ data, options }) => {
  return <Pie data={data} options={options} />;
});

const Statistics = () => {
  // 데이터가 변경될 때만 재생성
  const keywordData = useMemo(() => {
    if (!rawData) return null;
    
    return {
      labels: rawData.map(item => item.label),
      datasets: [{
        label: '키워드 빈도',
        data: rawData.map(item => item.count),
        backgroundColor: rawData.map(item => item.color),
        borderColor: '#fff',
        borderWidth: 2
      }]
    };
  }, [rawData]);

  // 옵션도 메모이제이션
  const pieOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { /* ... */ }
    }
  }), []);

  return (
    <KeywordPieChart data={keywordData} options={pieOptions} />
  );
};
```

### 7.2. 데이터 캐싱

```javascript
import { useQuery } from '@tanstack/react-query';

const Statistics = () => {
  const [dateRange, setDateRange] = useState('2026-01-19 ~ 2026-01-25');

  // React Query로 데이터 캐싱 및 자동 갱신
  const { data: keywordStats, isLoading } = useQuery({
    queryKey: ['admin-keyword-stats', dateRange],
    queryFn: async () => {
      const [start, end] = dateRange.split(' ~ ');
      const response = await axios.get('/api/admin/statistics/keywords', {
        params: { startDate: start, endDate: end }
      });
      return response.data.data.keywords;
    },
    staleTime: 30000, // 30초간 캐시 유지
    refetchInterval: 60000, // 1분마다 자동 갱신
    refetchOnWindowFocus: true // 윈도우 포커스 시 갱신
  });

  // ... rest of component
};
```

### 7.3. 애니메이션 최적화

```javascript
const pieOptions = {
  responsive: true,
  maintainAspectRatio: true,
  animation: {
    duration: 800, // 애니메이션 시간 단축
    easing: 'easeInOutQuart'
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      // 툴팁 렌더링 최적화
      enabled: true,
      mode: 'nearest',
      intersect: true
    }
  }
};
```

---

## 8. 실시간 연동 비교

| 방식 | 장점 | 단점 | 추천 상황 |
|------|------|------|-----------|
| **WebSocket** | • 즉각적인 업데이트<br>• 서버 부하 적음<br>• 양방향 통신 | • 구현 복잡도 높음<br>• 추가 라이브러리 필요 | • 실시간성이 중요한 경우<br>• 사용자가 많은 경우 |
| **Polling** | • 구현이 간단<br>• 기존 API 활용 가능 | • 서버 부하 증가<br>• 네트워크 낭비<br>• 딜레이 존재 | • 간단한 프로젝트<br>• 실시간성이 덜 중요한 경우 |
| **Server-Sent Events (SSE)** | • 서버→클라이언트 단방향<br>• 구현 간단 | • 브라우저 호환성 | • 서버에서 클라이언트로만 데이터 전송 |

---

## 9. 추천 구현 방식

### 🎯 최종 추천

```
Chart.js + react-chartjs-2 + WebSocket (Socket.io)
```

**이유:**
1. ✅ Chart.js는 가볍고 성능이 우수
2. ✅ WebSocket으로 실시간 업데이트 가능
3. ✅ 서버 부하 최소화
4. ✅ 사용자 경험 최상

### 구현 단계

1. **1단계**: Chart.js로 기본 차트 구현
2. **2단계**: REST API로 데이터 연동
3. **3단계**: Polling으로 주기적 갱신 (임시)
4. **4단계**: WebSocket으로 실시간 연동 (최종)

---

## 10. 전체 예시 코드

### package.json 추가 패키지

```json
{
  "dependencies": {
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "socket.io-client": "^4.6.0",
    "@tanstack/react-query": "^5.20.0",
    "axios": "^1.6.0"
  }
}
```

### 최종 Statistics.jsx

```javascript
import React, { useState, useEffect, useMemo, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import useAuth from '../../hooks/useAuth';
import { useRealtimeStats } from '../../hooks/useRealtimeStats';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Statistics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('2026-01-19 ~ 2026-01-25');
  
  // 실시간 통계 데이터
  const { keywordData, avgTimeData, isConnected } = useRealtimeStats(dateRange);

  const pieOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed}건 (${percentage}%)`;
          }
        }
      }
    }
  }), []);

  const barOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.x}분`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '분'
        }
      }
    }
  }), []);

  return (
    <div className="flex min-h-screen bg-[#e8eef7]">
      {/* LEFT SIDEBAR */}
      {/* ... 생략 ... */}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="bg-white px-10 py-5 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            {isConnected && (
              <span className="flex items-center gap-2 text-sm text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                실시간 연동 중
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <span className="text-lg font-semibold text-gray-700">
              {user?.email?.split('@')[0] || 'OOO'} 관리자님
            </span>
          </div>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-white border-2 border-[#2563eb] text-[#2563eb] rounded-lg">
            로그아웃
          </button>
        </header>

        {/* CONTENT */}
        <div className="flex-1 px-16 py-12 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-10">통계 자료</h1>

            {/* 파이차트 */}
            <div className="bg-white rounded-3xl p-10 shadow-xl mb-10">
              <div className="grid grid-cols-2 gap-12">
                <div className="flex items-center justify-center">
                  {keywordData ? (
                    <div className="w-[380px] h-[380px]">
                      <Pie data={keywordData} options={pieOptions} />
                    </div>
                  ) : (
                    <div className="w-[380px] h-[380px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2563eb]"></div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">이번주 키워드</h2>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="h-12 px-6 bg-white border-2 border-gray-300 rounded-xl"
                    >
                      <option value="2026-01-19 ~ 2026-01-25">2026-01-19 ~ 2026-01-25</option>
                      <option value="2026-01-12 ~ 2026-01-18">2026-01-12 ~ 2026-01-18</option>
                    </select>
                  </div>

                  {keywordData && (
                    <div className="grid grid-cols-2 gap-4">
                      {keywordData.labels.map((label, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                          <div
                            className="w-8 h-8 rounded-full shadow-md"
                            style={{ backgroundColor: keywordData.datasets[0].backgroundColor[index] }}
                          ></div>
                          <div>
                            <span className="text-lg font-semibold text-gray-800">{label}</span>
                            <p className="text-sm text-gray-600">{keywordData.datasets[0].data[index]}건</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 바차트 */}
            <div className="bg-white rounded-3xl p-10 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">카테고리별 평균 상담 시간</h2>
              {avgTimeData ? (
                <div className="h-[300px]">
                  <Bar data={avgTimeData} options={barOptions} />
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2563eb]"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Statistics;
```

---

## 요약

✅ **Chart.js + react-chartjs-2** 사용 권장  
✅ **WebSocket (Socket.io)**으로 실시간 연동 가능  
✅ Polling은 간단하지만 서버 부하 증가  
✅ React Query로 캐싱 및 성능 최적화  
✅ 메모이제이션으로 불필요한 리렌더링 방지  

실시간 업데이트는 WebSocket이 가장 효율적이며, 구현 초기에는 Polling으로 시작해서 나중에 WebSocket으로 전환하는 것도 좋은 전략입니다!
