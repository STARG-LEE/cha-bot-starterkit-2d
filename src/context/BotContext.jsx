import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'
import { newSessionId, saveChat } from '../lib/api'
import { MicRecorder, isMicRecorderSupported } from '../lib/stt'

// ─────────────────────────────────────────────────────────────
// GREEK 봇 컨텍스트 — 채팅 스트리밍 + (선택) 음성 + 도크 열림 상태.
// 기능 컴포넌트(용어집·퀴즈·모의고사·로드맵)는 useBot().askGreek(prompt)로
// 도크를 열고 GREEK에게 질문을 주입한다.  ← "기능과 봇 연계"의 핵심
// ─────────────────────────────────────────────────────────────

const GREETING = '안녕하세요! 저는 옵션 길잡이 GREEK이에요. Δ Γ Θ ν ρ 그릭부터 자격시험까지, 옵션이 막막할 때 뭐든 물어보세요. 무엇이 궁금하세요?'

const SUGGESTIONS = ['콜옵션이 뭐야?', '델타를 쉽게 설명해줘', '옵션 거래 자격은 어떻게 따?', '커버드콜 전략이 궁금해']

const BotContext = createContext(null)
export const useBot = () => {
  const ctx = useContext(BotContext)
  if (!ctx) throw new Error('useBot must be used within <BotProvider>')
  return ctx
}

