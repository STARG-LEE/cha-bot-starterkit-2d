import { useState, useRef, useEffect } from 'react'
import styles from './BotDock.module.css'
import Image2DAvatar from './Image2DAvatar'
import { useBot } from '../context/BotContext'

const STATUS_LABEL = { idle: '대기 중', connected: '연결됨', speaking: '말하는 중' }

function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  const empty = !isUser && msg.text === ''
  return (
    <div className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAi}`}>
      {!isUser && <div className={styles.aiTag}>Δ</div>}
      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAi}`}>
        {empty ? <span className={styles.typing}><i/><i/><i/></span> : msg.text}
      </div>
    </div>
  )
}

export default function BotDock() {
  const {
    dockOpen, toggleDock, closeDock,
    messages, isProcessing, status, unread,
    sendMessage, voiceOn, setVoiceOn, isListening, toggleMic,
    avatarRef, suggestions, resetChat,
  } = useBot()

  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const taRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const submit = () => {
    const t = input.trim()
    if (!t || isProcessing) return
    setInput('')
    if (taRef.current) taRef.current.style.height = 'auto'
    sendMessage(t)
  }
  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }
  const onInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px'
  }

  const showSuggestions = messages.length <= 1 && !isProcessing

  return (
    <>
      {/* ── FAB (닫혀 있을 때) ── */}
      <button
        className={`${styles.fab} ${dockOpen ? styles.fabHidden : ''}`}
        onClick={toggleDock}
        aria-label="GREEK 옵션 도우미 열기"
      >
        <span className={styles.fabAvatar}>
          <img src="/avatar2d/idle.png" alt="" draggable={false} />
        </span>
        <span className={styles.fabText}>
          <b>GREEK</b>에게 물어보기
        </span>
        {unread > 0 && <span className={styles.fabBadge}>{unread}</span>}
        <span className={styles.fabPulse} aria-hidden="true" />
      </button>

      {/* ── 모바일 백드롭 ── */}
      <div className={`${styles.backdrop} ${dockOpen ? styles.backdropOn : ''}`} onClick={closeDock} />

      {/* ── 도크 패널 ── */}
      <aside className={`${styles.dock} ${dockOpen ? styles.dockOpen : ''}`} aria-hidden={!dockOpen}>
        {/* 헤더 */}
        <header className={styles.header}>
          <div className={styles.headId}>
            <span className={styles.greekMark}>Δ</span>
            <div>
              <div className={styles.headName}>GREEK <span className={styles.headGr}>Δ Γ Θ ν ρ</span></div>
              <div className={styles.headStatus}>
                <i className={`${styles.dot} ${status === 'speaking' ? styles.dotBlue : styles.dotGreen}`} />
                옵션 길잡이 · {STATUS_LABEL[status] || '대기 중'}
              </div>
            </div>
          </div>
          <div className={styles.headBtns}>
            <button className={styles.iconBtn} onClick={() => setVoiceOn(v => !v)} title={voiceOn ? '음성 끄기' : '음성으로 듣기'}>
              {voiceOn ? '🔊' : '🔇'}
            </button>
            <button className={styles.iconBtn} onClick={resetChat} title="대화 초기화">↻</button>
            <button className={styles.iconBtn} onClick={closeDock} title="닫기" aria-label="도크 닫기">✕</button>
          </div>
        </header>

        {/* 아바타 밴드 */}
        <div className={styles.avatarBand}>
          <div className={styles.bandGlow} aria-hidden="true" />
          <Image2DAvatar ref={avatarRef} className={styles.avatar} />
          <div className={styles.bandCaption}>
            옵션 거래의 진입장벽을 허무는 AI 길잡이
          </div>
        </div>

        {/* 메시지 */}
        <div className={styles.messages}>
          {messages.map((m, i) => <Bubble key={i} msg={m} />)}
          {showSuggestions && (
            <div className={styles.suggestions}>
              {suggestions.map((s, i) => (
                <button key={i} className={styles.suggestChip} onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* 입력 */}
        <div className={styles.inputRow}>
          <button
            className={`${styles.micBtn} ${isListening ? styles.micOn : ''}`}
            onClick={toggleMic}
            title={isListening ? '듣기 중지' : '음성으로 질문'}
          >{isListening ? '■' : '🎙'}</button>
          <textarea
            ref={taRef}
            className={styles.textarea}
            value={input}
            onChange={onInput}
            onKeyDown={onKey}
            placeholder={isListening ? '듣고 있어요…' : '옵션·그릭, 무엇이든 물어보세요…'}
            rows={1}
            disabled={isProcessing}
          />
          <button className={styles.sendBtn} onClick={submit} disabled={isProcessing || !input.trim()}>
            {isProcessing ? <span className={styles.spinner} /> : '↑'}
          </button>
        </div>
        <div className={styles.hint}>Enter 전송 · Shift+Enter 줄바꿈 · 답변은 학습용이며 투자 권유가 아니에요</div>
      </aside>
    </>
  )
}
