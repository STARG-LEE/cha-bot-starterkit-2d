// 옵션 용어집 — 에브리옵션 with GREEK
// 봇 연계: 각 용어의 askPrompt(term)로 GREEK에게 쉬운 설명을 요청한다.
//
// category: 기초 | 가격상태 | 그릭 | 변동성 | 전략 | 제도
// level: 1(입문) | 2(기본) | 3(심화)

export const CATEGORIES = [
  { key: '기초',     label: '옵션 기초',   color: '#1d4ed8' },
  { key: '가격상태', label: '가격 상태',   color: '#0891b2' },
  { key: '그릭',     label: '그릭(Greeks)', color: '#c9a227' },
  { key: '변동성',   label: '변동성',      color: '#7c3aed' },
  { key: '전략',     label: '옵션 전략',   color: '#16a34a' },
  { key: '제도',     label: '제도·자격',   color: '#b45309' },
]

export const GLOSSARY = [
  // ── 기초 ──
  {
    id: 'option', term: '옵션', en: 'Option', category: '기초', level: 1,
    summary: '미래의 정해진 가격에 사거나 팔 수 있는 "권리"를 사고파는 계약.',
    detail: '기초자산(주식·지수 등)을 만기일에 미리 정한 행사가격으로 거래할 수 있는 권리예요. 권리이므로 불리하면 행사하지 않아도 됩니다. 매수자는 권리를, 매도자는 의무를 집니다.',
  },
  {
    id: 'call', term: '콜옵션', en: 'Call Option', category: '기초', level: 1,
    summary: '정해진 가격에 "살 수 있는" 권리. 오를 것 같을 때.',
    detail: '기초자산을 행사가격에 매수할 권리입니다. 가격이 행사가보다 많이 오를수록 이익이 커집니다. "콜=Call=불러서 사온다"로 기억하면 쉬워요.',
  },
  {
    id: 'put', term: '풋옵션', en: 'Put Option', category: '기초', level: 1,
    summary: '정해진 가격에 "팔 수 있는" 권리. 내릴 것 같을 때.',
    detail: '기초자산을 행사가격에 매도할 권리입니다. 가격이 내릴수록 이익이 커져 하락 방어(보험)에 쓰입니다. "풋=Put=내려놓고 판다"로 기억하세요.',
  },
  {
    id: 'strike', term: '행사가격', en: 'Strike Price', category: '기초', level: 1,
    summary: '옵션을 행사할 때 적용되는 미리 약속된 가격(스트라이크).',
    detail: '콜은 이 가격에 사고, 풋은 이 가격에 팝니다. 현재가 대비 행사가의 위치가 내가격/등가격/외가격을 결정합니다.',
  },
  {
    id: 'expiry', term: '만기일', en: 'Expiration', category: '기초', level: 1,
    summary: '옵션의 권리가 사라지는 마지막 날.',
    detail: '만기가 지나면 옵션은 소멸합니다. 만기가 가까울수록 시간가치가 빠르게 줄어듭니다(세타). 국내 지수옵션은 보통 매월 둘째 목요일이 만기입니다.',
  },
  {
    id: 'premium', term: '프리미엄', en: 'Premium', category: '기초', level: 1,
    summary: '옵션을 사기 위해 지불하는 가격(옵션의 값).',
    detail: '프리미엄 = 본질가치 + 시간가치. 매수자는 프리미엄을 내고 권리를 얻고, 매도자는 프리미엄을 받고 의무를 집니다.',
  },
  {
    id: 'long-short', term: '매수·매도 포지션', en: 'Long / Short', category: '기초', level: 2,
    summary: '롱(매수)=권리 보유, 숏(매도)=의무 부담.',
    detail: '옵션 매수자(롱)는 손실이 프리미엄으로 한정되지만, 매도자(숏)는 프리미엄을 받는 대신 큰 손실 위험을 질 수 있습니다.',
  },
  {
    id: 'exercise', term: '권리행사', en: 'Exercise', category: '기초', level: 2,
    summary: '옵션의 권리를 실제로 사용하는 것.',
    detail: '유럽형은 만기에만, 미국형은 만기 전 아무 때나 행사할 수 있습니다. 국내 주가지수옵션은 유럽형입니다.',
  },

  // ── 가격 상태 ──
  {
    id: 'itm', term: '내가격', en: 'In The Money (ITM)', category: '가격상태', level: 2,
    summary: '지금 행사하면 이득인 상태. (본질가치 > 0)',
    detail: '콜은 현재가>행사가, 풋은 현재가<행사가일 때 내가격입니다. 본질가치가 있어 프리미엄이 비쌉니다.',
  },
  {
    id: 'atm', term: '등가격', en: 'At The Money (ATM)', category: '가격상태', level: 2,
    summary: '현재가 ≈ 행사가. 시간가치가 가장 큰 지점.',
    detail: '방향이 정해지지 않아 감마·세타가 가장 크게 작동합니다. 변동성 거래의 핵심 구간이에요.',
  },
  {
    id: 'otm', term: '외가격', en: 'Out of The Money (OTM)', category: '가격상태', level: 2,
    summary: '지금 행사하면 손해인 상태. (본질가치 = 0, 시간가치만)',
    detail: '콜은 현재가<행사가, 풋은 현재가>행사가. 프리미엄이 싸고 레버리지가 크지만 만기에 휴지가 될 확률도 높습니다.',
  },
  {
    id: 'intrinsic', term: '본질가치', en: 'Intrinsic Value', category: '가격상태', level: 2,
    summary: '지금 당장 행사했을 때의 이득. 0보다 작아지지 않음.',
    detail: '콜 본질가치 = max(현재가-행사가, 0), 풋 = max(행사가-현재가, 0). 프리미엄에서 본질가치를 빼면 시간가치입니다.',
  },
  {
    id: 'timevalue', term: '시간가치', en: 'Time Value', category: '가격상태', level: 2,
    summary: '만기까지 남은 시간과 변동성에 대한 기대값.',
    detail: '만기가 다가오면 0으로 수렴합니다(세타 소멸). 외가격 옵션의 프리미엄은 전부 시간가치입니다.',
  },

  // ── 그릭 ──
  {
    id: 'delta', term: '델타', en: 'Delta', symbol: 'Δ', category: '그릭', level: 2,
    summary: '기초자산이 1 움직일 때 옵션 가격이 얼마나 움직이는가.',
    detail: '콜 0~1, 풋 -1~0. 등가격은 약 ±0.5. "이 옵션이 행사될(내가격으로 끝날) 대략적 확률"로도 읽습니다.',
  },
  {
    id: 'gamma', term: '감마', en: 'Gamma', symbol: 'Γ', category: '그릭', level: 3,
    summary: '기초자산이 움직일 때 델타가 얼마나 변하는가(델타의 가속도).',
    detail: '등가격·만기 임박에서 가장 큽니다. 감마가 크면 작은 가격 변화에도 손익이 급변해 관리가 까다롭습니다.',
  },
  {
    id: 'theta', term: '세타', en: 'Theta', symbol: 'Θ', category: '그릭', level: 2,
    summary: '하루 지날 때마다 옵션 가격이 줄어드는 속도(시간 소멸).',
    detail: '대부분 음수 — 매수자에겐 불리, 매도자에겐 유리합니다. 만기가 가까울수록 빨라집니다.',
  },
  {
    id: 'vega', term: '베가', en: 'Vega', symbol: 'ν', category: '그릭', level: 2,
    summary: '내재변동성이 1%p 변할 때 옵션 가격이 얼마나 변하는가.',
    detail: '변동성이 오르면 콜·풋 모두 비싸집니다. 장기·등가격 옵션일수록 베가가 큽니다.',
  },
  {
    id: 'rho', term: '로', en: 'Rho', symbol: 'ρ', category: '그릭', level: 3,
    summary: '금리가 1%p 변할 때 옵션 가격이 얼마나 변하는가.',
    detail: '보통 영향이 가장 작지만, 만기가 긴 옵션이나 금리 급변기에는 무시할 수 없습니다.',
  },

  // ── 변동성 ──
  {
    id: 'iv', term: '내재변동성', en: 'Implied Volatility (IV)', category: '변동성', level: 3,
    summary: '시장 가격에 녹아있는 "미래 변동성 기대치".',
    detail: '옵션 가격을 블랙숄즈에 거꾸로 넣어 역산합니다. IV가 높으면 프리미엄이 비싸요. "옵션의 체감 온도"라고 보면 됩니다.',
  },
  {
    id: 'hv', term: '역사적변동성', en: 'Historical Volatility', category: '변동성', level: 3,
    summary: '과거 실제 가격 움직임으로 계산한 변동성.',
    detail: 'IV(미래 기대)와 HV(과거 실현)의 차이를 보고 옵션이 비싼지 싼지 가늠합니다.',
  },
  {
    id: 'vkospi', term: 'VKOSPI', en: 'Volatility Index', category: '변동성', level: 3,
    summary: '코스피200 옵션의 내재변동성을 지수화한 "공포지수".',
    detail: '시장이 불안하면 급등합니다. 변동성 매매·헤지 타이밍의 핵심 지표예요.',
  },

  // ── 전략 ──
  {
    id: 'coveredcall', term: '커버드콜', en: 'Covered Call', category: '전략', level: 3,
    summary: '주식 보유 + 콜 매도. 횡보장에서 프리미엄 수익.',
    detail: '주가가 크게 오르면 수익이 제한되지만, 안 움직이거나 약상승할 때 프리미엄만큼 추가 수익을 얻습니다.',
  },
  {
    id: 'protectiveput', term: '프로텍티브풋', en: 'Protective Put', category: '전략', level: 3,
    summary: '주식 보유 + 풋 매수. 하락에 대비한 "보험".',
    detail: '풋 프리미엄이 보험료입니다. 폭락 시 손실을 행사가 수준에서 막아줍니다.',
  },
  {
    id: 'straddle', term: '스트래들', en: 'Straddle', category: '전략', level: 3,
    summary: '같은 행사가의 콜+풋 동시 매수. 방향 무관, 큰 변동에 베팅.',
    detail: '실적 발표 등 "크게 움직일 건 확실한데 방향은 모를 때" 사용. 변동성이 작으면 양쪽 프리미엄을 다 잃습니다.',
  },
  {
    id: 'spread', term: '스프레드', en: 'Spread', category: '전략', level: 3,
    summary: '옵션을 사고+팔아 위험과 비용을 동시에 줄이는 조합.',
    detail: '불스프레드(상승 제한 베팅), 베어스프레드(하락 제한 베팅) 등. 최대손익이 정해져 초보자 친화적입니다.',
  },

  // ── 제도·자격 ──
  {
    id: 'pre-edu', term: '파생상품 사전교육', en: 'Pre-trade Education', category: '제도', level: 1,
    summary: '옵션·선물 거래 전 의무적으로 이수하는 교육.',
    detail: '금융투자협회의 사전교육(1시간)을 이수해야 거래 자격 신청이 가능합니다. 에브리옵션의 학습 로드맵이 이 과정을 도와줍니다.',
  },
  {
    id: 'mock-trade', term: '모의거래', en: 'Mock Trading', category: '제도', level: 1,
    summary: '실제 자격 취득 전 의무적으로 거치는 가상 매매 실습.',
    detail: '파생상품 계좌 개설 요건 중 하나입니다(일정 시간 이상). 위험 없이 주문·청산을 연습합니다.',
  },
  {
    id: 'deposit', term: '기본예탁금', en: 'Base Deposit', category: '제도', level: 2,
    summary: '파생상품 계좌 개설·유지에 필요한 최소 예탁 금액.',
    detail: '투자자 등급·상품에 따라 다릅니다. 진입장벽 중 하나로, 사전교육·모의거래·경험요건과 함께 요구됩니다.',
  },
  {
    id: 'margin', term: '증거금', en: 'Margin', category: '제도', level: 2,
    summary: '옵션 매도·선물 거래 시 예치하는 담보.',
    detail: '매도 포지션은 손실이 커질 수 있어 증거금이 필요합니다. 부족하면 마진콜(추가 납입 요구)이 발생합니다.',
  },
  {
    id: 'open-interest', term: '미결제약정', en: 'Open Interest', category: '제도', level: 3,
    summary: '아직 청산되지 않고 살아있는 계약의 총 수.',
    detail: '거래량과 함께 시장 참여·관심도를 보여줍니다. 특정 행사가의 미결제약정은 지지·저항 단서가 되기도 합니다.',
  },
]

// 봇 연계용 프롬프트 — 용어 카드의 "GREEK에게 물어보기"가 사용
export function glossaryAsk(item) {
  const sym = item.symbol ? ` (${item.symbol})` : ''
  return `옵션 용어 "${item.term}${sym} / ${item.en}"를 옵션 입문자도 단번에 이해할 수 있게, 일상적인 비유를 하나 들어 쉽게 설명해줘. 마지막에 핵심을 한 문장으로 요약해줘.`
}
