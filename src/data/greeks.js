// 5대 그릭 — 봇 이름 GREEK의 정체성(Δ Γ Θ Ν ρ)
export const GREEKS = [
  {
    symbol: 'Δ', key: 'delta', name: '델타', en: 'Delta',
    color: '#1d4ed8',
    oneLine: '기초자산이 1 움직이면 옵션값은 얼마?',
    plain: '방향 민감도. 콜 0~1, 풋 -1~0. 내가격으로 끝날 확률로도 읽어요.',
  },
  {
    symbol: 'Γ', key: 'gamma', name: '감마', en: 'Gamma',
    color: '#0891b2',
    oneLine: '델타가 변하는 속도(가속도)',
    plain: '등가격·만기 임박에서 최대. 클수록 손익이 급변해요.',
  },
  {
    symbol: 'Θ', key: 'theta', name: '세타', en: 'Theta',
    color: '#dc2626',
    oneLine: '하루가 지날 때 녹는 시간가치',
    plain: '매수자엔 적, 매도자엔 친구. 만기 임박에 가속됩니다.',
  },
  {
    symbol: 'ν', key: 'vega', name: '베가', en: 'Vega',
    color: '#7c3aed',
    oneLine: '변동성 1%p 변하면 옵션값은 얼마?',
    plain: '변동성이 오르면 콜·풋 둘 다 비싸져요. 공포가 곧 프리미엄.',
  },
  {
    symbol: 'ρ', key: 'rho', name: '로', en: 'Rho',
    color: '#16a34a',
    oneLine: '금리 1%p 변하면 옵션값은 얼마?',
    plain: '영향은 가장 작지만 장기 옵션·금리 급변기엔 살아납니다.',
  },
]

export function greekAsk(g) {
  return `옵션 그릭 중 "${g.name}(${g.en}, ${g.symbol})"가 실전 옵션 거래에서 왜 중요한지, 초보자가 꼭 알아야 할 포인트를 예시와 함께 알려줘.`
}
