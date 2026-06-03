import styles from './site.module.css'
import { useBot } from '../context/BotContext'

const FLOATERS = [
  { ch: 'Δ', top: '8%',  left: '6%',  size: 38, delay: '0s' },
  { ch: 'Γ', top: '20%', right: '8%', size: 30, delay: '.6s' },
  { ch: 'Θ', top: '64%', left: '4%',  size: 34, delay: '1.2s' },
  { ch: 'ν', top: '78%', right: '12%', size: 28, delay: '1.8s' },
  { ch: 'ρ', top: '42%', right: '3%',  size: 26, delay: '2.4s' },
]

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Hero() {
  const { askGreek, openDock } = useBot()
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroText}>
          <span className={styles.heroEyebrow}>FINANCIAL · DERIVATIVES · 2026</span>
          <h1 className={styles.heroTitle}>
            옵션의 진입장벽,<br />AI 길잡이 <em>GREEK</em>이<br />허물어 드립니다
          </h1>
          <p className={styles.heroSub}>
            복잡한 옵션 개념과 그릭(Δ Γ Θ ν ρ)을 일상 언어로. 이해도 퀴즈와
            자격시험 모의고사까지 — 옵션이 처음이어도 체계적으로 거래 준비를 마칠 수 있어요.
          </p>
          <div className={styles.heroCtas}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => askGreek('옵션 거래가 처음인데, 무엇부터 배워야 할지 학습 순서를 알려줘.')}>
              💬 GREEK에게 물어보기
            </button>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => scrollToId('roadmap')}>
              학습 로드맵 보기 ↓
            </button>
          </div>
          <div className={styles.statRow}>
            <div className={styles.stat}>
              <div className={`${styles.statNum} num`}><b>5</b>대</div>
              <div className={styles.statLabel}>그릭 완전 정복<br/>Δ Γ Θ ν ρ</div>
            </div>
            <div className={styles.stat}>
              <div className={`${styles.statNum} num`}>30<b>+</b></div>
              <div className={styles.statLabel}>핵심 옵션 용어<br/>쉬운 설명·검색</div>
            </div>
            <div className={styles.stat}>
              <div className={`${styles.statNum} num`}>15<b>문항</b></div>
              <div className={styles.statLabel}>자격 대비<br/>모의고사</div>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.heroStage}>
            {FLOATERS.map((f, i) => (
              <span key={i} className={`${styles.floatGreek} num`}
                style={{ top: f.top, left: f.left, right: f.right, fontSize: f.size, animationDelay: f.delay }}>
                {f.ch}
              </span>
            ))}
            <img className={styles.heroAvatar} src="/avatar2d/idle.png" alt="옵션 길잡이 GREEK 마스코트" draggable={false} />
            <div className={styles.tickerCard} style={{ top: '13%', left: '5%' }}>
              <div className={styles.tickerLabel}>콜 델타 Δ</div>
              <div className={`${styles.tickerVal} num`}>+0.52 ▲</div>
            </div>
            <div className={styles.tickerCard} style={{ bottom: '11%', right: '5%' }}>
              <div className={styles.tickerLabel}>세타 Θ / day</div>
              <div className={`${styles.tickerVal} ${styles.down} num`}>−1.84 ▼</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
