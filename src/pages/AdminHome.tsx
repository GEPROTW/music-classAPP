import { Link } from 'react-router-dom'
import { useDB } from '../lib/store'
import { roc, today } from '../lib/date'

const BIG = [
  { to: '/students', label: '學生管理', emoji: '🥁🐻', bg: 'linear-gradient(160deg,#7b61c9,#a48bf0)' },
  { to: '/classes', label: '班級管理', emoji: '🎸🦖', bg: 'linear-gradient(160deg,#ff8f8f,#ffb3b3)' },
  { to: '/teachers', label: '老師管理', emoji: '🐷🎸', bg: 'linear-gradient(160deg,#ffb300,#ffd35c)' },
  { to: '/data', label: '數據中心', emoji: '📊🎸', bg: 'linear-gradient(160deg,#3f7cff,#ff7fae)' },
]

const PILLS = [
  { to: '/courses', label: '課程管理', ico: '📖', bg: '#3d8bff' },
  { to: '/lessons', label: '堂數點名', ico: '🎧', bg: '#ff7fae' },
  { to: '/schedule', label: '排課約課', ico: '🗓️', bg: '#ffa53d' },
  { to: '/finance', label: '財務中心', ico: '💰', bg: '#9b7bff', admin: true },
]

export default function AdminHome() {
  const db = useDB()
  const t = today()
  const isAdmin = db.role === 'admin'
  const todays = db.lessons.filter((l) => l.date === t).sort((a, b) => a.time.localeCompare(b.time))
  const followToday = db.leads.filter((l) => l.nextFollow <= t && l.stage !== 'won' && l.stage !== 'lost').length
  const renew = db.students.filter((s) => s.lessonsTotal - s.lessonsUsed <= 2 && s.status === 'active').length
  const me = isAdmin ? { name: '王校長', emoji: '🐻' } : { name: db.teachers[0].name, emoji: db.teachers[0].emoji }

  return (
    <div className="col" style={{ gap: 16 }}>
      <div className="home-grid">
        <div className="col">
          <div className="card profile">
            <div className="tag" style={{ background: 'var(--blue)', color: '#fff', border: 0 }}>個人中心</div>
            <div className="avatar" style={{ marginTop: 10 }}>{me.emoji}</div>
            <b>{me.name}</b>
            <div className="muted">{roc(t, true)}</div>
            <div className="stat-row">
              <div><b>{db.students.filter((s) => s.status !== 'paused').length}</b>在學學生</div>
              <div><b>{todays.length}</b>今日課程</div>
              <div><b>{db.teachers.length}</b>老師</div>
            </div>
          </div>
          <div className="card grid g2" style={{ padding: 12, gap: 10 }}>
            {[
              { to: '/grow/contests', label: '活動比賽', ico: '🏆', bg: '#ff8a6b', badge: db.contests.length },
              { to: '/grow/enroll', label: '招生工具', ico: '🎁', bg: '#a68bff' },
              { to: '/messages', label: 'LINE 通知', ico: '💬', bg: '#06c755' },
              { to: '/grow/shop', label: '推薦商城', ico: '🛍️', bg: '#4aa3ff' },
            ].map((x) => (
              <Link key={x.to} to={x.to} className="pill-btn" style={{ background: x.bg, flexDirection: 'column', gap: 4, padding: 10, position: 'relative' }}>
                <span className="ico">{x.ico}</span>
                <span style={{ fontSize: 13 }}>{x.label}</span>
                {x.badge ? <span className="badge">{x.badge}</span> : null}
              </Link>
            ))}
          </div>
        </div>

        <div className="col">
          <div className="grid home-tiles" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))' }}>
            {BIG.filter((b) => isAdmin || b.to !== '/teachers').map((b) => (
              <Link key={b.to} to={b.to} className="tile">
                <div className="art" style={{ background: b.bg }}>{b.emoji}</div>
                <div className="label">{b.label}</div>
              </Link>
            ))}
            <Link to="/grow/enroll" className="tile">
              <div className="art" style={{ background: 'linear-gradient(160deg,#6fd3a8,#b8f0c2)' }}>🏕️🎒</div>
              <div className="label">營隊／戶外教學</div>
            </Link>
            {isAdmin && (
              <Link to="/cashier" className="tile">
                <div className="art" style={{ background: 'linear-gradient(160deg,#ff5f6d,#ffc371)' }}>💳🪙</div>
                <div className="label">收銀台</div>
              </Link>
            )}
          </div>
          <div className="pill-stack">
            {PILLS.filter((p) => isAdmin || !p.admin).map((p) => (
              <Link key={p.to} to={p.to} className="pill-btn" style={{ background: p.bg }}>
                <span className="ico">{p.ico}</span>
                {p.label}
              </Link>
            ))}
            <Link to="/leads" className="pill-btn" style={{ background: '#3d6bff' }}>
              <span className="ico">📞</span>今日待跟進 {followToday > 0 && <span className="tag" style={{ background: '#fff', color: 'var(--bad)' }}>{followToday}</span>}
            </Link>
            <Link to="/leads" className="pill-btn" style={{ background: '#8f5bff' }}><span className="ico">🧲</span>潛在學生</Link>
            <Link to="/renewal" className="pill-btn" style={{ background: '#ff5e8a' }}>
              <span className="ico">🔔</span>續費提醒 {renew > 0 && <span className="tag" style={{ background: '#fff', color: 'var(--bad)' }}>{renew}</span>}
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="row between">
          <h2 style={{ margin: 0 }}>今日課表｜{roc(t, true)}</h2>
          <Link to="/schedule" className="btn small secondary">完整課表 ›</Link>
        </div>
        {todays.length === 0 ? (
          <div className="muted" style={{ padding: '16px 0' }}>今天沒有排課（週一公休）。</div>
        ) : (
          todays.map((l) => {
            const c = db.courses.find((c) => c.id === l.courseId)!
            const te = db.teachers.find((x) => x.id === l.teacherId)!
            return (
              <div key={l.id} className="list-item">
                <div className="emoji-box" style={{ background: c.color }}>{c.cover}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b>{l.time}　{c.name}</b>
                  <div className="muted">{te.name}・{l.room}・{l.studentIds.length} 位學生</div>
                </div>
                <span className={`tag ${l.kind === 'trial' ? 'warn' : ''}`}>{l.kind === 'class' ? '團體課' : l.kind === 'trial' ? '體驗課' : '個別課'}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
