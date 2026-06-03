import { useEffect, useRef, useState } from 'react'
import styles from './site.module.css'

// 스크롤 진입 시 페이드/슬라이드 인
export default function Reveal({ children, as: Tag = 'div', className = '', delay = 0, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } },
      { threshold: 0.12 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${shown ? styles.revealIn : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
