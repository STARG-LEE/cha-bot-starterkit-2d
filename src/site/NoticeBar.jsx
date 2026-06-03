import styles from './site.module.css'
import { KIFIN_URL } from '../data/certs'

const scrollToId = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

// 맨 위 공지 바 — 옵션 거래엔 사전교육 수료증이 필요함을 명시
export default function NoticeBar() {
  return (
    <div className={styles.noticeBar}>
      <span className={styles.noticeIcon} aria-hidden="true">📜</span>
      <span className={styles.noticeText}>
        옵션 거래엔 <b>사전교육 수료증 + 모의거래</b> 이수가 필요해요 <span className={styles.noticeTag}>국내·해외 의무</span>
      </span>
      <a className={styles.noticeLink} href={KIFIN_URL} target="_blank" rel="noopener noreferrer">
        금융투자교육원 바로가기 ↗
      </a>
      <button className={styles.noticeMore} onClick={() => scrollToId('cert')}>자세히</button>
    </div>
  )
}
