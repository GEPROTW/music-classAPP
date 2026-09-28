import { Link } from 'react-router-dom'
import { update, useDB } from '../lib/store'
import { roc, today } from '../lib/date'
import { Progress } from '../components/ui'
import { RESOURCES } from './learn/LearnHub'

export default function StudentHome() {
  const db = useDB()
  const s = db.students.find((x) => x.id === db.currentStudentId) ?? db.students[0]
  const c = db.courses.find((x) => x.id === s.courseId)!
  const t = db.teachers.find((x) => x.id === s.teacherId)!
  const next = db.lessons
    .filter((l) => l.studentIds.includes(s.id) && l.status === 'scheduled' && l.date >= today())
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0]
  const checkedToday = db.checkins.some((x) => x.date === today())
  const left = s.lessonsTotal - s.lessonsUsed
  const done = db.lessons.filter((l) => l.studentIds.includes(s.id) && l.status === 'done').length
  const leave = db.lessons.filter((l) => l.studentIds.includes(s.id) && l.status === 'leave').length

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="row wrap">
        <div className="avatar" style={{ margin: 0 }}>🧒</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>Hi，{s.name}！</div>
          <div className="muted">{c.name}・{t.name}老師</div>
        </div>
        <div className="spacer" />
        <select className="input" style={{ width: 150 }} value={s.id} onChange={(e) => update((d) => ({ ...d, currentStudentId: e.target.value }))} aria-label="切換孩子">
          {db.students.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg,#ffe0ec,#e6e0ff)', color: '#2a2233' }}>
        <div className="muted" style={{ color: '#6b6275' }}>🔔 課程預告</div>
        {next ? (
          <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>{roc(next.date, true)} {next.time}　<span style={{ fontSize: 15 }}>{next.room}</span></div>
        ) : <div style={{ marginTop: 4 }}>目前沒有排課，可以請櫃台幫忙約課</div>}
      </div>

      <div className="grid g2">
        <Link to="/learn/checkin" className="card">
          <div className="muted">今日練琴</div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{checkedToday ? '✅ 已打卡' : '⏳ 尚未打卡'}</div>
          <div className="muted">連續練習拿積分、餵寵物</div>
        </Link>
        <Link to="/learn/pet" className="card">
          <div className="muted">我的寵物 {db.pet.name}</div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{db.pet.kind} Lv.{db.pet.level}</div>
          <Progress value={db.pet.hunger / 100} color="var(--green)" />
        </Link>
      </div>

      <div className="card">
        <div className="row between"><h2 style={{ margin: 0 }}>📘 學習進度</h2><span className="muted">⭐ {s.points} 積分</span></div>
        <div className="grid g4" style={{ marginTop: 10, textAlign: 'center' }}>
          <div><b style={{ fontSize: 22 }}>{done}</b><div className="muted">已上課</div></div>
          <div><b style={{ fontSize: 22 }}>{leave}</b><div className="muted">請假</div></div>
          <div><b style={{ fontSize: 22, color: left <= 2 ? 'var(--bad)' : undefined }}>{left}</b><div className="muted">剩餘堂數</div></div>
          <div><b style={{ fontSize: 22 }}>{Math.round((s.lessonsUsed / s.lessonsTotal) * 100)}%</b><div className="muted">課程包完成</div></div>
        </div>
      </div>

      <div className="card">
        <h2>🗣️ 最近課堂點評</h2>
        {[['課堂表現', 5], ['音符準確', 4], ['節奏穩定', 4]].map(([k, v]) => (
          <div key={k} className="row between" style={{ padding: '4px 0' }}><span>{k}</span><span style={{ color: '#f5a623', letterSpacing: 2 }}>{'★'.repeat(v as number)}{'☆'.repeat(5 - (v as number))}</span></div>
        ))}
        <div className="muted" style={{ marginTop: 6 }}>「右手第三小節的跳音很漂亮，回家記得慢速練左手喔！」— {t.name}老師</div>
      </div>

      <div className="grid g4">
        {RESOURCES.slice(0, 8).map((r) => (
          <Link key={r.to} to={r.to} className="card center" style={{ padding: 12 }}>
            <div style={{ fontSize: 30 }}>{r.ico}</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{r.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
