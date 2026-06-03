import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'
import { newSessionId, saveChat } from '../lib/api'
import { MicRecorder, isMicRecorderSupported } from '../lib/stt'

// ─────────────────────────────────────────────────────────────
// GREEK 봇 컨텍스트 — 채팅 스트리밍 + 음성(STT/TTS) + 화상(카메라) + 도크 상태.
// 대화 모드 3종 (스타터킷 그대로, 도크 안에서 동작):
//   ttt : 텍스트만 (기본)        — 아바타 보이되 음성/카메라 없음
//   sts : 음성 대화              — 자동 듣기 + 봇 음성 발화 (카메라 없음)
//   ftf : 화상 대화              — 위 + 사용자 카메라 (비전 의도 시 프레임 첨부)
// 기능 컴포넌트는 useBot().askGreek(prompt)로 도크를 열고 질문을 주입한다.
// ─────────────────────────────────────────────────────────────

const GREETING = '안녕하세요! 저는 옵션 길잡이 GREEK이에요. Δ Γ Θ ν ρ 그릭부터 자격시험까지, 옵션이 막막할 때 뭐든 물어보세요. 무엇이 궁금하세요?'
const GREETING_TTS = '안녕하세요! 저는 옵션 길잡이 그릭이에요. 옵션이 막막할 때 뭐든 물어보세요.'
const SUGGESTIONS = ['콜옵션이 뭐야?', '델타를 쉽게 설명해줘', '옵션 거래 자격은 어떻게 따?', '커버드콜 전략이 궁금해']

const ECHO_RESUME_DELAY_MS = 700
const VISION_INTENT = /보여|보이|보세요|뒤에|뒷.{0,2}배경|배경에|여기.{0,2}어|주변|화면|카메라|캠|영상|모습|어떻게.{0,3}보|뭐가.{0,3}보/

const BotContext = createContext(null)
export const useBot = () => {
  const ctx = useContext(BotContext)
  if (!ctx) throw new Error('useBot must be used within <BotProvider>')
  return ctx
}

