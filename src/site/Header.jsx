import { useState } from 'react'
import styles from './site.module.css'
import { useBot } from '../context/BotContext'

const LINKS = [
  { id: 'cert', label: '거래 자격' },
  { id: 'roadmap', label: '학습 로드맵' },
  { id: 'glossary', label: '용어집' },
  { id: 'quiz', label: '퀴즈' },
  { id: 'greekslab', label: '그릭 Lab' },
  { id: 'exam', label: '모의고사' },
]

function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Header({ theme, onToggleTheme, user, onLoginClick, onLogout }) {
  const { openDock } = useBot()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className={styles.nav}>
      <div className={styles.navInner}>
        <div className={styles.brand} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className={styles.brandMark}>Δ</div>
          <div className={styles.brandText}>
            <div className={styles.brandName}>에브리옵션</div>
            <div className={styles.brandSub}>WITH GREEK</div>
          </div>
        </div>

        <div className={styles.navLinks}>
          {LINKS.map(l => (
            <button key={l.id} className={styles.navLink} onClick={() => scrollToId(l.id)}>{l.label}</button>
          ))}
        </div>

        <div className={styles.navRight}>
          <button className={styles.iconGhost} onClick={onToggleTheme} title="테마 전환" aria-label="테마 전환">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user ? (
            <>
              <span className={styles.userChip}>{user.name || user.nickname || '회원'}님</span>
              <button className={styles.iconGhost} onClick={onLogout} title="로그아웃" aria-label="로그아웃">⏏</button>
            </>
          ) : (
            <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={onLoginClick}>로그인</button>
          )}
          <button className={`${styles.btn} ${styles.btnGold} ${styles.btnSm} ${styles.navCta}`} onClick={openDock}>
            Δ GREEK 시작
          </button>
          <button className={`${styles.iconGhost} ${styles.menuBtn}`} onClick={() => setMenuOpen(m => !m)} aria-label="메뉴">☰</button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 16px 14px', gap: 2, borderTop: '1px solid var(--border)' }}>
          {LINKS.map(l => (
            <button key={l.id} className={styles.navLink} style={{ textAlign: 'left' }}
              onClick={() => { scrollToId(l.id); setMenuOpen(false) }}>{l.label}</button>
          ))}
        </div>
      )}
    </nav>
  )
}
