import { useState, useEffect, useCallback } from 'react'
import { BotProvider } from './context/BotContext'
import Header from './site/Header'
import Landing from './site/Landing'
import BotDock from './components/BotDock'
import AuthModal from './components/AuthModal'
import { getUser, clearAuth, verifyToken } from './lib/api'

// ─────────────────────────────────────────────────────────────
// 에브리옵션 with GREEK — 옵션 학습 플랫폼
//   · 랜딩(Hero/진입장벽/기능) + 학습도구(로드맵·용어집·퀴즈·그릭Lab·모의고사)
//   · 우하단 토글 → 화면 절반 도크로 열리는 AI 길잡이 GREEK (BotDock)
//   · 모든 기능은 useBot().askGreek()로 봇과 연계
// ─────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(getUser())
  const [authOpen, setAuthOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => { verifyToken().then(u => { if (u) setUser(u) }) }, [])

  const toggleTheme = useCallback(() => setTheme(t => (t === 'light' ? 'dark' : 'light')), [])
  const handleLogout = useCallback(() => { clearAuth(); setUser(null) }, [])

  return (
    <BotProvider>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        onLoginClick={() => setAuthOpen(true)}
        onLogout={handleLogout}
      />
      <Landing />
      <BotDock />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={(u) => { setUser(u); setAuthOpen(false) }}
      />
    </BotProvider>
  )
}
