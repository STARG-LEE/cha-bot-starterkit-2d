// 옵션(파생상품) 거래 자격 — 국내·해외 사전교육/모의거래/승인 요건
// ※ 2026년 6월 기준 조사. 세부 요건(교육 시간·기본예탁금·승인 기준)은 투자자 유형·증권사·
//    브로커·당국 정책에 따라 달라질 수 있으니, 거래 전 반드시 공식 사이트와 거래 회사에서 확인하세요.

export const KIFIN_URL = 'https://www.kifin.or.kr'   // 한국금융투자협회 금융투자교육원(사전교육·수료증)
export const KRX_URL   = 'https://www.krx.co.kr'     // 한국거래소(모의거래)
export const IBKR_URL  = 'https://www.ibkrguides.com/clientportal/optionstradingpermissions.htm' // IBKR 옵션 레벨 공식 안내

// 국내 대표 증권사 선물·옵션 안내
export const KR_BROKERS = [
  { label: '키움증권', url: 'https://www.kiwoom.com/h/domestic/fuop/VFuopMainView' },
  { label: '미래에셋증권', url: 'https://securities.miraeasset.com/imf/800/imf101.do' },
]

// 수료증이 필요한 두 경로 (국내 / 국내 증권사 경유 해외)
export const CERT_INFO = [
  {
    key: 'domestic',
    flag: '🇰🇷',
    title: '국내 — 한국거래소 선물·옵션',
    basis: '금융위 파생상품 발전방안(2019.5.30) 의무교육',
    items: [
      '사전 의무교육 1~10시간 + 모의거래 3시간 이상 이수',
      '기본예탁금 예탁 — 보통 1,000만원부터, 투자자 등급별 차등(증권사 자율)',
      '수료증 출력 → 거래 증권사에 제출해야 거래 활성화',
      '옵션 매도 등 고위험 거래는 상위 단계(추가 예탁금) 요건 적용',
    ],
    issuer: '한국금융투자협회 금융투자교육원',
    links: [
      { label: '금융투자교육원 (사전교육·수료증)', url: KIFIN_URL },
      { label: '한국거래소 (모의거래)', url: KRX_URL },
      { label: '키움증권 안내', url: KR_BROKERS[0].url },
      { label: '미래에셋증권 안내', url: KR_BROKERS[1].url },
    ],
  },
  {
    key: 'overseas-kr',
    flag: '🌐',
    title: '해외 — 국내 증권사 경유 (해외선물·옵션)',
    basis: '금융감독원 의무화 (2025.12.15 시행)',
    items: [
      '사전교육 1시간 이상 + 모의거래 3시간 이상',
      '투자성향·연령별 차등 (예: 무경험 65세 이상 → 교육 10h·모의 7h)',
      '해외 레버리지 ETP는 사전교육 1시간 (모의거래 제외)',
      '사전교육은 금융투자협회 학습시스템에서 동영상 수강',
    ],
    issuer: '금융투자협회 학습시스템 (금융투자교육원)',
    links: [
      { label: '금융투자협회 학습시스템', url: KIFIN_URL },
    ],
  },
]

// 해외 직접계좌(해외 브로커) — 정부 수료증이 아니라 브로커가 부여하는 "옵션 승인 레벨"
export const OPTION_LEVELS = [
  { lv: 1, color: '#16a34a', allow: '커버드콜 — 보유 주식 + 콜 매도' },
  { lv: 2, color: '#65a30d', allow: '+ 콜·풋 매수, 롱 스트래들·스트랭글, 프로텍티브 풋' },
  { lv: 3, color: '#d97706', allow: '+ 손실이 한정된 전략 (스프레드·숏풋·버터플라이)' },
  { lv: 4, color: '#dc2626', allow: '모든 전략 (네이키드 옵션 매도 포함)' },
]

export const DIRECT_INFO = {
  note: '해외 브로커(IBKR·Tastytrade·Schwab 등)는 정부 수료증이 아니라, 신청자의 투자경험·재정상태(순자산·소득)·투자목표를 평가해 “옵션 거래 레벨”을 부여합니다. 레벨이 높을수록 위험한 전략이 허용돼요.',
  tiers: '브로커마다 단계 수가 달라요 — IBKR·E*TRADE 4단계 · tastytrade 3단계 · Fidelity 5단계 · Robinhood 2단계(네이키드 불가).',
  caution: '국내 증권사를 통한 해외파생은 위 [해외] 사전교육이 적용되고, 해외 브로커 직접계좌는 해당 브로커의 승인 절차를 따릅니다.',
  links: [
    { label: 'IBKR 옵션 레벨 공식 안내', url: IBKR_URL },
  ],
}

export const CERT_ASK = '국내(한국거래소)와 해외(국내 증권사 경유, 그리고 해외 브로커 직접계좌) 각각에서 옵션을 거래하려면 어떤 사전교육·모의거래·수료증 또는 옵션 승인 레벨이 필요한지 순서대로 정리해줘. 기본예탁금과 수료증 제출, 브로커 승인 레벨(1~4)도 포함해서 초보자가 따라 할 수 있게 알려줘.'
