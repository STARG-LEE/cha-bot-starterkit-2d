import { useState } from 'react'
import styles from './site.module.css'
import Reveal from './Reveal'
import { QUIZ_TOPICS, QUIZZES, quizAsk, quizReviewAsk } from '../data/quizzes'
import { useBot } from '../context/BotContext'

const KEYS = ['A', 'B', 'C', 'D', 'E']

export default function Quiz() {
  const { askGreek } = useBot()
  const [topic, setTopic] = useState('basic')
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState([])     // [{...q, picked}]
  const [finished, setFinished] = useState(false)

  const questions = QUIZZES[topic]
  const q = questions[idx]
  const topicLabel = QUIZ_TOPICS.find(t => t.key === topic)?.label || ''

  const reset = (t = topic) => { setTopic(t); setIdx(0); setPicked(null); setCorrect(0); setWrong([]); setFinished(false) }

  const pick = (i) => {
    if (picked !== null) return
    setPicked(i)
    if (i === q.answer) setCorrect(c => c + 1)
    else setWrong(w => [...w, { ...q, picked: i }])
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
          <p className={styles.lead}>주제를 골라 개념을 점검하세요. 정답·해설이 바로 표시되고, 끝나면 틀린 문제를 모아 GREEK과 복습할 수 있어요.</p>
        </Reveal>

        <div className={styles.quizTabs}>
          {QUIZ_TOPICS.map(t => (
            <button key={t.key} className={`${styles.quizTab} ${topic === t.key ? styles.quizTabOn : ''}`} onClick={() => reset(t.key)}>
              <span className={styles.quizTabEmoji}>{t.emoji}</span> {t.label}
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
                    <b>{picked === q.answer ? '✅ 정답이에요!' : `❌ 아쉬워요. 정답은 ${KEYS[q.answer]}번이에요.`}</b> {q.explain}
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
            <div>
              <div style={{ textAlign: 'center' }}>
                <div className={`${styles.statNum} num`} style={{ fontSize: 46 }}>
                  {correct}<span style={{ color: 'var(--muted)', fontSize: 24 }}> / {questions.length}</span>
                </div>
                <p className={styles.resultSub} style={{ marginTop: 12, marginBottom: 8 }}>
                  {wrong.length === 0 ? '🎉 전부 맞혔어요! 다음 주제도 도전해 보세요.'
                    : correct >= questions.length * 0.6 ? `잘했어요! 틀린 ${wrong.length}문제만 GREEK과 복습하면 완벽해요.`
                    : `틀린 ${wrong.length}문제를 아래에서 확인하고 GREEK과 복습해 봐요.`}
                </p>
              </div>

              {wrong.length > 0 && (
                <>
                  <div className={styles.reviewHead}>
                    <span>📋 틀린 문제 {wrong.length}개</span>
                    <button className={`${styles.btn} ${styles.btnGold} ${styles.btnSm}`}
                      onClick={() => askGreek(quizReviewAsk(wrong, topicLabel))}>
                      💬 틀린 {wrong.length}문제 GREEK과 복습
                    </button>
                  </div>
                  <div className={styles.reviewList}>
                    {wrong.map((w, i) => (
                      <div key={i} className={styles.reviewItem}>
                        <div className={styles.reviewQ}>{i + 1}. {w.q}</div>
                        <div className={`${styles.reviewRow} ${styles.reviewBad}`}>✘ 내 답: {w.choices[w.picked]}</div>
                        <div className={`${styles.reviewRow} ${styles.reviewGood}`}>✔ 정답: {w.choices[w.answer]}</div>
                        <div className={styles.reviewExplain}>{w.explain}</div>
                        <button className={styles.askLink} style={{ marginTop: 8 }} onClick={() => askGreek(quizAsk(w))}>💬 이 문제 GREEK에게</button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className={styles.resultBtns} style={{ marginTop: 22 }}>
                <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => reset()}>다시 풀기</button>
                <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                  onClick={() => askGreek(`방금 "${topicLabel}" 퀴즈를 ${questions.length}문제 중 ${correct}개 맞췄어. 이 주제에서 더 다지면 좋을 핵심 개념 3가지를 짚어줘.`)}>
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
