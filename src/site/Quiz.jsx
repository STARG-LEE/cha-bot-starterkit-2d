import { useState } from 'react'
import styles from './site.module.css'
import Reveal from './Reveal'
import { QUIZ_TOPICS, QUIZZES, quizAsk } from '../data/quizzes'
import { useBot } from '../context/BotContext'

const KEYS = ['A', 'B', 'C', 'D', 'E']

export default function Quiz() {
  const { askGreek } = useBot()
  const [topic, setTopic] = useState('basic')
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState(false)

  const questions = QUIZZES[topic]
  const q = questions[idx]

  const reset = (t = topic) => { setTopic(t); setIdx(0); setPicked(null); setCorrect(0); setFinished(false) }

  const pick = (i) => {
    if (picked !== null) return
    setPicked(i)
    if (i === q.answer) setCorrect(c => c + 1)
  }
  const next = () => {
    if (idx < questions.length - 1) { setIdx(idx + 1); setPicked(null) }
    else setFinished(true)
  }

  return (
    <section id="quiz" className={styles.section}>
      <div className={styles.container}>
        <Reveal className={styles.sectionHead}>
          <span className={styles.eyebrow}>Comprehension Quiz</span>
          <h2 className={styles.h2}>이해도 확인 퀴즈</h2>
          <p className={styles.lead}>주제를 골라 개념을 점검하세요. 정답·해설이 바로 표시되고, 더 궁금하면 GREEK이 풀어 설명합니다.</p>
        </Reveal>

        <div className={styles.quizTabs}>
          {QUIZ_TOPICS.map(t => (
            <button key={t.key} className={`${styles.quizTab} ${topic === t.key ? styles.quizTabOn : ''}`} onClick={() => reset(t.key)}>
              <span className={`${styles.quizTabEmoji}`}>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        <Reveal className={`${styles.card} ${styles.quizCard}`}>
          {!finished ? (
            <>
              <div className={styles.quizTop}>
                <span className={`${styles.quizCount} num`}>문제 {idx + 1} / {questions.length}</span>
                <span className={`${styles.scorePill} num`}>맞춘 개수 {correct}</span>
              </div>
              <div className={styles.qText}>{q.q}</div>
              <div className={styles.choices}>
                {q.choices.map((c, i) => {
                  let cls = styles.choice
                  if (picked !== null) {
                    if (i === q.answer) cls += ' ' + styles.choiceCorrect
                    else if (i === picked) cls += ' ' + styles.choiceWrong
                  }
                  return (
                    <button key={i} className={cls} onClick={() => pick(i)} disabled={picked !== null}>
                      <span className={`${styles.choiceKey} num`}>{KEYS[i]}</span>{c}
                    </button>
                  )
                })}
              </div>
              {picked !== null && (
                <>
                  <div className={styles.explain}>
                    <b>{picked === q.answer ? '✅ 정답이에요!' : '❌ 아쉬워요.'}</b> {q.explain}
                  </div>
                  <div className={styles.quizFoot}>
                    <button className={styles.askLink} onClick={() => askGreek(quizAsk(q))}>💬 GREEK에게 더 물어보기</button>
                    <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} onClick={next}>
                      {idx < questions.length - 1 ? '다음 문제 →' : '결과 보기 →'}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div className={`${styles.statNum} num`} style={{ fontSize: 46 }}>
                {correct}<span style={{ color: 'var(--muted)', fontSize: 24 }}> / {questions.length}</span>
              </div>
              <p className={styles.resultSub} style={{ marginTop: 14 }}>
                {correct === questions.length ? '완벽해요! 다음 주제도 도전해 보세요.'
                  : correct >= questions.length * 0.6 ? '잘하고 있어요. 틀린 개념만 GREEK과 복습해요.'
                  : '개념을 조금 더 다져볼까요? GREEK이 도와줄게요.'}
              </p>
              <div className={styles.resultBtns}>
                <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => reset()}>다시 풀기</button>
                <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                  onClick={() => askGreek(`방금 "${QUIZ_TOPICS.find(t => t.key === topic).label}" 퀴즈를 ${questions.length}문제 중 ${correct}개 맞췄어. 이 주제에서 내가 약한 부분을 점검할 수 있게 핵심 개념 3가지를 짚어줘.`)}>
                  💬 GREEK에게 총평 받기
                </button>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  )
}
