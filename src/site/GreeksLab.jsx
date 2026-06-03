import { useState, useMemo } from 'react'
import styles from './site.module.css'
import Reveal from './Reveal'
import { GREEKS, greekAsk } from '../data/greeks'
import { blackScholes, payoffAtExpiry } from '../lib/blackScholes'
import { useBot } from '../context/BotContext'

function Slider({ label, val, set, min, max, step, fmt }) {
  return (
    <div className={styles.control}>
      <div className={styles.controlTop}>
        <span className={styles.controlLabel}>{label}</span>
        <span className={`${styles.controlVal} num`}>{fmt ? fmt(val) : val}</span>
      </div>
      <input className={styles.slider} type="range" min={min} max={max} step={step}
        value={val} onChange={e => set(Number(e.target.value))} />
    </div>
  )
}

export default function GreeksLab() {
  const { askGreek } = useBot()
  const [type, setType] = useState('call')
  const [S, setS] = useState(100)
  const [K, setK] = useState(100)
  const [days, setDays] = useState(30)
  const [iv, setIv] = useState(25)
  const [rate, setRate] = useState(3)

  const T = days / 365
  const sigma = iv / 100
  const r = rate / 100

  const bs = useMemo(() => blackScholes({ S, K, T, r, sigma, type }), [S, K, T, r, sigma, type])

  // 만기 손익 차트 데이터
  const chart = useMemo(() => {
    const W = 460, H = 230, pad = 30
    const smin = Math.max(1, Math.min(S, K) * 0.55)
    const smax = Math.max(S, K) * 1.45
    const premium = bs.price
    const N = 80
    const pts = []
    let pmin = Infinity, pmax = -Infinity
    for (let i = 0; i <= N; i++) {
      const s = smin + (smax - smin) * (i / N)
      const pnl = payoffAtExpiry({ S: s, K, premium, type, side: 'long' })
      pts.push({ s, pnl })
      if (pnl < pmin) pmin = pnl
      if (pnl > pmax) pmax = pnl
    }
    const padY = (pmax - pmin) * 0.12 || 1
    pmin -= padY; pmax += padY
    const xOf = s => pad + ((s - smin) / (smax - smin)) * (W - 2 * pad)
    const yOf = p => H - pad - ((p - pmin) / (pmax - pmin)) * (H - 2 * pad)
    const line = pts.map(p => `${xOf(p.s).toFixed(1)},${yOf(p.pnl).toFixed(1)}`).join(' ')
    const breakeven = type === 'call' ? K + premium : K - premium
    return { W, H, pad, line, y0: yOf(0), xK: xOf(K), xBE: xOf(breakeven), breakeven, premium, smin, smax }
  }, [S, K, bs.price, type])

  const fmt2 = v => v.toFixed(2)

  return (
    <section id="greekslab" className={`${styles.section} ${styles.sectionAlt}`}>
      <div className={styles.container}>
        <Reveal className={styles.sectionHead}>
          <span className={styles.eyebrow}>Greeks Lab</span>
          <h2 className={styles.h2}>그릭(Greeks) 실험실</h2>
          <p className={styles.lead}>봇 이름 GREEK의 정체, 5대 그릭. 카드를 누르면 설명을 듣고, 아래 계산기로 직접 값을 움직여 보세요.</p>
        </Reveal>

        <div className={styles.greekCards}>
          {GREEKS.map((g, i) => (
            <Reveal key={g.key} delay={i * 60} className={`${styles.card} ${styles.cardHover} ${styles.greekCard}`}
              onClick={() => askGreek(greekAsk(g))} title="GREEK에게 설명 듣기">
              <div className={`${styles.greekSym} num`} style={{ color: g.color }}>{g.symbol}</div>
              <div className={styles.greekName}>{g.name}</div>
              <div className={styles.greekEn}>{g.en.toUpperCase()}</div>
              <div className={styles.greekOne}>{g.oneLine}</div>
              <div className={styles.greekPlain}>{g.plain}</div>
            </Reveal>
          ))}
        </div>

        <Reveal className={styles.labGrid}>
          {/* 컨트롤 */}
          <div className={styles.labPanel}>
            <div className={styles.labTitle}>🎛️ 옵션 계산기</div>
            <p className={styles.labHint}>블랙-숄즈 모형으로 가격과 그릭을 실시간 계산합니다 (교육용).</p>
            <div className={styles.segRow}>
              <button className={`${styles.seg} ${styles.segCall} ${type === 'call' ? styles.segOn : ''}`} onClick={() => setType('call')}>콜옵션 ▲</button>
              <button className={`${styles.seg} ${styles.segPut} ${type === 'put' ? styles.segOn : ''}`} onClick={() => setType('put')}>풋옵션 ▼</button>
            </div>
            <Slider label="기초자산 가격 (S)" val={S} set={setS} min={50} max={150} step={1} />
            <Slider label="행사가격 (K)" val={K} set={setK} min={50} max={150} step={1} />
            <Slider label="잔존 만기" val={days} set={setDays} min={1} max={365} step={1} fmt={v => `${v}일`} />
            <Slider label="내재변동성 (IV)" val={iv} set={setIv} min={5} max={80} step={1} fmt={v => `${v}%`} />
            <Slider label="무위험 금리 (r)" val={rate} set={setRate} min={0} max={10} step={0.1} fmt={v => `${v}%`} />
          </div>

          {/* 결과 */}
          <div className={styles.labPanel}>
            <div className={styles.priceOut}>
              <div className={styles.priceLabel}>이론 옵션 가격 (프리미엄)</div>
              <div className={`${styles.priceVal} num`}>{bs.price.toFixed(2)}</div>
            </div>
            <div className={styles.greekOut}>
              {[
                { s: 'Δ', n: '델타', v: bs.delta, c: GREEKS[0].color },
                { s: 'Γ', n: '감마', v: bs.gamma, c: GREEKS[1].color },
                { s: 'Θ', n: '세타', v: bs.theta, c: GREEKS[2].color },
                { s: 'ν', n: '베가', v: bs.vega, c: GREEKS[3].color },
                { s: 'ρ', n: '로', v: bs.rho, c: GREEKS[4].color },
              ].map(g => (
                <div key={g.n} className={styles.greekOutItem}>
                  <div className={`${styles.greekOutSym} num`} style={{ color: g.c }}>{g.s}</div>
                  <div className={`${styles.greekOutVal} num`}>{g.v.toFixed(g.s === 'Γ' ? 4 : 3)}</div>
                  <div className={styles.greekOutName}>{g.n}</div>
                </div>
              ))}
            </div>

            <div className={styles.payoffWrap}>
              <div className={styles.labTitle} style={{ fontSize: 14, marginTop: 18, marginBottom: 10 }}>📈 만기 손익 (옵션 매수)</div>
              <svg className={styles.payoffSvg} viewBox={`0 0 ${chart.W} ${chart.H}`} role="img" aria-label="만기 손익 그래프">
                {/* zero axis */}
                <line x1={chart.pad} y1={chart.y0} x2={chart.W - chart.pad} y2={chart.y0} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 4" />
                {/* strike */}
                <line x1={chart.xK} y1={chart.pad} x2={chart.xK} y2={chart.H - chart.pad} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                <text x={chart.xK} y={chart.H - 10} fontSize="10" fill="var(--muted)" textAnchor="middle" fontFamily="monospace">K={K}</text>
                {/* breakeven */}
                <line x1={chart.xBE} y1={chart.pad} x2={chart.xBE} y2={chart.H - chart.pad} stroke="var(--gold)" strokeWidth="1" strokeDasharray="2 3" />
                <text x={chart.xBE} y={chart.pad - 4} fontSize="10" fill="var(--gold-deep)" textAnchor="middle" fontFamily="monospace">BEP {chart.breakeven.toFixed(1)}</text>
                {/* payoff line */}
                <polyline points={chart.line} fill="none" stroke={type === 'call' ? 'var(--up)' : 'var(--down)'} strokeWidth="2.5" strokeLinejoin="round" />
              </svg>
              <div className={styles.payoffLegend}>
                <span><i className={styles.legendDot} style={{ background: type === 'call' ? 'var(--up)' : 'var(--down)' }} /> 손익</span>
                <span><i className={styles.legendDot} style={{ background: 'var(--gold)' }} /> 손익분기(BEP)</span>
                <span>최대손실 −{chart.premium.toFixed(2)}</span>
              </div>
              <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm} ${styles.btnBlock}`} style={{ marginTop: 16 }}
                onClick={() => askGreek(`${type === 'call' ? '콜' : '풋'}옵션을 기초자산 ${S}, 행사가 ${K}, 만기 ${days}일, 변동성 ${iv}%로 봤을 때 델타 ${bs.delta.toFixed(2)}, 세타 ${bs.theta.toFixed(2)}가 나왔어. 이 옵션의 특징과 주의할 점을 초보자에게 설명해줘.`)}>
                💬 이 옵션, GREEK에게 해석 부탁하기
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
