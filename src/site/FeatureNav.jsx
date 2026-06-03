import styles from './site.module.css'
import Reveal from './Reveal'

const FEATS = [
  { icon: '🗺️', name: '학습 로드맵', desc: '관심 → 그릭 → 전략 → 자격까지 4단계 커리큘럼과 진도 관리', id: 'roadmap' },
  { icon: '📖', name: '옵션 용어집', desc: '30+ 핵심 용어를 카테고리·검색으로. 클릭하면 GREEK이 풀어 설명', id: 'glossary' },
  { icon: '✅', name: '이해도 퀴즈', desc: '주제별 객관식으로 개념 점검. 틀리면 GREEK이 바로 해설', id: 'quiz' },
  { icon: 'Δ', name: '그릭 Lab', desc: '블랙숄즈 기반 그릭 계산기 + 만기 손익(페이오프) 시각화', id: 'greekslab' },
  { icon: '📝', name: '모의고사', desc: '자격시험 대비 15문항 타이머 모의고사 + 합격 판정·복습', id: 'exam' },
  { icon: '🤖', name: 'AI 길잡이 GREEK', desc: '언제든 우측 하단에서 호출. 모든 기능이 봇과 연결돼요', action: 'bot' },
]

function scrollToId(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

export default function FeatureNav({ onOpenBot }) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <Reveal className={styles.sectionHead}>
          <span className={styles.eyebrow}>How it works</span>
          <h2 className={styles.h2}>이렇게 배웁니다</h2>
          <p className={styles.lead}>읽고 · 확인하고 · 계산하고 · 시험까지. 모든 학습 도구가 AI 길잡이 GREEK과 연결됩니다.</p>
        </Reveal>
        <div className={styles.featGrid}>
          {FEATS.map((f, i) => (
            <Reveal key={i} delay={i * 70} className={`${styles.card} ${styles.cardHover} ${styles.featCard}`}
              onClick={() => f.action === 'bot' ? onOpenBot?.() : scrollToId(f.id)}>
              <div className={`${styles.featIcon} num`}>{f.icon}</div>
              <div>
                <div className={styles.featName}>{f.name}</div>
                <div className={styles.featDesc}>{f.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
