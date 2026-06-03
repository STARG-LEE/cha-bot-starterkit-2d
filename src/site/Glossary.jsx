import { useState, useMemo } from 'react'
import styles from './site.module.css'
import Reveal from './Reveal'
import { GLOSSARY, CATEGORIES, glossaryAsk } from '../data/glossary'
import { useBot } from '../context/BotContext'

const catColor = Object.fromEntries(CATEGORIES.map(c => [c.key, c.color]))

export default function Glossary() {
  const { askGreek } = useBot()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('전체')
  const [open, setOpen] = useState(null)

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return GLOSSARY.filter(t => {
      if (cat !== '전체' && t.category !== cat) return false
      if (!kw) return true
      return (t.term + t.en + t.summary).toLowerCase().includes(kw)
    })
  }, [q, cat])

  return (
    <section id="glossary" className={`${styles.section} ${styles.sectionAlt}`}>
      <div className={styles.container}>
        <Reveal className={styles.sectionHead}>
          <span className={styles.eyebrow}>Glossary</span>
          <h2 className={styles.h2}>옵션 용어집</h2>
          <p className={styles.lead}>전문 용어를 일상 언어로. 카드를 누르면 자세한 설명이 펼쳐지고, “GREEK에게”를 누르면 봇이 비유로 풀어줘요.</p>
        </Reveal>

        <Reveal className={styles.glossTools}>
          <div className={styles.search}>
            <span aria-hidden="true">🔍</span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="용어 검색 (예: 델타, 콜옵션, 변동성)" />
          </div>
          <div className={styles.filterChips}>
            <button className={`${styles.filterChip} ${cat === '전체' ? styles.filterChipOn : ''}`} onClick={() => setCat('전체')}>전체</button>
            {CATEGORIES.map(c => (
              <button key={c.key} className={`${styles.filterChip} ${cat === c.key ? styles.filterChipOn : ''}`} onClick={() => setCat(c.key)}>
                {c.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className={styles.glossGrid}>
          {list.map((t, i) => {
            const isOpen = open === t.id
            const color = catColor[t.category] || '#1d4ed8'
            return (
              <Reveal key={t.id} delay={(i % 6) * 50} className={`${styles.card} ${styles.cardHover} ${styles.termCard}`}
                onClick={() => setOpen(isOpen ? null : t.id)}>
                <div className={styles.termHead}>
                  <div className={`${styles.termSym} num`} style={{ background: color }}>{t.symbol || t.term[0]}</div>
                  <div>
                    <div className={styles.termName}>{t.term}</div>
                    <div className={styles.termEn}>{t.en}</div>
                  </div>
                  <span className={styles.termCat} style={{ color, background: `${color}1a` }}>{t.category}</span>
                </div>
                <div className={styles.termSummary}>{t.summary}</div>
                <div className={`${styles.termDetail} ${isOpen ? styles.termDetailOpen : ''}`}>{t.detail}</div>
                <div className={styles.termFoot}>
                  <button className={styles.askLink} onClick={(e) => { e.stopPropagation(); askGreek(glossaryAsk(t)) }}>
                    💬 GREEK에게
                  </button>
                  <span className={styles.termMore}>{isOpen ? '접기 ▲' : '자세히 ▼'}</span>
                </div>
              </Reveal>
            )
          })}
        </div>
        {list.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 30 }}>
            “{q}”에 대한 용어가 없어요. <button className={styles.askLink} onClick={() => askGreek(`옵션 용어 "${q}"가 무슨 뜻인지 쉽게 설명해줘.`)}>GREEK에게 직접 물어보기</button>
          </p>
        )}
      </div>
    </section>
  )
}
