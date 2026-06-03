import styles from './site.module.css'
import Reveal from './Reveal'
import { CERT_INFO, CERT_ASK } from '../data/certs'
import { useBot } from '../context/BotContext'

export default function CertNotice() {
  const { askGreek } = useBot()
  return (
    <section id="cert" className={`${styles.section} ${styles.sectionNavy}`}>
      <div className={styles.container}>
        <Reveal className={styles.sectionHead}>
          <span className={styles.eyebrow}>Trading Eligibility</span>
          <h2 className={styles.h2}>옵션, 바로 못 삽니다 — 먼저 “수료증”</h2>
          <p className={styles.lead} style={{ color: 'rgba(255,255,255,.82)' }}>
            국내·해외 모두 선물·옵션을 거래하려면 <b style={{ color: 'var(--gold-soft)' }}>사전교육 수료 + 모의거래</b> 이수가 의무예요.
            아래 공식 절차를 확인하고, 에브리옵션으로 그 준비를 시작하세요.
          </p>
        </Reveal>

        <div className={`${styles.grid} ${styles.grid2}`}>
          {CERT_INFO.map((c, i) => (
            <Reveal key={c.key} delay={i * 100} className={styles.certCard}>
              <div className={styles.certHead}>
                <span className={styles.certFlag} aria-hidden="true">{c.flag}</span>
                <div>
                  <h3 className={styles.certTitle}>{c.title}</h3>
                  <div className={styles.certBasis}>{c.basis}</div>
                </div>
              </div>
              <ul className={styles.certList}>
                {c.items.map((t, j) => <li key={j}>{t}</li>)}
              </ul>
              <div className={styles.certIssuer}>발급·교육: <b>{c.issuer}</b></div>
              <div className={styles.certLinks}>
                {c.links.map((l, j) => (
                  <a key={j} className={styles.certLink} href={l.url} target="_blank" rel="noopener noreferrer">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className={styles.certFoot}>
          <p className={styles.certDisc}>
            ※ 세부 요건(교육 시간·기본예탁금 등)은 투자자 유형·증권사·당국 정책에 따라 달라질 수 있어요.
            거래 전 반드시 공식 사이트와 거래 증권사에서 최신 내용을 확인하세요.
          </p>
          <button className={`${styles.btn} ${styles.btnGold}`} onClick={() => askGreek(CERT_ASK)}>
            💬 내 상황에 맞는 자격 절차, GREEK에게 묻기
          </button>
        </Reveal>
      </div>
    </section>
  )
}
