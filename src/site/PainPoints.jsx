import styles from './site.module.css'
import Reveal from './Reveal'

const PAINS = [
  {
    num: 'ISSUE 01',
    title: '옵션 개념의 높은 진입장벽',
    list: ['복잡한 옵션 개념 이해 필요', '델타·감마·베가 등 그릭 지표 학습', '다양한 전략 구조 파악 요구'],
    solve: <>전문 용어를 <b>일상 언어로 변환</b>한 용어집과 GREEK의 1:1 설명으로 해결</>,
  },
  {
    num: 'ISSUE 02',
    title: '필수 교육·시험 요구사항',
    list: ['파생상품 사전교육 이수 의무', '모의거래 실습 완료 필수', '자격 시험 통과 요구', '기본예탁금 요건 충족'],
    solve: <><b>단계별 로드맵</b>과 자격 대비 <b>모의고사</b>로 합격까지 안내</>,
  },
  {
    num: 'TREND 03',
    title: '레버리지 거래의 옵션 전환 수요',
    list: ['레버리지 ETF 거래량 급증', '인버스 상품 거래 1위 기록', '옵션 시장으로의 전환 필요성 대두'],
    solve: <>레버리지 투자자가 <b>안전하게 옵션으로 넘어오도록</b> 체계적 학습 제공</>,
  },
]

export default function PainPoints() {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className={styles.container}>
        <Reveal className={styles.sectionHead}>
          <span className={styles.eyebrow}>Why EveryOption</span>
          <h2 className={styles.h2}>옵션 입문이 어려운 진짜 이유</h2>
          <p className={styles.lead}>
            옵션은 기회의 시장이지만 진입장벽이 높습니다. 에브리옵션은 이 세 가지 장벽을 하나씩 무너뜨립니다.
          </p>
        </Reveal>
        <div className={`${styles.grid} ${styles.grid3}`}>
          {PAINS.map((p, i) => (
            <Reveal key={i} delay={i * 90} className={`${styles.card} ${styles.painCard}`}>
              <div className={`${styles.painNum} num`}>{p.num}</div>
              <h3 className={styles.painTitle}>{p.title}</h3>
              <ul className={styles.painList}>
                {p.list.map((t, j) => <li key={j}>{t}</li>)}
              </ul>
              <div className={styles.painSolve}><span>✓</span><span>{p.solve}</span></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
