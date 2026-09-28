import { Link } from 'react-router-dom'
import { PageHead } from '../../components/ui'
import { useDB } from '../../lib/store'

export const RESOURCES = [
  { to: '/learn/growth', label: '成長檔案', ico: '📈', bg: '#dff0ff', desc: '上課紀錄、點評、證書' },
  { to: '/learn/cloud', label: '雲端空間', ico: '☁️', bg: '#e6f4ff', desc: '課堂錄影、講義、錄音' },
  { to: '/learn/scores', label: '樂譜庫', ico: '🎼', bg: '#f1e8ff', desc: '台灣民謠、童謠、檢定曲' },
  { to: '/learn/wiki', label: '音樂百科', ico: '📚', bg: '#e9fbe9', desc: '樂器、音樂家、台灣作曲家' },
  { to: '/learn/ear', label: '視唱練耳', ico: '👂', bg: '#fff2d9', desc: '音程、單音辨識' },
  { to: '/learn/instruments', label: '樂器模擬器', ico: '🎹', bg: '#ffe6ef', desc: '鋼琴鍵盤、爵士鼓' },
  { to: '/learn/basics', label: '基本功', ico: '⏱️', bg: '#e8ecff', desc: '節拍器、音階練習' },
  { to: '/learn/quiz', label: '樂理練習題', ico: '📝', bg: '#e3fff6', desc: 'YAMAHA／ABRSM 樂理題型' },
  { to: '/learn/ai', label: 'AI 節奏陪練', ico: '🤖', bg: '#fff0e0', desc: '跟著節奏打拍，即時評分' },
  { to: '/learn/works', label: '作品秀場', ico: '🌟', bg: '#ffeef8', desc: '上傳演奏、老師點評' },
  { to: '/learn/points', label: '積分兌換', ico: '🎁', bg: '#fff7d6', desc: '用練習積分換好禮' },
  { to: '/learn/pet', label: '音樂寵物', ico: '🐣', bg: '#eaffea', desc: '練琴餵寵物，一起長大' },
  { to: '/learn/checkin', label: '練琴打卡', ico: '✅', bg: '#e6f7ff', desc: '每日打卡、連續天數' },
]

export default function LearnHub() {
  const db = useDB()
  return (
    <>
      <PageHead back={false} title="音樂學習資源" sub={db.role === 'student' ? '課堂＋課後全套學習資源' : '老師可於課堂投影使用，學生端同步開放'} />
      <div className="grid auto">
        {RESOURCES.map((r) => (
          <Link key={r.to} to={r.to} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="emoji-box" style={{ background: r.bg, width: '100%', height: 88, fontSize: 44 }}>{r.ico}</div>
            <b style={{ fontSize: 16 }}>{r.label}</b>
            <span className="muted">{r.desc}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
