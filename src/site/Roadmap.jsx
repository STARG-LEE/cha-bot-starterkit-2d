import { useState, useEffect, useCallback } from 'react'
import styles from './site.module.css'
import Reveal from './Reveal'
import { ROADMAP, TOTAL_LESSONS } from '../data/roadmap'
import { useBot } from '../context/BotContext'

const LS_KEY = 'everyoption_progress'

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}

export default function Roadmap() {
  const { askGreek } = useBot()
  const [done, setDone] = useState(loadProgress)

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(done)) }, [done])

  const toggle = useCallback((id) => {
    setDone(prev => { const next = { ...prev }; if (next[id]) delete next[id]; else next[id] = 1; return next })
  }, [])

  const doneCount = Object.keys(done).length
  const pct = Math.round((doneCount / TOTAL_LESSONS) * 100)

  return (
    <section id="roadmap" className={styles.section}>
      <div className={styles.container}>
        <Reveal className={styles.sectionHead}>
          <span className={styles.eyebrow}>Learning Roadmap</span>
          <h2 className={styles.h2}>옵션 학습 로드맵</h2>
          <p className={styles.lead}>기초부터 자격 취득까지 4단계. 레슨을 클릭하면 GREEK이 바로 설명하고, 체크하면 진도가 저장돼요.</p>
        </Reveal>

        <Reveal className={styles.rmProgress}>
          <div className={styles.rmProgressTop}>
            <span className={styles.rmProgressLabel}>내 진도 · {doneCount}/{TOTAL_LESSONS} 레슨 완료</span>
            <span className={`${styles.rmProgressPct} num`}>{pct}%</span>
          </div>
          <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${pct}%` }} /></div>
        </Reveal>

        <div className={styles.rmStages}>
          {ROADMAP.map((s, i) => (
            <Reveal key={s.stage} delay={i * 80} className={`${styles.card} ${styles.stageCard}`}>
              <div className={styles.stageHead}>
                <div className={`${styles.stageNum} num`}>{s.stage}</div>
                <span className={styles.stageBadge}>{s.badge}</span>
              </div>
              <h3 className={styles.stageTitle}>{s.title}</h3>
              <p className={styles.stageGoal}>{s.goal}</p>
              <ul className={styles.lessonList}>
                {s.lessons.map(l => {
                  const isDone = !!done[l.id]
                  return (
                    <li key={l.id} className={styles.lesson}>
                      <button
                        className={`${styles.lessonCheck} ${isDone ? styles.lessonCheckOn : ''}`}
                        onClick={() => toggle(l.id)}
                        aria-label={isDone ? '완료 취소' : '완료 표시'}
                      >✓</button>
                      <span className={`${styles.lessonText} ${isDone ? styles.lessonDone : ''}`}
                        onClick={() => askGreek(l.ask)} title="GREEK에게 배우기">
                        {l.title}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
