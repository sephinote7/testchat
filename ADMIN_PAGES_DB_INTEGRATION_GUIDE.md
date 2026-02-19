# 관리자 페이지 DB 연동 가이드

이 문서는 관리자 페이지들(최신 정보, 대시보드, 통계 자료, 마이페이지, 최근 활동 내역, 정보 수정)의 DB 연동 방법을 설명합니다.

## 목차
1. [최신 정보 (Alarm)](#1-최신-정보-alarm)
2. [대시보드 (DashBoard)](#2-대시보드-dashboard)
3. [통계 자료 (Statistics)](#3-통계-자료-statistics)
4. [최근 활동 내역 (AdminActivities)](#4-최근-활동-내역-adminactivities)
5. [관리자 정보 수정 (EditAdminInfo)](#5-관리자-정보-수정-editadmininfo)
6. [백엔드 프로젝트 구조](#6-백엔드-프로젝트-구조)
7. [환경 설정](#7-환경-설정)

---

## 1. 최신 정보 (Alarm)

### 📁 파일 위치
`c:\KSJ\Fiveguys\pjt-gmss\frontend\src\pages\admin\Alarm.jsx`

### 🔧 필요한 기능
1. 공지 사항 목록 조회
2. 최근 위험 단어 감지 내역 조회
3. 페이지네이션

### 📡 API 엔드포인트

#### 1.1. 공지 사항 조회
```javascript
GET /api/admin/notices?page={page}&pageSize={pageSize}
```

**요청 파라미터:**
- `page`: 페이지 번호 (1부터 시작)
- `pageSize`: 페이지당 항목 수 (기본값: 6)

**응답 형식:**
```json
{
  "success": true,
  "data": {
    "notices": [
      {
        "id": "notice-001",
        "title": "공지 제목",
        "content": "중독, 끊는다고 끝나지 않는다? 반복 중독 막기...",
        "createdAt": "2026-02-04T15:00:00Z",
        "createdBy": "admin-001",
        "isRead": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 30,
      "pageSize": 6
    }
  }
}
```

#### 1.2. 위험 단어 감지 내역 조회
```javascript
GET /api/admin/risk-alerts?page={page}&pageSize={pageSize}
```

**요청 파라미터:**
- `page`: 페이지 번호
- `pageSize`: 페이지당 항목 수 (기본값: 6)

**응답 형식:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-001",
        "date": "2026-02-04T15:00:00Z",
        "type": "고민",
        "counselorId": "user-001",
        "counselor": "OOO",
        "counselorNameId": "counselor-001",
        "counselorName": "AI",
        "keyword": "자살",
        "riskLevel": "높음",
        "status": "진행 중",
        "chatId": "chat-001"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalCount": 60,
      "pageSize": 6
    }
  }
}
```

### 💾 DB 스키마

#### 공지사항 테이블 (notices)
```sql
CREATE TABLE notices (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  INDEX idx_created_at (created_at DESC),
  FOREIGN KEY (created_by) REFERENCES admins(id)
);
```

#### 위험 단어 감지 테이블 (risk_alerts)
```sql
CREATE TABLE risk_alerts (
  id VARCHAR(50) PRIMARY KEY,
  chat_id VARCHAR(50) NOT NULL,
  counselor_id VARCHAR(50) NOT NULL,
  counselor_name_id VARCHAR(50),
  type VARCHAR(20) NOT NULL,
  keyword VARCHAR(100) NOT NULL,
  risk_level ENUM('높음', '중위', '낮음') NOT NULL,
  status ENUM('진행 중', '조치', '완료') DEFAULT '진행 중',
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  resolved_by VARCHAR(50) NULL,
  context TEXT,
  INDEX idx_detected_at (detected_at DESC),
  INDEX idx_status (status),
  FOREIGN KEY (chat_id) REFERENCES chats(id),
  FOREIGN KEY (counselor_id) REFERENCES users(id),
  FOREIGN KEY (counselor_name_id) REFERENCES counselors(id)
);
```

### 🖥️ 백엔드 구현 (Express.js)

#### routes/admin.js
```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');

// 공지사항 조회
router.get('/notices', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 6;
    const offset = (page - 1) * pageSize;

    // 전체 개수 조회
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM notices WHERE is_deleted = FALSE'
    );
    const totalCount = countResult[0].total;
    const totalPages = Math.ceil(totalCount / pageSize);

    // 공지사항 목록 조회
    const [notices] = await db.query(
      `SELECT id, title, content, created_at, created_by
       FROM notices
       WHERE is_deleted = FALSE
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    res.json({
      success: true,
      data: {
        notices: notices.map(notice => ({
          id: notice.id,
          title: notice.title,
          content: notice.content,
          createdAt: notice.created_at,
          createdBy: notice.created_by,
          isRead: false
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize
        }
      }
    });
  } catch (error) {
    console.error('공지사항 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 위험 단어 감지 내역 조회
router.get('/risk-alerts', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 6;
    const offset = (page - 1) * pageSize;

    // 전체 개수 조회
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM risk_alerts'
    );
    const totalCount = countResult[0].total;
    const totalPages = Math.ceil(totalCount / pageSize);

    // 위험 단어 감지 내역 조회
    const [alerts] = await db.query(
      `SELECT 
        ra.id,
        ra.detected_at as date,
        ra.type,
        u.name as counselor,
        c.name as counselor_name,
        ra.keyword,
        ra.risk_level,
        ra.status,
        ra.chat_id
       FROM risk_alerts ra
       LEFT JOIN users u ON ra.counselor_id = u.id
       LEFT JOIN counselors c ON ra.counselor_name_id = c.id
       ORDER BY ra.detected_at DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    res.json({
      success: true,
      data: {
        alerts: alerts.map(alert => ({
          id: alert.id,
          date: alert.date,
          type: alert.type,
          counselor: alert.counselor || 'OOO',
          counselorName: alert.counselor_name || 'AI',
          keyword: alert.keyword,
          riskLevel: alert.risk_level,
          status: alert.status,
          chatId: alert.chat_id
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize
        }
      }
    });
  } catch (error) {
    console.error('위험 단어 감지 내역 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
```

### 🎨 프론트엔드 수정

#### Alarm.jsx 수정 부분
```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const Alarm = () => {
  const [alarmNotices, setAlarmNotices] = useState([]);
  const [riskAlerts, setRiskAlerts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // 공지사항 조회
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/notices', {
          params: { page: currentPage, pageSize: 6 }
        });
        setAlarmNotices(response.data.data.notices);
        setTotalPages(response.data.data.pagination.totalPages);
      } catch (error) {
        console.error('공지사항 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, [currentPage]);

  // 위험 단어 감지 내역 조회
  useEffect(() => {
    const fetchRiskAlerts = async () => {
      try {
        const response = await axios.get('/api/admin/risk-alerts', {
          params: { page: 1, pageSize: 6 }
        });
        setRiskAlerts(response.data.data.alerts);
      } catch (error) {
        console.error('위험 단어 감지 내역 조회 실패:', error);
      }
    };
    fetchRiskAlerts();
  }, []);

  // 더미 데이터 부분 삭제하고 위 코드로 대체
  // ...
};
```

---

## 2. 대시보드 (DashBoard)

### 📁 파일 위치
`c:\KSJ\Fiveguys\pjt-gmss\frontend\src\pages\admin\DashBoard.jsx`

### 🔧 필요한 기능
1. 상담 통계 조회 (고민/커리어/취업)
2. 실시간 위험 감지 조치 현황
3. 최근 정산 현황
4. 날짜 범위 선택

### 📡 API 엔드포인트

#### 2.1. 상담 통계 조회
```javascript
GET /api/admin/dashboard/stats?startDate={start}&endDate={end}
```

**요청 파라미터:**
- `startDate`: 시작 날짜 (YYYY-MM-DD)
- `endDate`: 종료 날짜 (YYYY-MM-DD)

**응답 형식:**
```json
{
  "success": true,
  "data": {
    "stats": [
      {
        "type": "concern",
        "title": "고민 상담 건수",
        "thisWeek": "45 건",
        "avgTime": "32 분",
        "keywords": ["스트레스", "우울", "불안"],
        "risk": "5 건"
      },
      {
        "type": "career",
        "title": "커리어 상담 건수",
        "thisWeek": "32 건",
        "avgTime": "28 분",
        "keywords": ["이직", "커리어전환"],
        "risk": null
      },
      {
        "type": "job",
        "title": "취업 상담 건수",
        "thisWeek": "28 건",
        "avgTime": "25 분",
        "keywords": ["면접", "자소서"],
        "risk": null
      }
    ]
  }
}
```

#### 2.2. 실시간 위험 감지 조치 현황
```javascript
GET /api/admin/dashboard/risk-activities?limit={limit}
```

**응답 형식:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity-001",
        "date": "2026-02-04T15:00:00Z",
        "type": "고민",
        "counselor": "OOO",
        "counselorName": "AI",
        "keyword": "자살",
        "riskLevel": "높음",
        "status": "진행 중"
      }
    ]
  }
}
```

#### 2.3. 최근 정산 현황
```javascript
GET /api/admin/dashboard/settlements?limit={limit}
```

**응답 형식:**
```json
{
  "success": true,
  "data": {
    "settlements": [
      {
        "id": "settlement-001",
        "date": "2026-02-01",
        "counselor": "커리어",
        "counselorName": "AAA 상담사",
        "totalCounsel": "45건",
        "totalAmount": "1,200,000원",
        "platformFee": "240,000원",
        "netAmount": "960,000원",
        "status": "대기"
      }
    ]
  }
}
```

### 💾 DB 스키마

#### 상담 통계 테이블 (counsel_stats)
```sql
CREATE TABLE counsel_sessions (
  id VARCHAR(50) PRIMARY KEY,
  chat_id VARCHAR(50) NOT NULL,
  counselor_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  type ENUM('concern', 'career', 'job') NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP NULL,
  duration_minutes INT,
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') NOT NULL,
  INDEX idx_type_started (type, started_at),
  INDEX idx_counselor (counselor_id),
  FOREIGN KEY (chat_id) REFERENCES chats(id),
  FOREIGN KEY (counselor_id) REFERENCES counselors(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE counsel_keywords (
  id VARCHAR(50) PRIMARY KEY,
  session_id VARCHAR(50) NOT NULL,
  keyword VARCHAR(100) NOT NULL,
  frequency INT DEFAULT 1,
  INDEX idx_session (session_id),
  FOREIGN KEY (session_id) REFERENCES counsel_sessions(id)
);
```

#### 정산 테이블 (settlements)
```sql
CREATE TABLE settlements (
  id VARCHAR(50) PRIMARY KEY,
  counselor_id VARCHAR(50) NOT NULL,
  settlement_date DATE NOT NULL,
  total_sessions INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  net_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_counselor_date (counselor_id, settlement_date),
  INDEX idx_status (status),
  FOREIGN KEY (counselor_id) REFERENCES counselors(id)
);
```

### 🖥️ 백엔드 구현

#### routes/admin.js (추가)
```javascript
// 대시보드 상담 통계
router.get('/dashboard/stats', authenticateAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // 각 타입별 통계 조회
    const types = ['concern', 'career', 'job'];
    const stats = [];

    for (const type of types) {
      // 상담 건수
      const [countResult] = await db.query(
        `SELECT COUNT(*) as count
         FROM counsel_sessions
         WHERE type = ? AND started_at BETWEEN ? AND ? AND status = 'completed'`,
        [type, startDate, endDate]
      );

      // 평균 시간
      const [avgResult] = await db.query(
        `SELECT AVG(duration_minutes) as avg_time
         FROM counsel_sessions
         WHERE type = ? AND started_at BETWEEN ? AND ? AND status = 'completed'`,
        [type, startDate, endDate]
      );

      // 주요 키워드
      const [keywords] = await db.query(
        `SELECT ck.keyword, SUM(ck.frequency) as total_freq
         FROM counsel_keywords ck
         JOIN counsel_sessions cs ON ck.session_id = cs.id
         WHERE cs.type = ? AND cs.started_at BETWEEN ? AND ?
         GROUP BY ck.keyword
         ORDER BY total_freq DESC
         LIMIT 3`,
        [type, startDate, endDate]
      );

      // 위험 단어 감지 (고민 상담만)
      let riskCount = null;
      if (type === 'concern') {
        const [riskResult] = await db.query(
          `SELECT COUNT(*) as count
           FROM risk_alerts ra
           JOIN counsel_sessions cs ON ra.chat_id = cs.chat_id
           WHERE cs.type = 'concern' AND ra.detected_at BETWEEN ? AND ?`,
          [startDate, endDate]
        );
        riskCount = `${riskResult[0].count} 건`;
      }

      stats.push({
        type,
        title: type === 'concern' ? '고민 상담 건수' : type === 'career' ? '커리어 상담 건수' : '취업 상담 건수',
        thisWeek: `${countResult[0].count} 건`,
        avgTime: `${Math.round(avgResult[0].avg_time || 0)} 분`,
        keywords: keywords.map(k => k.keyword),
        risk: riskCount
      });
    }

    res.json({ success: true, data: { stats } });
  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 실시간 위험 감지 조치 현황
router.get('/dashboard/risk-activities', authenticateAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;

    const [activities] = await db.query(
      `SELECT 
        ra.id,
        ra.detected_at as date,
        ra.type,
        u.name as counselor,
        c.name as counselor_name,
        ra.keyword,
        ra.risk_level,
        ra.status
       FROM risk_alerts ra
       LEFT JOIN users u ON ra.counselor_id = u.id
       LEFT JOIN counselors c ON ra.counselor_name_id = c.id
       ORDER BY ra.detected_at DESC
       LIMIT ?`,
      [limit]
    );

    res.json({
      success: true,
      data: {
        activities: activities.map(a => ({
          id: a.id,
          date: a.date,
          type: a.type,
          counselor: a.counselor || 'OOO',
          counselorName: a.counselor_name || 'AI',
          keyword: a.keyword,
          riskLevel: a.risk_level,
          status: a.status
        }))
      }
    });
  } catch (error) {
    console.error('위험 활동 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 최근 정산 현황
router.get('/dashboard/settlements', authenticateAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;

    const [settlements] = await db.query(
      `SELECT 
        s.id,
        s.settlement_date,
        c.specialty as counselor,
        c.name as counselor_name,
        s.total_sessions,
        s.total_amount,
        s.platform_fee,
        s.net_amount,
        s.status
       FROM settlements s
       JOIN counselors c ON s.counselor_id = c.id
       ORDER BY s.settlement_date DESC
       LIMIT ?`,
      [limit]
    );

    res.json({
      success: true,
      data: {
        settlements: settlements.map(s => ({
          id: s.id,
          date: s.settlement_date,
          counselor: s.counselor,
          counselorName: s.counselor_name,
          totalCounsel: `${s.total_sessions}건`,
          totalAmount: `${s.total_amount.toLocaleString()}원`,
          platformFee: `${s.platform_fee.toLocaleString()}원`,
          netAmount: `${s.net_amount.toLocaleString()}원`,
          status: s.status === 'pending' ? '대기' : s.status === 'completed' ? '완료' : '실패'
        }))
      }
    });
  } catch (error) {
    console.error('정산 현황 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});
```

---

## 3. 통계 자료 (Statistics)

### 📁 파일 위치
`c:\KSJ\Fiveguys\pjt-gmss\frontend\src\pages\admin\Statistics.jsx`

### 🔧 필요한 기능
1. 키워드 통계 (파이 차트)
2. 카테고리별 평균 상담 시간 (바 차트)
3. 날짜 범위 선택

### 📡 API 엔드포인트

#### 3.1. 키워드 통계 조회
```javascript
GET /api/admin/statistics/keywords?startDate={start}&endDate={end}
```

**응답 형식:**
```json
{
  "success": true,
  "data": {
    "keywords": [
      {
        "label": "고민",
        "count": 120,
        "percentage": 25,
        "color": "#5DD8D0"
      },
      {
        "label": "커리어",
        "count": 96,
        "percentage": 20,
        "color": "#5FC4E7"
      }
    ],
    "totalCount": 480
  }
}
```

#### 3.2. 카테고리별 평균 상담 시간
```javascript
GET /api/admin/statistics/avg-time?startDate={start}&endDate={end}
```

**응답 형식:**
```json
{
  "success": true,
  "data": {
    "avgTimes": [
      {
        "label": "커리어",
        "avgMinutes": 40,
        "percentage": 40,
        "color": "#FF6B6B"
      },
      {
        "label": "취업",
        "avgMinutes": 50,
        "percentage": 50,
        "color": "#FFA07A"
      }
    ]
  }
}
```

### 🖥️ 백엔드 구현

```javascript
// 키워드 통계
router.get('/statistics/keywords', authenticateAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const [keywords] = await db.query(
      `SELECT 
        ck.keyword as label,
        SUM(ck.frequency) as count
       FROM counsel_keywords ck
       JOIN counsel_sessions cs ON ck.session_id = cs.id
       WHERE cs.started_at BETWEEN ? AND ?
       GROUP BY ck.keyword
       ORDER BY count DESC
       LIMIT 6`,
      [startDate, endDate]
    );

    const totalCount = keywords.reduce((sum, k) => sum + k.count, 0);
    const colors = ['#5DD8D0', '#5FC4E7', '#6B9EFF', '#9B7EFF', '#C77EFF', '#82E8E8'];

    const result = keywords.map((k, idx) => ({
      label: k.label,
      count: k.count,
      percentage: Math.round((k.count / totalCount) * 100),
      color: colors[idx] || '#999'
    }));

    res.json({ success: true, data: { keywords: result, totalCount } });
  } catch (error) {
    console.error('키워드 통계 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 평균 상담 시간
router.get('/statistics/avg-time', authenticateAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const [avgTimes] = await db.query(
      `SELECT 
        CASE type
          WHEN 'concern' THEN '고민'
          WHEN 'career' THEN '커리어'
          WHEN 'job' THEN '취업'
        END as label,
        AVG(duration_minutes) as avg_minutes
       FROM counsel_sessions
       WHERE started_at BETWEEN ? AND ? AND status = 'completed'
       GROUP BY type
       ORDER BY avg_minutes DESC`,
      [startDate, endDate]
    );

    const maxTime = Math.max(...avgTimes.map(t => t.avg_minutes));
    const colors = ['#FF6B6B', '#FFA07A', '#FFD93D'];

    const result = avgTimes.map((t, idx) => ({
      label: t.label,
      avgMinutes: Math.round(t.avg_minutes),
      percentage: Math.round((t.avg_minutes / maxTime) * 100),
      color: colors[idx] || '#999'
    }));

    res.json({ success: true, data: { avgTimes: result } });
  } catch (error) {
    console.error('평균 시간 통계 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});
```

---

## 4. 최근 활동 내역 (AdminActivities)

### 📁 파일 위치
`c:\KSJ\Fiveguys\pjt-gmss\frontend\src\pages\admin\AdminActivities.jsx`

### 🔧 필요한 기능
1. 위험 단어 감지 내역 조회
2. 페이지네이션
3. 상태별 필터링

### 📡 API 엔드포인트

```javascript
GET /api/admin/activities?page={page}&pageSize={pageSize}&status={status}
```

**요청 파라미터:**
- `page`: 페이지 번호
- `pageSize`: 페이지당 항목 수 (기본값: 6)
- `status`: 상태 필터 (optional: '진행 중', '조치', '완료', 'all')

**응답 형식:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity-001",
        "date": "2026-02-04T15:00:00Z",
        "type": "고민",
        "counselor": "OOO",
        "counselorName": "AI",
        "keyword": "자살",
        "riskLevel": "높음",
        "status": "진행 중",
        "statusColor": "text-yellow-500"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalCount": 60,
      "pageSize": 6
    }
  }
}
```

### 🖥️ 백엔드 구현

```javascript
// 최근 활동 내역 조회
router.get('/activities', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 6;
    const status = req.query.status || 'all';
    const offset = (page - 1) * pageSize;

    // WHERE 조건
    let whereClause = '1=1';
    const params = [];
    
    if (status !== 'all') {
      whereClause += ' AND ra.status = ?';
      params.push(status);
    }

    // 전체 개수
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM risk_alerts ra WHERE ${whereClause}`,
      params
    );
    const totalCount = countResult[0].total;
    const totalPages = Math.ceil(totalCount / pageSize);

    // 활동 내역 조회
    const [activities] = await db.query(
      `SELECT 
        ra.id,
        ra.detected_at as date,
        ra.type,
        u.name as counselor,
        c.name as counselor_name,
        ra.keyword,
        ra.risk_level,
        ra.status
       FROM risk_alerts ra
       LEFT JOIN users u ON ra.counselor_id = u.id
       LEFT JOIN counselors c ON ra.counselor_name_id = c.id
       WHERE ${whereClause}
       ORDER BY ra.detected_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    // 상태별 색상 매핑
    const statusColorMap = {
      '진행 중': 'text-yellow-500',
      '조치': 'text-yellow-600',
      '완료': 'text-cyan-400'
    };

    res.json({
      success: true,
      data: {
        activities: activities.map(a => ({
          id: a.id,
          date: a.date,
          type: a.type,
          counselor: a.counselor || 'OOO',
          counselorName: a.counselor_name || 'AI',
          keyword: a.keyword,
          riskLevel: a.risk_level,
          status: a.status,
          statusColor: statusColorMap[a.status] || 'text-gray-500'
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize
        }
      }
    });
  } catch (error) {
    console.error('활동 내역 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});
```

---

## 5. 관리자 정보 수정 (EditAdminInfo)

### 📁 파일 위치
`c:\KSJ\Fiveguys\pjt-gmss\frontend\src\pages\admin\EditAdminInfo.jsx`

### 🔧 필요한 기능
1. 관리자 프로필 조회
2. 프로필 이미지 업로드
3. 닉네임 변경
4. 비밀번호 변경
5. 알림 설정 변경

### 📡 API 엔드포인트

#### 5.1. 프로필 조회
```javascript
GET /api/admin/profile
```

**응답 형식:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "admin-001",
      "email": "admin@test.com",
      "nickname": "관리자",
      "profileImage": "https://example.com/profile.jpg",
      "notifications": {
        "riskAlert": true,
        "hourlyCheck": false,
        "weeklyReport": true
      }
    }
  }
}
```

#### 5.2. 프로필 수정
```javascript
PUT /api/admin/profile
```

**요청 형식:**
```json
{
  "nickname": "새 닉네임",
  "currentPassword": "current123",
  "newPassword": "new123",
  "notifications": {
    "riskAlert": true,
    "hourlyCheck": true,
    "weeklyReport": false
  }
}
```

#### 5.3. 프로필 이미지 업로드
```javascript
POST /api/admin/profile/image
Content-Type: multipart/form-data
```

### 💾 DB 스키마

```sql
CREATE TABLE admins (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50),
  profile_image VARCHAR(500),
  notification_risk_alert BOOLEAN DEFAULT TRUE,
  notification_hourly_check BOOLEAN DEFAULT FALSE,
  notification_weekly_report BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);
```

### 🖥️ 백엔드 구현

```javascript
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'admin-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 프로필 조회
router.get('/profile', authenticateAdmin, async (req, res) => {
  try {
    const [admins] = await db.query(
      `SELECT id, email, nickname, profile_image,
              notification_risk_alert, notification_hourly_check, notification_weekly_report
       FROM admins
       WHERE id = ?`,
      [req.user.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({ success: false, message: '관리자를 찾을 수 없습니다.' });
    }

    const admin = admins[0];
    res.json({
      success: true,
      data: {
        profile: {
          id: admin.id,
          email: admin.email,
          nickname: admin.nickname,
          profileImage: admin.profile_image,
          notifications: {
            riskAlert: admin.notification_risk_alert,
            hourlyCheck: admin.notification_hourly_check,
            weeklyReport: admin.notification_weekly_report
          }
        }
      }
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 프로필 수정
router.put('/profile', authenticateAdmin, async (req, res) => {
  try {
    const { nickname, currentPassword, newPassword, notifications } = req.body;
    const adminId = req.user.id;

    // 비밀번호 변경 시 현재 비밀번호 확인
    if (newPassword) {
      const [admins] = await db.query(
        'SELECT password FROM admins WHERE id = ?',
        [adminId]
      );

      const isValidPassword = await bcrypt.compare(currentPassword, admins[0].password);
      if (!isValidPassword) {
        return res.status(400).json({ success: false, message: '현재 비밀번호가 일치하지 않습니다.' });
      }

      // 새 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.query(
        'UPDATE admins SET password = ? WHERE id = ?',
        [hashedPassword, adminId]
      );
    }

    // 닉네임 및 알림 설정 업데이트
    await db.query(
      `UPDATE admins
       SET nickname = ?,
           notification_risk_alert = ?,
           notification_hourly_check = ?,
           notification_weekly_report = ?
       WHERE id = ?`,
      [
        nickname,
        notifications.riskAlert,
        notifications.hourlyCheck,
        notifications.weeklyReport,
        adminId
      ]
    );

    res.json({ success: true, message: '프로필이 성공적으로 업데이트되었습니다.' });
  } catch (error) {
    console.error('프로필 수정 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 프로필 이미지 업로드
router.post('/profile/image', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '이미지 파일이 필요합니다.' });
    }

    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    
    await db.query(
      'UPDATE admins SET profile_image = ? WHERE id = ?',
      [imageUrl, req.user.id]
    );

    res.json({
      success: true,
      data: { imageUrl }
    });
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});
```

---

## 6. 백엔드 프로젝트 구조

```
backend/
├── config/
│   ├── database.js          # DB 연결 설정
│   └── auth.js              # JWT 설정
├── middleware/
│   └── auth.js              # 인증 미들웨어
├── routes/
│   └── admin.js             # 관리자 라우트
├── uploads/
│   └── profiles/            # 프로필 이미지 저장
├── .env                     # 환경 변수
├── server.js                # 메인 서버 파일
└── package.json
```

### config/database.js
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

### middleware/auth.js
```javascript
const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: '인증 토큰이 필요합니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: '관리자 권한이 필요합니다.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = { authenticateAdmin };
```

### server.js
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const adminRoutes = require('./routes/admin');

const app = express();

// 미들웨어
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use('/uploads', express.static('uploads'));

// 라우트
app.use('/api/admin', adminRoutes);

// 에러 핸들링
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 7. 환경 설정

### .env
```env
# 서버 설정
PORT=5000
NODE_ENV=development

# 데이터베이스 설정
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=counsel_db

# JWT 설정
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# CORS 설정
CORS_ORIGIN=http://localhost:5173
```

### package.json
```json
{
  "name": "counsel-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 8. 프론트엔드 Axios 설정

### src/api/axios.js
```javascript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/member/signin';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## 9. DB 연동 순서

### 단계별 작업 순서

1. **백엔드 환경 설정**
   - Node.js 프로젝트 초기화
   - 필요한 패키지 설치
   - .env 파일 설정

2. **데이터베이스 설정**
   - MySQL/MariaDB 데이터베이스 생성
   - 테이블 생성 (위의 스키마 참고)
   - 초기 데이터 삽입

3. **백엔드 API 구현**
   - 라우트 파일 작성
   - 미들웨어 설정
   - API 엔드포인트 구현

4. **프론트엔드 연동**
   - Axios 설정
   - 더미 데이터 제거
   - API 호출 로직 추가
   - 로딩 상태 처리
   - 에러 핸들링

5. **테스트**
   - Postman으로 API 테스트
   - 프론트엔드에서 실제 데이터 확인
   - 페이지네이션 동작 확인
   - 에러 케이스 테스트

6. **최적화**
   - 쿼리 성능 최적화
   - 인덱스 추가
   - 캐싱 적용 (Redis)
   - 이미지 최적화

---

## 10. 주의사항

### 보안
- ✅ 모든 관리자 API는 인증 필수
- ✅ 비밀번호는 반드시 해싱 후 저장
- ✅ SQL Injection 방지 (Prepared Statement 사용)
- ✅ XSS 방지 (입력값 검증)
- ✅ CORS 설정 적절히 관리

### 성능
- ✅ 페이지네이션으로 대량 데이터 처리
- ✅ 인덱스 활용으로 쿼리 최적화
- ✅ 불필요한 JOIN 최소화
- ✅ 캐싱 전략 수립

### 유지보수
- ✅ 에러 로그 기록
- ✅ API 문서화
- ✅ 코드 주석 작성
- ✅ 버전 관리

---

## 연락처
문의사항이 있으시면 개발팀에 연락 주세요.

마지막 업데이트: 2026-02-02
