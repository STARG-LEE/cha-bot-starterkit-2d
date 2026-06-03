// 블랙-숄즈 옵션 가격 + 그릭 계산 (교육용)
// S: 기초자산가격, K: 행사가, T: 잔존만기(년), r: 무위험금리(소수), sigma: 변동성(소수)

function normCdf(x) {
  // Abramowitz & Stegun 7.1.26 근사
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989422804014327 * Math.exp(-x * x / 2)
  let p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  if (x > 0) p = 1 - p
  return p
}

function normPdf(x) {
  return 0.3989422804014327 * Math.exp(-x * x / 2)
}

export function blackScholes({ S, K, T, r, sigma, type = 'call' }) {
  // 만기/변동성이 0에 가까우면 본질가치로 폴백
  if (T <= 0 || sigma <= 0) {
    const intrinsic = type === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0)
    return {
      price: intrinsic,
      delta: type === 'call' ? (S > K ? 1 : 0) : (S < K ? -1 : 0),
      gamma: 0, theta: 0, vega: 0, rho: 0,
    }
  }

  const sqrtT = Math.sqrt(T)
  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * sqrtT)
  const d2 = d1 - sigma * sqrtT
  const Nd1 = normCdf(d1)
  const Nd2 = normCdf(d2)
  const nd1 = normPdf(d1)

  let price, delta, theta, rho
  const gamma = nd1 / (S * sigma * sqrtT)
  const vega = (S * nd1 * sqrtT) / 100 // 1%p당

  if (type === 'call') {
    price = S * Nd1 - K * Math.exp(-r * T) * Nd2
    delta = Nd1
    theta = (-(S * nd1 * sigma) / (2 * sqrtT) - r * K * Math.exp(-r * T) * Nd2) / 365
    rho = (K * T * Math.exp(-r * T) * Nd2) / 100
  } else {
    price = K * Math.exp(-r * T) * normCdf(-d2) - S * normCdf(-d1)
    delta = Nd1 - 1
    theta = (-(S * nd1 * sigma) / (2 * sqrtT) + r * K * Math.exp(-r * T) * normCdf(-d2)) / 365
    rho = (-K * T * Math.exp(-r * T) * normCdf(-d2)) / 100
  }

  return { price, delta, gamma, theta, vega, rho }
}

// 만기 손익(페이오프) — 프리미엄 반영
export function payoffAtExpiry({ S, K, premium, type = 'call', side = 'long' }) {
  const intrinsic = type === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0)
  const longPnl = intrinsic - premium
  return side === 'long' ? longPnl : -longPnl
}
