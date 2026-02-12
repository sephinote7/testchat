const toShortDate = (iso) => {
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
};

const createSeededRandom = (seed) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const pad2 = (n) => String(n).padStart(2, '0');

const formatDateTime = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}`;
};

const COMMENT_AUTHORS = [
  '피그말리온',
  '고민상담러',
  '오늘도화이팅',
  '루틴러버',
  '취뽀가자',
  '멘탈관리중',
  '자기계발중',
  '인터뷰마스터',
  '기록하는사람',
  '지나가던사람',
];

const COMMENT_TEMPLATES = [
  '저도 비슷했어요. 한 번에 바꾸기보다 작은 목표부터 시작해보는 게 도움 됐습니다.',
  '이런 상황이면 정말 힘들죠. 지금 가장 부담되는 포인트가 뭐예요?',
  '저는 “할 수 있는 것/없는 것”을 나눠서 정리하니 마음이 좀 편해졌어요.',
  '너무 잘하려고 하지 않아도 돼요. 오늘 한 걸 체크하는 것만으로도 충분해요.',
  '공감해요. 저도 그랬는데 루틴을 “최소 기준”으로 잡으니 지속이 되더라고요.',
  '상황을 조금 더 자세히 알려주면 같이 방법을 찾아볼 수 있을 것 같아요.',
  '면접/취업은 컨디션이 진짜 중요해요. 쉬는 시간도 계획에 포함해보세요.',
  '좋은 글 감사합니다. 덕분에 저도 다시 정리해보게 되네요.',
  '한 번에 해결하려 하지 말고, 오늘 할 수 있는 1개만 정해보는 건 어때요?',
  '저는 메모/기록이 도움이 됐어요. 감정이 올라올 때 바로 적어두면 좋아요.',
];

const getCommentCountForPost = (postId) => {
  const rand = createSeededRandom(postId * 9973);
  return 8 + Math.floor(rand() * 5); // 8~12
};

const getCommentsForPost = (postId) => {
  const count = getCommentCountForPost(postId);
  const rand = createSeededRandom(postId * 13579);

  // 날짜는 2026-01-14~2026-01-30 사이로 대략 분산
  const base = new Date('2026-01-14T10:00:00');
  const comments = [];

  for (let i = 0; i < count; i += 1) {
    const author = COMMENT_AUTHORS[Math.floor(rand() * COMMENT_AUTHORS.length)];
    const content = COMMENT_TEMPLATES[Math.floor(rand() * COMMENT_TEMPLATES.length)];
    const minutesToAdd = Math.floor(rand() * 60 * 24 * 14); // 최대 14일
    const createdAt = new Date(base.getTime() + minutesToAdd * 60 * 1000);
    const likes = Math.floor(rand() * 7); // 0~6

    comments.push({
      id: `${postId}-${i + 1}`,
      postId,
      author,
      content,
      createdAt: formatDateTime(createdAt.toISOString()),
      likes,
      replies: 0,
    });
  }

  // 최신이 아래로 쌓이도록(기본)
  return comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

// category: '자유' | 'MBTI' | '공지'
const rawPosts = [
  // 공지 (3개)
  {
    id: 1,
    category: '공지',
    isNotice: true,
    title: '[공지] 커뮤니티 이용 가이드 (필독)',
    author: '관리자',
    createdAt: '2026-01-20T09:10:00',
    views: 1820,
    likes: 210,
    mbti: null,
    content:
      '커뮤니티 이용 가이드입니다. 비방/혐오/개인정보 노출은 제재 대상입니다. 서로 존중하며 이용해주세요.',
  },
  {
    id: 2,
    category: '공지',
    isNotice: true,
    title: '[공지] 상담 예약/결제 테스트 안내',
    author: '관리자',
    createdAt: '2026-01-22T11:00:00',
    views: 980,
    likes: 90,
    mbti: null,
    content:
      '현재 상담 예약/결제는 테스트 버튼으로만 동작합니다. 실제 결제 시스템은 추후 도입 예정입니다.',
  },
  {
    id: 3,
    category: '공지',
    isNotice: true,
    title: '[공지] MBTI 게시판 오픈!',
    author: '관리자',
    createdAt: '2026-01-25T10:30:00',
    views: 760,
    likes: 120,
    mbti: null,
    content:
      'MBTI 게시판이 오픈되었습니다! 글 작성 시 MBTI 유형을 선택하면 같은 유형/관심사끼리 더 쉽게 소통할 수 있어요.',
  },

  // 자유
  {
    id: 4,
    category: '자유',
    isNotice: false,
    title: '새해 목표 세웠는데 벌써 흔들려요…',
    author: '임삼미',
    createdAt: '2026-01-26T08:42:00',
    views: 412,
    likes: 31,
    mbti: null,
    content: '목표는 세웠는데 꾸준히 하는 게 너무 어렵네요. 다들 어떻게 유지하시나요?',
  },
  {
    id: 5,
    category: '자유',
    isNotice: false,
    title: '요즘 잠이 너무 안 와요',
    author: '피그말리온',
    createdAt: '2026-01-26T22:15:00',
    views: 530,
    likes: 44,
    mbti: null,
    content: '밤에 생각이 많아지면 잠이 안 와요. 루틴 추천해주실 분?',
  },
  {
    id: 6,
    category: '자유',
    isNotice: false,
    title: '면접에서 자꾸 말이 꼬여요…',
    author: '전우치',
    createdAt: '2026-01-27T14:05:00',
    views: 690,
    likes: 60,
    mbti: null,
    content: '준비는 했는데 실제 면접에서 말이 꼬이고 머리가 하얘져요. 팁 있을까요?',
  },
  {
    id: 7,
    category: '자유',
    isNotice: false,
    title: '사람 만나는 게 지치네요',
    author: '손오공',
    createdAt: '2026-01-27T19:20:00',
    views: 380,
    likes: 28,
    mbti: null,
    content: '약속이 많아지면 피곤해져요. 적당한 선을 어떻게 잡아야 할까요?',
  },
  {
    id: 8,
    category: '자유',
    isNotice: false,
    title: '자존감 올리는 방법 공유해요',
    author: '유관순',
    createdAt: '2026-01-28T09:30:00',
    views: 1010,
    likes: 130,
    mbti: null,
    content: '작은 성취 기록, 비교 끊기, 내가 좋아하는 활동 찾기… 여러분의 방법도 궁금해요!',
  },

  // MBTI (12개)
  {
    id: 9,
    category: 'MBTI',
    isNotice: false,
    title: 'INTJ인데 인간관계가 너무 피곤해요',
    author: '고민중',
    createdAt: '2026-01-28T12:10:00',
    views: 620,
    likes: 72,
    mbti: 'INTJ',
    content: '최소한의 관계만 유지하고 싶은데, 주변에선 차갑다고 하네요. 어떻게 균형 잡나요?',
  },
  {
    id: 10,
    category: 'MBTI',
    isNotice: false,
    title: 'INFP 감정 기복 심할 때 다들 어떻게 해요?',
    author: '무드스윙',
    createdAt: '2026-01-28T18:40:00',
    views: 840,
    likes: 95,
    mbti: 'INFP',
    content: '하루에도 기분이 롤러코스터예요. 감정 정리 루틴 공유해주세요.',
  },
  {
    id: 11,
    category: 'MBTI',
    isNotice: false,
    title: 'ENTP는 아이디어만 많고 실행이…',
    author: '생각폭발',
    createdAt: '2026-01-29T09:05:00',
    views: 540,
    likes: 55,
    mbti: 'ENTP',
    content: '계획은 잘 세우는데 꾸준히 실행이 어렵네요. 실행력 올리는 방법?',
  },
  {
    id: 12,
    category: 'MBTI',
    isNotice: false,
    title: 'ISTJ는 갑자기 계획이 틀어지면 멘붕…',
    author: '루틴러',
    createdAt: '2026-01-29T10:55:00',
    views: 430,
    likes: 40,
    mbti: 'ISTJ',
    content: '계획대로 안 되면 스트레스가 커요. 유연해지는 연습이 필요할까요?',
  },
  {
    id: 13,
    category: 'MBTI',
    isNotice: false,
    title: 'ENFP인데 번아웃이 와요',
    author: '활력0',
    createdAt: '2026-01-29T13:20:00',
    views: 770,
    likes: 88,
    mbti: 'ENFP',
    content: '처음엔 열정적이다가 갑자기 에너지가 뚝 떨어져요. 회복 방법 있을까요?',
  },
  {
    id: 14,
    category: 'MBTI',
    isNotice: false,
    title: 'INFJ는 혼자 있는 시간이 꼭 필요해요',
    author: '조용히',
    createdAt: '2026-01-29T15:45:00',
    views: 510,
    likes: 66,
    mbti: 'INFJ',
    content: '혼자 충전해야 하는데 죄책감이 들어요. 다들 어떻게 설명하세요?',
  },
  {
    id: 15,
    category: 'MBTI',
    isNotice: false,
    title: 'ESTP인데 감정 표현이 서툴러요',
    author: '직진형',
    createdAt: '2026-01-29T19:10:00',
    views: 390,
    likes: 29,
    mbti: 'ESTP',
    content: '말로 감정을 표현하려면 어색해요. 관계에서 오해가 생기네요.',
  },
  {
    id: 16,
    category: 'MBTI',
    isNotice: false,
    title: 'ISFJ는 부탁을 거절하기가 너무 힘들어요',
    author: '착한사람',
    createdAt: '2026-01-30T08:05:00',
    views: 680,
    likes: 77,
    mbti: 'ISFJ',
    content: '거절하면 미안해서 계속 떠안게 돼요. 건강한 거절 방법이 필요해요.',
  },
  {
    id: 17,
    category: 'MBTI',
    isNotice: false,
    title: 'INTP는 생각이 너무 많아요',
    author: '과몰입',
    createdAt: '2026-01-30T09:25:00',
    views: 460,
    likes: 41,
    mbti: 'INTP',
    content: '머릿속 시뮬레이션이 끝이 없네요. 생각 멈추는 법 있을까요?',
  },
  {
    id: 18,
    category: 'MBTI',
    isNotice: false,
    title: 'ESFJ는 관계 갈등이 제일 힘들어요',
    author: '중재자',
    createdAt: '2026-01-30T10:10:00',
    views: 520,
    likes: 48,
    mbti: 'ESFJ',
    content: '갈등 상황이 오면 마음이 너무 불편해요. 감정 분리하는 팁 있을까요?',
  },
  {
    id: 19,
    category: 'MBTI',
    isNotice: false,
    title: 'ENFJ는 자꾸 내가 해결해주려 해요',
    author: '해결사',
    createdAt: '2026-01-30T11:40:00',
    views: 410,
    likes: 39,
    mbti: 'ENFJ',
    content: '상대 문제를 내 문제처럼 끌어안아요. 경계를 어떻게 세울까요?',
  },
  {
    id: 20,
    category: 'MBTI',
    isNotice: false,
    title: 'ISTP는 감정 얘기하면 답답해요',
    author: '쿨하게',
    createdAt: '2026-01-30T13:55:00',
    views: 360,
    likes: 25,
    mbti: 'ISTP',
    content: '감정 이야기가 길어지면 뭘 해야 할지 모르겠어요. 대화 요령이 궁금해요.',
  },
];

const posts = rawPosts.map((p) => ({ ...p, comments: getCommentCountForPost(p.id) }));

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

export { posts, MBTI_OPTIONS, toShortDate };
export { getCommentsForPost };