function normalizeTranscript(t) { return (t || '').replace(/\s+/g, ' ').trim() }
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
  const [status, setStatus]           = useState('idle')   // idle | connecting | connected | speaking
  const [mode, setMode]               = useState('ttt')    // ttt | sts | ftf
  const [isListening, setIsListening] = useState(false)
  const [autoListen, setAutoListen]   = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [unread, setUnread]           = useState(0)

  const avatarRef       = useRef(null)
  const userVideoRef    = useRef(null)
  const cameraStreamRef = useRef(null)
  const sessionIdRef    = useRef(newSessionId())
  const historyRef      = useRef([])
  const isProcessingRef = useRef(false)
  const isSpeakingRef   = useRef(false)
  const autoListenRef   = useRef(false)
  const isListeningRef  = useRef(false)
  const modeRef         = useRef('ttt')
  const greetedVoiceRef = useRef(false)
  const micRecorderRef  = useRef(null)
  const echoResumeTimerRef = useRef(null)
  const lastSubmittedSpeechRef = useRef({ key: '', at: 0 })

  useEffect(() => { isProcessingRef.current = isProcessing }, [isProcessing])
  useEffect(() => { autoListenRef.current = autoListen }, [autoListen])
  useEffect(() => { isListeningRef.current = isListening }, [isListening])
  useEffect(() => { isSpeakingRef.current = (status === 'speaking') }, [status])
  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { if (userVideoRef.current) userVideoRef.current.srcObject = cameraStream || null }, [cameraStream])

  // ─── 카메라 ───
  const stopUserCamera = useCallback(() => {
    if (cameraStreamRef.current) { cameraStreamRef.current.getTracks().forEach(t => t.stop()); cameraStreamRef.current = null }
    setCameraStream(null)
  }, [])
  const startUserCamera = useCallback(async () => {
    if (cameraStreamRef.current) return true
    if (!navigator.mediaDevices?.getUserMedia) { alert('이 브라우저는 카메라를 지원하지 않아요.'); return false }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      cameraStreamRef.current = stream; setCameraStream(stream); return true
    } catch { alert('카메라 권한이 필요해요. 주소창 왼쪽 자물쇠 아이콘에서 허용해주세요.'); return false }
  }, [])
  const captureCameraFrame = useCallback(() => {
    const video = userVideoRef.current
    if (!video || !cameraStreamRef.current || !video.videoWidth) return null
    try {
      const W = 640, H = 480, canvas = document.createElement('canvas')
      canvas.width = W; canvas.height = H
      canvas.getContext('2d').drawImage(video, 0, 0, W, H)
      return canvas.toDataURL('image/jpeg', 0.7)
    } catch { return null }
  }, [])
  useEffect(() => () => stopUserCamera(), [stopUserCamera])

  // ─── TTS 큐 (ttt 모드에선 비활성) ───
  const ttsQueueRef = useRef([]); const ttsRunningRef = useRef(false); const ttsAbortRef = useRef(false)
  const processTTSQueue = useCallback(async () => {
    if (ttsRunningRef.current) return
    ttsRunningRef.current = true
    const avatar = avatarRef.current
    try {
      while (ttsQueueRef.current.length > 0 && !ttsAbortRef.current) {
        const bufPromise = ttsQueueRef.current.shift()
        if (!bufPromise) continue
        let buf; try { buf = await bufPromise } catch { continue }
        if (ttsAbortRef.current) break
        if (!isSpeakingRef.current) { isSpeakingRef.current = true; setStatus('speaking') }
        if (avatar?.speak) { try { await avatar.speak(buf) } catch {} }
      }
    } finally {
      ttsRunningRef.current = false; ttsAbortRef.current = false
      if (isSpeakingRef.current && ttsQueueRef.current.length === 0) {
        isSpeakingRef.current = false; setStatus(s => (s === 'speaking' ? 'connected' : s))
      }
    }
  }, [])
  const enqueueTTS = useCallback((sentence) => {
    if (modeRef.current === 'ttt') return
    const clean = sanitizeForTTS(normalizeTtsText(sentence))
    if (!clean) return
    const bufPromise = fetch('/api/tts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: clean }),
    }).then(r => { if (!r.ok) throw new Error('tts ' + r.status); return r.arrayBuffer() })
    ttsQueueRef.current.push(bufPromise); processTTSQueue()
  }, [processTTSQueue])
  const clearTTSQueue = useCallback(() => {
    ttsAbortRef.current = true; ttsQueueRef.current = []
    try { avatarRef.current?.stopSpeaking?.() } catch {}
    isSpeakingRef.current = false; setStatus(s => (s === 'speaking' ? 'connected' : s))
  }, [])

  // ─── 메시지 전송 (스트리밍 SSE) ───
  const sendMessage = useCallback(async (userText) => {
    const text = (userText || '').trim()
    if (!text || isProcessingRef.current) return
    if (isSpeakingRef.current) return
    isProcessingRef.current = true; setIsProcessing(true)
    setStatus(s => (s === 'idle' ? 'connected' : s))

    setMessages(prev => [...prev, { role: 'user', text }])
    historyRef.current = [...historyRef.current, { role: 'user', content: text }]
    saveChat(sessionIdRef.current, 'user', text)
    setMessages(prev => [...prev, { role: 'assistant', text: '' }])

    let accumulated = '', pending = '', isFirstFlush = true
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
      const wantsVision = modeRef.current === 'ftf' && VISION_INTENT.test(text)
      const frame = wantsVision ? captureCameraFrame() : null
      const images = frame ? [frame] : []

      const res = await fetch('/api/chat-stream', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historyRef.current.slice(-8), images }),
      })
      if (!res.ok || !res.body) throw new Error('chat-stream ' + res.status)

      const reader = res.body.getReader(); const decoder = new TextDecoder(); let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        let nlIdx
        while ((nlIdx = buf.indexOf('\n\n')) !== -1) {
          const event = buf.slice(0, nlIdx).trim(); buf = buf.slice(nlIdx + 2)
          if (!event.startsWith('data: ')) continue
          const payload = event.slice(6).trim()
          if (payload === '[DONE]') { buf = ''; break }
          let obj; try { obj = JSON.parse(payload) } catch { continue }
          if (obj.token) {
            accumulated += obj.token; pending += obj.token
            setMessages(prev => {
              const next = [...prev]; const last = next[next.length - 1]
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
    } catch {
      setMessages(prev => {
        const next = [...prev]; const last = next[next.length - 1]
        if (last && last.role === 'assistant' && !last.text)
          next[next.length - 1] = { role: 'assistant', text: '⚠️ 봇 서버에 연결하지 못했어요. 배포 환경(Vercel)에서 TEAM_ID/RAG 설정이 필요할 수 있어요.' }
        return next
      })
    } finally {
      isProcessingRef.current = false; setIsProcessing(false)
    }
  }, [enqueueTTS, captureCameraFrame])

  // ─── STT (음성 입력) ───
  const submitSpeechText = useCallback((rawText) => {
    const text = normalizeTranscript(rawText)
    if (!text || text.length < 2) return
    if (isSpeakingRef.current || isProcessingRef.current) return
    const key = text.replace(/\s+/g, ''); const now = Date.now(); const last = lastSubmittedSpeechRef.current
    if (key === last.key && now - last.at < 8000) return
    lastSubmittedSpeechRef.current = { key, at: now }
    sendMessage(text)
  }, [sendMessage])

  const ensureMicRecorder = useCallback(() => {
    if (micRecorderRef.current) return micRecorderRef.current
    if (!isMicRecorderSupported()) { alert('이 브라우저는 음성 인식을 지원하지 않아요. 텍스트 모드를 이용하거나 최신 Chrome/Safari에서 시도해주세요.'); return null }
    const rec = new MicRecorder({
      sttEndpoint: '/api/stt',
      onTranscript: (t) => submitSpeechText(t),
      onError: (err) => console.warn('[STT]', err),
      onStateChange: (st) => { const l = st === 'listening' || st === 'recording'; isListeningRef.current = l; setIsListening(l) },
    })
    micRecorderRef.current = rec; return rec
  }, [submitSpeechText])

  const startListening = useCallback(async () => {
    const rec = ensureMicRecorder()
    if (!rec) { autoListenRef.current = false; setAutoListen(false); return }
    try { if (!rec.isRunning) await rec.start(); else rec.resume() }
    catch (e) {
      const denied = e?.name === 'NotAllowedError' || /denied|permission|allowed/i.test(e?.message || '')
      alert(denied ? '마이크 권한이 필요해요. 주소창 왼쪽 자물쇠 아이콘에서 허용해주세요.' : '마이크를 시작하지 못했어요.')
      autoListenRef.current = false; setAutoListen(false)
    }
  }, [ensureMicRecorder])

  const stopListening = useCallback(() => {
    const rec = micRecorderRef.current
    if (rec) { try { rec.stop() } catch {} ; micRecorderRef.current = null }
    isListeningRef.current = false; setIsListening(false)
  }, [])

  // 에코 가드: 봇 발화 중 마이크 일시정지 / 발화 끝나면 재개
  useEffect(() => {
    const rec = micRecorderRef.current
    clearTimeout(echoResumeTimerRef.current)
    if (!rec || !rec.isRunning) return
    if (status === 'speaking') rec.pause()
    else if (status === 'connected' && autoListenRef.current) {
      echoResumeTimerRef.current = setTimeout(() => {
        const r = micRecorderRef.current
        if (r && r.isRunning && autoListenRef.current && !isSpeakingRef.current && !isProcessingRef.current) r.resume()
      }, ECHO_RESUME_DELAY_MS)
    }
    return () => clearTimeout(echoResumeTimerRef.current)
  }, [status])
  useEffect(() => {
    const rec = micRecorderRef.current
    if (!isProcessing && autoListen && rec && rec.isRunning && !isSpeakingRef.current) rec.resume()
  }, [isProcessing, autoListen])

  // ─── 음성 세션 시작/정지 ───
  const startVoiceSession = useCallback(() => {
    setStatus('connected')
    autoListenRef.current = true; setAutoListen(true)
    startListening()
    if (!greetedVoiceRef.current) { greetedVoiceRef.current = true; enqueueTTS(normalizeTtsText(GREETING_TTS)) }
  }, [startListening, enqueueTTS])
  const stopVoiceSession = useCallback(() => {
    clearTimeout(echoResumeTimerRef.current)
    autoListenRef.current = false; setAutoListen(false)
    stopListening(); clearTTSQueue()
  }, [stopListening, clearTTSQueue])

  // ─── 모드 전환 ───
  const changeMode = useCallback(async (next) => {
    if (next === modeRef.current) return
    modeRef.current = next; setMode(next)
    if (next === 'ttt') { stopUserCamera(); stopVoiceSession(); setStatus('connected'); return }
    if (next === 'ftf') { setStatus('connecting'); const ok = await startUserCamera(); if (!ok) { modeRef.current = 'sts'; setMode('sts') } }
    else { stopUserCamera() }
    startVoiceSession()
  }, [startUserCamera, stopUserCamera, startVoiceSession, stopVoiceSession])

  // 마이크 버튼: ttt면 음성(sts)으로 진입, 음성 모드면 듣기 일시정지/재개
  const toggleMic = useCallback(() => {
    if (modeRef.current === 'ttt') { changeMode('sts'); return }
    if (autoListenRef.current || isListeningRef.current) { autoListenRef.current = false; setAutoListen(false); stopListening() }
    else { autoListenRef.current = true; setAutoListen(true); startListening() }
  }, [changeMode, startListening, stopListening])

  const interruptSpeaking = useCallback(() => { try { clearTTSQueue() } catch {} }, [clearTTSQueue])

  // ESC로 발화 인터럽트
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (modeRef.current === 'ttt' && !isSpeakingRef.current) return
      interruptSpeaking()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [interruptSpeaking])

  // ─── 도크 제어 ───
  const openDock  = useCallback(() => { setDockOpen(true); setUnread(0); setStatus(s => (s === 'idle' ? 'connected' : s)) }, [])
  const closeDock = useCallback(() => { setDockOpen(false); stopUserCamera(); stopVoiceSession(); if (modeRef.current !== 'ttt') { modeRef.current = 'ttt'; setMode('ttt') } }, [stopUserCamera, stopVoiceSession])
  const toggleDock = useCallback(() => setDockOpen(o => { if (o) { stopUserCamera(); stopVoiceSession(); if (modeRef.current !== 'ttt') { modeRef.current = 'ttt'; setMode('ttt') } } else { setUnread(0); setStatus(s => (s === 'idle' ? 'connected' : s)) } return !o }), [stopUserCamera, stopVoiceSession])

  // ─── 기능 → 봇 연계 ───
  const askGreek = useCallback((prompt) => {
    setDockOpen(true); setUnread(0); setStatus(s => (s === 'idle' ? 'connected' : s))
    setTimeout(() => sendMessage(prompt), 60)
  }, [sendMessage])

  const resetChat = useCallback(() => {
    clearTTSQueue(); sessionIdRef.current = newSessionId(); historyRef.current = []; greetedVoiceRef.current = false
    setMessages([{ role: 'assistant', text: GREETING }])
  }, [clearTTSQueue])

  // 닫힌 상태에서 새 assistant 메시지 → unread
  const lastLenRef = useRef(messages.length)
  useEffect(() => {
    if (!dockOpen && messages.length > lastLenRef.current) {
      if (messages.slice(lastLenRef.current).some(m => m.role === 'assistant')) setUnread(u => u + 1)
    }
    lastLenRef.current = messages.length
  }, [messages, dockOpen])

  // 언마운트 정리
  useEffect(() => () => { clearTimeout(echoResumeTimerRef.current); if (micRecorderRef.current) { try { micRecorderRef.current.stop() } catch {} } }, [])

  const value = {
    dockOpen, openDock, closeDock, toggleDock,
    messages, isProcessing, status, unread,
    sendMessage, askGreek, resetChat, interruptSpeaking,
    mode, changeMode,
    isListening, autoListen, toggleMic,
    cameraStream, userVideoRef,
    avatarRef, suggestions: SUGGESTIONS,
  }
  return <BotContext.Provider value={value}>{children}</BotContext.Provider>
}
