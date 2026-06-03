import styles from './site.module.css'
import { useBot } from '../context/BotContext'

const scrollToId = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function Footer() {
  const { openDock } = useBot()
  return (
    <footer className={styles.footer}>
      <div className={styles.footInner}>
        <div className={styles.footTop}>
          <div className={styles.footBrand}>
            <div className={styles.footBrandRow}>
              <div className={`${styles.footMark} num`}>Δ</div>
              <div>
                <div className={styles.footName}>에브리옵션</div>
                <div className={`${styles.brandSub} num`} style={{ color: 'var(--gold-soft)' }}>WITH GREEK</div>
              </div>
            </div>
            <p className={styles.footTag}>
              옵션 거래의 진입장벽을 허무는 AI 챗봇 서비스. 누구나 쉽게, 체계적으로 옵션 시장에 진입할 수 있도록 돕습니다.
            </p>
          </div>

          <div className={styles.footCols}>
            <div className={styles.footCol}>
              <h4>학습</h4>
              <button onClick={() => scrollToId('roadmap')}>학습 로드맵</button>
              <button onClick={() => scrollToId('glossary')}>옵션 용어집</button>
              <button onClick={() => scrollToId('quiz')}>이해도 퀴즈</button>
            </div>
            <div className={styles.footCol}>
              <h4>도구</h4>
              <button onClick={() => scrollToId('greekslab')}>그릭 Lab</button>
              <button onClick={() => scrollToId('exam')}>모의고사</button>
              <button onClick={openDock}>AI 길잡이 GREEK</button>
            </div>
          </div>
        </div>

        <div className={styles.footBot}>
          <div className={styles.presenters}>
            PRESENTED BY <b>김영민 · 김윤호 · 이서희 · 홍성혁</b>
          </div>
          <div className={`${styles.brandSub} num`} style={{ color: 'rgba(255,255,255,.4)' }}>
            Δ Γ Θ ν ρ · EVERYOPTION 2026
          </div>
        </div>
        <p className={styles.disclaimer}>
          ※ 본 서비스는 옵션·파생상품 학습을 위한 교육용 데모입니다. 제공되는 모든 정보·계산·모의고사는 학습 목적이며,
          특정 종목·상품의 투자 권유나 매매 신호가 아닙니다. 실제 투자 판단과 그 결과의 책임은 투자자 본인에게 있습니다.
        </p>
      </div>
    </footer>
  )
}
