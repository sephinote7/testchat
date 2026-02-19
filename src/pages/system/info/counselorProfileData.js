// 상담사 프로필 더미 데이터
export const counselorProfile = {
  id: 1,
  name: '아무지 상담사',
  title: '고민순삭 상담 388회 진행',
  tags: ['고민상담', '커리어상담', '취업상담'],
  profileImage: 'https://via.placeholder.com/300x200',
  introduction: {
    title: '솔루션을 위한 첫 시작',
    content: `Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque.`
  },
  certifications: [
    'Vorem ipsum dolor sit amet',
    'Vorem ipsum dolor sit amet',
    'Vorem ipsum dolor sit amet'
  ],
  otherInfo: [
    'Vorem ipsum dolor sit amet',
    'Vorem ipsum dolor sit amet',
    'Vorem ipsum dolor sit amet'
  ],
  detailedIntro: {
    title: '심리상담 세션 소개',
    subtitle: '상담을 통해 나아지는 점',
    sections: [
      {
        content: 'Vorem ipsum dolor sit amet, consectetur adipiscing elit.'
      },
      {
        content: 'Nunc vulputate libero et velit interdum, ac aliquet odio mattis.'
      },
      {
        content: 'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
      },
      {
        content: 'Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque.'
      }
    ]
  },
  expectation: {
    title: '상담은 이렇게 진행됩니다',
    steps: [
      {
        step: 1,
        content: 'Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora'
      },
      {
        step: 2,
        content: 'torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque.'
      }
    ]
  }
};

// 상담 리뷰 더미 데이터
export const counselorReviews = [
  {
    id: 1,
    author: '조햇아',
    date: '2026-01-14 11:34',
    rating: 5,
    views: 164,
    content: `해야 할 일은 과감히 하며, 결심한 일은 반드시 실행하라. -벤자민 프랭클린-

우리 인생에서 해야 할 일이 참 많지요. 또 새해에 계획하고 결심한 일들도 참 많지요. 그렇지만 여건 상 못하거나 힘들어서 주춤하는 일들이많기도 합니다. 그것을 새해에 계획한 하고 정한 하지 않는다면 이후 소용도 없겠지요. 그래서 새해가 되니 힘들어하는 저에게 저 명언이 참 마음에 와 닿습니다. 오늘도 저 명언을 되새기며 새해가 계획한 일들을 실행하려고 노력해 봅니다.

Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque.

Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque.

Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque.`,
    isAuthor: true // 작성자 본인 여부
  },
  {
    id: 2,
    author: '김민수',
    date: '2026-01-13 15:20',
    rating: 4,
    views: 98,
    content: `정말 좋은 상담이었습니다. 제가 고민하던 부분에 대해 명확한 방향을 제시해 주셔서 감사합니다. 앞으로도 꾸준히 상담 받고 싶습니다.

Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra.`,
    isAuthor: false
  },
  {
    id: 3,
    author: '이서연',
    date: '2026-01-12 09:45',
    rating: 5,
    views: 142,
    content: `상담사님께서 정말 진심으로 제 이야기를 들어주시고, 공감해 주셔서 큰 위로가 되었습니다. 힘든 시기를 잘 극복할 수 있을 것 같습니다. 감사합니다!`,
    isAuthor: false
  },
  {
    id: 4,
    author: '박지훈',
    date: '2026-01-11 18:30',
    rating: 5,
    views: 201,
    content: `취업 준비로 힘들었는데 상담을 통해 자신감을 얻었습니다. 구체적인 조언과 따뜻한 격려 덕분에 다시 힘을 낼 수 있었습니다.

Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.`,
    isAuthor: false
  },
  {
    id: 5,
    author: '최유진',
    date: '2026-01-10 14:15',
    rating: 4,
    views: 87,
    content: `상담이 생각보다 편안한 분위기에서 진행되어 좋았습니다. 제 고민을 잘 이해해 주시고 실질적인 해결책을 제시해 주셔서 도움이 많이 되었습니다.`,
    isAuthor: false
  },
  {
    id: 6,
    author: '정민호',
    date: '2026-01-09 11:20',
    rating: 5,
    views: 156,
    content: `커리어 고민으로 상담을 받았는데, 제가 생각하지 못했던 부분들을 짚어주셔서 많은 도움이 되었습니다. 추천합니다!`,
    isAuthor: false
  },
  {
    id: 7,
    author: '강예은',
    date: '2026-01-08 16:50',
    rating: 5,
    views: 112,
    content: `상담 시간이 너무 빨리 지나갔어요. 제 이야기를 끝까지 경청해 주시고, 적절한 피드백을 주셔서 감사합니다. 다음에도 꼭 상담 받고 싶습니다.`,
    isAuthor: false
  },
  {
    id: 8,
    author: '윤서준',
    date: '2026-01-07 13:40',
    rating: 4,
    views: 94,
    content: `진로 고민으로 많이 힘들었는데, 상담을 통해 제가 나아갈 방향을 찾을 수 있었습니다. 정말 감사드립니다.`,
    isAuthor: false
  }
];
