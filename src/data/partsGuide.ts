export interface PartInfo {
  part: number;
  title: string;
  section: 'LC' | 'RC';
  summary: string;
  tips: string[];
}

export const PARTS_GUIDE: PartInfo[] = [
  {
    part: 1,
    title: "사진 묘사 (Photographs)",
    section: 'LC',
    summary: "사진을 보고 알맞은 설명을 고릅니다. 문제 수가 적어 점수 확보에 유리합니다.",
    tips: [
      "인물·물건·위치·동작을 미리 관찰하세요.",
      "비슷한 발음 단어에 속지 마세요.",
      "현재진행형(~ing)이 자주 나옵니다.",
    ],
  },
  {
    part: 2,
    title: "응답 (Question-Response)",
    section: 'LC',
    summary: "짧은 질문에 알맞은 응답을 고릅니다. 초보에게는 가장 어려운 LC 파트 중 하나입니다.",
    tips: [
      "의문사(Who/When/Where/Why/How)를 놓치지 마세요.",
      "Yes/No 질문이 아니면 Yes로 답하지 않습니다.",
      "비슷한 소리로 헷갈리게 하는 함정에 주의하세요.",
    ],
  },
  {
    part: 3,
    title: "짧은 대화 (Conversations)",
    section: 'LC',
    summary: "두세 명의 짧은 대화를 듣고 문제 3개에 답합니다.",
    tips: [
      "문제를 먼저 읽고 무엇을 들을지 예측하세요.",
      "장소·직업·다음 행동·요청을 자주 묻습니다.",
      "대화 초반에 주제·장소가 나오는 경우가 많습니다.",
    ],
  },
  {
    part: 4,
    title: "짧은 담화 (Talks)",
    section: 'LC',
    summary: "한 사람이 말하는 안내·방송·연설을 듣고 문제 3개에 답합니다.",
    tips: [
      "안내방송, 광고, 뉴스, 투어 설명이 자주 나옵니다.",
      "숫자·시간·장소 정보를 메모하세요.",
      "Part 3과 같이 선지를 미리 읽는 습관이 중요합니다.",
    ],
  },
  {
    part: 5,
    title: "단문 빈칸 (Incomplete Sentences)",
    section: 'RC',
    summary: "문장 빈칸에 알맞은 단어·구를 고릅니다. 문법·어휘 실력을 바로 키울 수 있는 파트입니다.",
    tips: [
      "품사(명사/동사/형용사/부사)를 먼저 확인하세요.",
      "전치사·접속사·시제 패턴을 반복 학습하세요.",
      "이 앱의 Part 5 퀴즈로 매일 연습하세요!",
    ],
  },
  {
    part: 6,
    title: "장문 빈칸 (Text Completion)",
    section: 'RC',
    summary: "이메일·공지문 등 짧은 글의 빈칸을 채웁니다. Part 5 + 문맥 이해입니다.",
    tips: [
      "빈칸 앞뒤 문장을 꼭 읽으세요.",
      "연결어(however, therefore 등) 연습이 도움이 됩니다.",
      "전체 글의 목적(안내/요청/감사)을 파악하세요.",
    ],
  },
  {
    part: 7,
    title: "독해 (Reading Comprehension)",
    section: 'RC',
    summary: "이메일, 기사, 광고, 채팅 등을 읽고 문제에 답합니다. 시간이 가장 부족한 파트입니다.",
    tips: [
      "문제를 먼저 보고 필요한 정보만 찾으세요(스캐닝).",
      "단일 지문 → 이중/삼중 지문 순으로 난이도가 올라갑니다.",
      "모르는 단어에 너무 오래 머물지 마세요.",
    ],
  },
];