function normalizeTtsText(text) {
  if (!text) return ''
  return String(text)
    .replace(/😊|😀|😃|😄|😁|🙂|😉|👍|🙏|✨|💡|📌|🎓|📈|📉|📋|📘|🔥|🎯|⚡/g, '')
    .replace(/\bAI\b/gi, '에이아이').replace(/\bGPT\b/gi, '지피티')
    .replace(/\bITM\b/g, '내가격').replace(/\bOTM\b/g, '외가격').replace(/\bATM\b/g, '등가격')
    .replace(/\s+/g, ' ').trim()
}
function sanitizeForTTS(s) {
  if (!s) return ''
  return s.replace(/https?:\/\/[^\s)\]]+/gi, '').replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '')
    .replace(/[#*_`>~]/g, '').replace(/\s{2,}/g, ' ').trim()
}

export function BotProvider({ children }) {
  const [dockOpen, setDockOpen]       = useState(false)
  const [messages, setMessages]       = useState([{ role: 'assistant', text: GREETING }])
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus]           = useState('idle')   // idle | connected | speaking
  const [voiceOn, setVoiceOn]         = useState(false)     // TTS 음성 출력 (기본 끔)
  const [isListening, setIsListening] = useState(false)
  const [unread, setUnread]           = useState(0)

  const avatarRef       = useRef(null)
  const sessionIdRef    = useRef(newSessionId())
  const historyRef      = useRef([])
  const isProcessingRef = useRef(false)
  const isSpeakingRef   = useRef(false)
  const voiceOnRef      = useRef(false)
  useEffect(() => { voiceOnRef.current = voiceOn }, [voiceOn])

  // ─── TTS 큐 ───
  const ttsQueueRef   = useRef([])
  const ttsRunningRef = useRef(false)
  const ttsAbortRef   = useRef(false)

  const processTTSQueue = useCallback(async () => {
    if (ttsRunningRef.current) return
    ttsRunningRef.current = true
    const avatar = avatarRef.current
    try {
      while (ttsQueueRef.current.length > 0 && !ttsAbortRef.current) {
        const bufPromise = ttsQueueRef.current.shift()
        if (!bufPromise) continue
        let buf
        try { buf = await bufPromise } catch { continue }
        if (ttsAbortRef.current) break
        if (!isSpeakingRef.current) { isSpeakingRef.current = true; setStatus('speaking') }
        if (avatar?.speak) { try { await avatar.speak(buf) } catch {} }
      }
    } finally {
      ttsRunningRef.current = false
      ttsAbortRef.current = false
      if (isSpeakingRef.current && ttsQueueRef.current.length === 0) {
        isSpeakingRef.current = false
        setStatus(s => (s === 'speaking' ? 'connected' : s))
      }
    }
  }, [])

  const enqueueTTS = useCallback((sentence) => {
    if (!voiceOnRef.current) return
    const clean = sanitizeForTTS(normalizeTtsText(sentence))
    if (!clean) return
    const bufPromise = fetch('/api/tts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean }),
    }).then(r => { if (!r.ok) throw new Error('tts ' + r.status); return r.arrayBuffer() })
    ttsQueueRef.current.push(bufPromise)
    processTTSQueue()
  }, [processTTSQueue])

  const clearTTSQueue = useCallback(() => {
    ttsAbortRef.current = true
    ttsQueueRef.current = []
    try { avatarRef.current?.stopSpeaking?.() } catch {}
    isSpeakingRef.current = false
    setStatus(s => (s === 'speaking' ? 'connected' : s))
  }, [])

  // ─── 메시지 전송 (스트리밍 SSE) ───
  const sendMessage = useCallback(async (userText) => {
    const text = (userText || '').trim()
    if (!text || isProcessingRef.current) return
    isProcessingRef.current = true
    setIsProcessing(true)
    setStatus('connected')

    setMessages(prev => [...prev, { role: 'user', text }])
    historyRef.current = [...historyRef.current, { role: 'user', content: text }]
    saveChat(sessionIdRef.current, 'user', text)
    setMessages(prev => [...prev, { role: 'assistant', text: '' }])

    let accumulated = ''
    let pending = ''
    let isFirstFlush = true
    const flushPendingIfSentence = () => {
      const minLen = isFirstFlush ? 6 : 12
      let m = pending.match(/^([\s\S]*?[.!?…。\n])(.*)$/)
      if (m && m[1].trim().length >= minLen) { enqueueTTS(m[1]); pending = m[2]; isFirstFlush = false; return true }
      if (isFirstFlush) {
        m = pending.match(/^([\s\S]*?[,，、])(.*)$/)
        if (m && m[1].trim().length >= 6) { enqueueTTS(m[1]); pending = m[2]; isFirstFlush = false; return true }
      }
      return false
    }

    try {
      const res = await fetch('/api/chat-stream', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historyRef.current.slice(-8), images: [] }),
      })
      if (!res.ok || !res.body) throw new Error('chat-stream ' + res.status)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        let nlIdx
        while ((nlIdx = buf.indexOf('\n\n')) !== -1) {
          const event = buf.slice(0, nlIdx).trim()
          buf = buf.slice(nlIdx + 2)
          if (!event.startsWith('data: ')) continue
          const payload = event.slice(6).trim()
          if (payload === '[DONE]') { buf = ''; break }
          let obj
          try { obj = JSON.parse(payload) } catch { continue }
          if (obj.token) {
            accumulated += obj.token
            pending += obj.token
            setMessages(prev => {
              const next = [...prev]
              const last = next[next.length - 1]
              if (last && last.role === 'assistant') next[next.length - 1] = { ...last, text: accumulated }
              return next
            })
            while (flushPendingIfSentence()) {}
          }
          if (obj.done && pending.trim()) { enqueueTTS(pending); pending = '' }
        }
      }
      if (pending.trim()) { enqueueTTS(pending); pending = '' }

      const finalReply = accumulated || '죄송해요, 답변을 생성하지 못했어요. 잠시 후 다시 시도해 주세요.'
      if (!accumulated) {
        setMessages(prev => {
          const next = [...prev]; const last = next[next.length - 1]
          if (last && last.role === 'assistant' && !last.text) next[next.length - 1] = { role: 'assistant', text: finalReply }
          return next
        })
      }
      historyRef.current = [...historyRef.current, { role: 'assistant', content: finalReply }]
      saveChat(sessionIdRef.current, 'assistant', finalReply)
    } catch (e) {
      setMessages(prev => {
        const next = [...prev]; const last = next[next.length - 1]
        if (last && last.role === 'assistant' && !last.text)
          next[next.length - 1] = { role: 'assistant', text: '⚠️ 봇 서버에 연결하지 못했어요. 배포 환경(Vercel)에서 TEAM_ID/RAG 설정이 필요할 수 있어요.' }
        return next
      })
    } finally {
      isProcessingRef.current = false
      setIsProcessing(false)
    }
  }, [enqueueTTS])

  // ─── 도크 제어 ───
  const openDock  = useCallback(() => { setDockOpen(true); setUnread(0) }, [])
  const closeDock = useCallback(() => setDockOpen(false), [])
  const toggleDock = useCallback(() => setDockOpen(o => { if (!o) setUnread(0); return !o }), [])

  // ─── 기능 → 봇 연계: 도크 열고 질문 주입 ───
  const askGreek = useCallback((prompt) => {
    setDockOpen(true)
    setUnread(0)
    // 다음 틱에 전송 (도크 애니메이션 시작 후)
    setTimeout(() => sendMessage(prompt), 60)
  }, [sendMessage])

  // ─── STT (음성 입력) — 선택 ───
  const micRef = useRef(null)
  useEffect(() => { isSpeakingRef.current = (status === 'speaking') }, [status])

  const stopListening = useCallback(() => {
    if (micRef.current) { try { micRef.current.stop() } catch {} ; micRef.current = null }
    setIsListening(false)
  }, [])

  const toggleMic = useCallback(() => {
    if (isListening) { stopListening(); return }
    if (!isMicRecorderSupported()) { alert('이 브라우저는 음성 입력을 지원하지 않아요. 최신 Chrome/Safari를 사용해 주세요.'); return }
    const rec = new MicRecorder({
      sttEndpoint: '/api/stt',
      onTranscript: (t) => { const text = (t || '').trim(); if (text.length >= 2 && !isSpeakingRef.current && !isProcessingRef.current) sendMessage(text) },
      onError: (err) => console.warn('[STT]', err),
      onStateChange: (st) => setIsListening(st === 'listening' || st === 'recording'),
    })
    micRef.current = rec
    rec.start().catch(() => { alert('마이크를 시작하지 못했어요. 권한을 확인해 주세요.'); stopListening() })
  }, [isListening, sendMessage, stopListening])

  // 봇 발화 중 마이크 일시정지
  useEffect(() => {
    const rec = micRef.current
    if (!rec || !rec.isRunning) return
    if (status === 'speaking') rec.pause()
    else if (status === 'connected' && isListening) { try { rec.resume() } catch {} }
  }, [status, isListening])

  // voiceOff로 끄면 진행 중 음성 중단
  useEffect(() => { if (!voiceOn) clearTTSQueue() }, [voiceOn, clearTTSQueue])

  // 닫힌 상태에서 새 assistant 메시지 도착 시 unread 증가
  const lastLenRef = useRef(messages.length)
  useEffect(() => {
    if (!dockOpen && messages.length > lastLenRef.current) {
      const added = messages.slice(lastLenRef.current)
      if (added.some(m => m.role === 'assistant')) setUnread(u => u + 1)
    }
    lastLenRef.current = messages.length
  }, [messages, dockOpen])

  const resetChat = useCallback(() => {
    clearTTSQueue()
    sessionIdRef.current = newSessionId()
    historyRef.current = []
    setMessages([{ role: 'assistant', text: GREETING }])
  }, [clearTTSQueue])

  const value = {
    dockOpen, openDock, closeDock, toggleDock,
    messages, isProcessing, status, unread,
    sendMessage, askGreek, resetChat,
    voiceOn, setVoiceOn,
    isListening, toggleMic,
    avatarRef,
    suggestions: SUGGESTIONS,
  }
  return <BotContext.Provider value={value}>{children}</BotContext.Provider>
}
