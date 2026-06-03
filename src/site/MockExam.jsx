import { useState, useEffect, useRef } from 'react'
import styles from './site.module.css'
import Reveal from './Reveal'
import { EXAM_META, EXAM_QUESTIONS, examReviewAsk, examItemAsk } from '../data/mockExam'
import { useBot } from '../context/BotContext'

const KEYS = ['A', 'B', 'C', 'D', 'E']
const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export default function MockExam() {
  const { askGreek } = useBot()
  const [phase, setPhase] = useState('intro')   // intro | running | result
  const [answers, setAnswers] = useState({})
  const [cur, setCur] = useState(0)
  const [timeLeft, setTimeLeft] = useState(EXAM_META.durationSec)
  const timerRef = useRef(null)

  const total = EXAM_QUESTIONS.length

  const start = () => { setAnswers({}); setCur(0); setTimeLeft(EXAM_META.durationSec); setPhase('running') }
  const submit = () => { clearInterval(timerRef.current); setPhase('result') }

  useEffect(() => {
    if (phase !== 'running') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); setPhase('result'); return 0 } return t - 1 })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  const choose = (qid, i) => setAnswers(a => ({ ...a, [qid]: i }))

  // 채점
  const wrong = EXAM_QUESTIONS.filter(q => answers[q.id] !== q.answer)
  const correctCount = total - wrong.length
  const pct = Math.round((correctCount / total) * 100)
  const passed = pct >= EXAM_META.passScore

  const q = EXAM_QUESTIONS[cur]
  const answeredCount = Object.keys(answers).length

  // 결과 링
  const R = 80, C = 2 * Math.PI * R
  const ringColor = passed ? 'var(--up)' : 'var(--down)'

  return (
    <section id="exam" className={styles.section}>
      <div className={styles.container}>
        <Reveal className={styles.sectionHead}>
          <span className={styles.eyebrow}>Mock Exam</span>
          <h2 className={styles.h2}>{EXAM_META.title}</h2>
          <p className={styles.lead}>{EXAM_META.subtitle} · 실제 자격시험 전 개념을 최종 점검하세요.</p>
        </Reveal>

        {/* ── 인트로 ── */}
        {phase === 'intro' && (
          <Reveal className={`${styles.card} ${styles.examIntro}`}>
            <div className={styles.examMeta}>
              <div className={styles.examMetaItem}>
                <div className={`${styles.examMetaNum} num`}>{total}</div>
                <div className={styles.examMetaLabel}>문항 (객관식)</div>
              </div>
              <div className={styles.examMetaItem}>
                <div className={`${styles.examMetaNum} num`}>{Math.round(EXAM_META.durationSec / 60)}분</div>
                <div className={styles.examMetaLabel}>제한 시간</div>
              </div>
              <div className={styles.examMetaItem}>
                <div className={`${styles.examMetaNum} num`}>{EXAM_META.passScore}점</div>
                <div className={styles.examMetaLabel}>합격 기준</div>
              </div>
            </div>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={start}>📝 모의고사 시작하기</button>
            <p className={styles.examDisc}>※ {EXAM_META.disclaimer}</p>
          </Reveal>
        )}

        {/* ── 진행 ── */}
        {phase === 'running' && (
          <div className={styles.examRun}>
            <div className={styles.examHud}>
              <div className={styles.examProg}>
                <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${(answeredCount / total) * 100}%` }} /></div>
              </div>
              <div className={`${styles.timer} ${timeLeft < 60 ? styles.timerWarn : ''} num`}>⏱ {fmtTime(timeLeft)}</div>
            </div>

            <div className={`${styles.card} ${styles.quizCard}`}>
              <div className={styles.quizTop}>
                <span className={`${styles.quizCount} num`}>문제 {cur + 1} / {total}</span>
                <span className={styles.examArea}>{q.area}</span>
              </div>
              <div className={styles.qText}>{q.q}</div>
              <div className={styles.choices}>
                {q.choices.map((c, i) => (
                  <button key={i} className={`${styles.choice} ${answers[q.id] === i ? styles.choiceCorrect : ''}`}
                    onClick={() => choose(q.id, i)}>
                    <span className={`${styles.choiceKey} num`}>{KEYS[i]}</span>{c}
                  </button>
                ))}
              </div>
              <div className={styles.quizFoot}>
                <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} disabled={cur === 0} onClick={() => setCur(cur - 1)}>← 이전</button>
                {cur < total - 1
                  ? <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} onClick={() => setCur(cur + 1)}>다음 →</button>
                  : <button className={`${styles.btn} ${styles.btnGold} ${styles.btnSm}`} onClick={submit}>제출하기 ✓</button>}
              </div>
            </div>

            <div className={styles.examGridNav}>
              {EXAM_QUESTIONS.map((qq, i) => (
                <button key={qq.id}
                  className={`${styles.examDot} num ${answers[qq.id] !== undefined ? styles.examDotAnswered : ''} ${i === cur ? styles.examDotCurrent : ''}`}
                  onClick={() => setCur(i)}>{i + 1}</button>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <button className={`${styles.btn} ${styles.btnGold} ${styles.btnSm}`} onClick={submit}>지금 제출하고 채점 ({answeredCount}/{total} 응답)</button>
            </div>
          </div>
        )}

        {/* ── 결과 ── */}
        {phase === 'result' && (
          <Reveal className={`${styles.card} ${styles.resultCard}`}>
            <div className={styles.resultRing}>
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r={R} fill="none" stroke="var(--bg-2)" strokeWidth="14" />
                <circle cx="90" cy="90" r={R} fill="none" stroke={ringColor} strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform="rotate(-90 90 90)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }} />
              </svg>
              <div className={styles.resultRingNum}>
                <div className={`${styles.resultPct} num`}>{pct}<span style={{ fontSize: 20 }}>점</span></div>
                <div className={styles.resultPctLabel}>{correctCount} / {total} 정답</div>
              </div>
            </div>
            <div className={`${styles.resultVerdict} ${passed ? styles.resultPass : styles.resultFail}`}>
              {passed ? '🎉 합격 기준 통과!' : '📚 조금 더 준비해요'}
            </div>
            <p className={styles.resultSub}>
              {passed
                ? `합격 기준 ${EXAM_META.passScore}점을 넘었어요. 틀린 ${wrong.length}문제만 GREEK과 복습하면 완벽해요.`
                : `합격 기준 ${EXAM_META.passScore}점까지 ${EXAM_META.passScore - pct}점 남았어요. 틀린 문제를 GREEK과 복습해 봐요.`}
            </p>
            {wrong.length > 0 && (
              <>
                <div className={styles.reviewHead}>
                  <span>📋 틀린 문제 {wrong.length}개</span>
                  <button className={`${styles.btn} ${styles.btnGold} ${styles.btnSm}`} onClick={() => askGreek(examReviewAsk(wrong))}>
                    💬 틀린 {wrong.length}문제 GREEK과 복습
                  </button>
                </div>
                <div className={styles.reviewList}>
                  {wrong.map((w, i) => {
                    const my = answers[w.id]
                    return (
                      <div key={w.id} className={styles.reviewItem}>
                        <div className={styles.reviewQ}>{i + 1}. {w.q} <span className={styles.examArea} style={{ display: 'inline', marginLeft: 6 }}>{w.area}</span></div>
                        <div className={`${styles.reviewRow} ${styles.reviewBad}`}>✘ 내 답: {my !== undefined ? `${KEYS[my]}. ${w.choices[my]}` : '미응답'}</div>
                        <div className={`${styles.reviewRow} ${styles.reviewGood}`}>✔ 정답: {KEYS[w.answer]}. {w.choices[w.answer]}</div>
                        <div className={styles.reviewExplain}>{w.explain}</div>
                        <button className={styles.askLink} style={{ marginTop: 8 }} onClick={() => askGreek(examItemAsk(w))}>💬 이 문제 GREEK에게</button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
            <div className={styles.resultBtns} style={{ marginTop: 22 }}>
              <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={start}>다시 응시</button>
              <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                onClick={() => askGreek(`방금 옵션 모의고사에서 ${total}문제 중 ${correctCount}개를 맞춰 ${pct}점이 나왔어. 결과를 바탕으로 내가 보완하면 좋을 영역과 공부 방향을 짚어줘.`)}>
                💬 GREEK에게 총평 받기
              </button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
