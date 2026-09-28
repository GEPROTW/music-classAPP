import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast, update, useDB } from '../lib/store'
import { WEEKDAYS, today, uid } from '../lib/date'
import { Modal, PageHead, Progress } from '../components/ui'

export function Classes() {
  const db = useDB()
  const [adding, setAdding] = useState(false)
  const [f, setF] = useState({ name: '', courseId: db.courses[0].id, teacherId: db.teachers[0].id, weekday: 6, time: '10:00', room: 'A 教室', capacity: 6 })
  return (
    <>
      <PageHead title="班級管理" sub={`${db.classes.length} 個固定班級`} right={<button className="btn" onClick={() => setAdding(true)}>＋ 開新班</button>} />
      <div className="grid auto-l">
        {db.classes.map((g) => {
          const c = db.courses.find((c) => c.id === g.courseId)!
          const t = db.teachers.find((t) => t.id === g.teacherId)!
          const members = db.students.filter((s) => s.classId === g.id)
          return (
            <div key={g.id} className="card">
              <div className="row">
                <div className="emoji-box" style={{ background: c.color }}>{c.cover}</div>
                <div>
                  <b>{g.name}</b>
                  <div className="muted">每週{WEEKDAYS[g.weekday]} {g.time}・{g.room}</div>
                </div>
              </div>
              <div className="row between" style={{ margin: '12px 0 6px' }}>
                <span className="sub">{t.name}老師</span>
                <span className="sub">{members.length} / {g.capacity} 人</span>
              </div>
              <Progress value={members.length / g.capacity} color={members.length >= g.capacity ? 'var(--bad)' : 'var(--green)'} />
              <div className="row wrap" style={{ marginTop: 10, gap: 6 }}>
                {members.map((m) => <Link key={m.id} to={`/students/${m.id}`} className="tag">{m.name}</Link>)}
                {members.length < g.capacity && <span className="tag good">尚餘 {g.capacity - members.length} 名額</span>}
              </div>
            </div>
          )
        })}
      </div>
      {adding && (
        <Modal title="開新班" onClose={() => setAdding(false)}>
          <div className="grid g2">
            <label className="field">班級名稱<input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="例：烏克麗麗 週日班" /></label>
            <label className="field">課程
              <select className="input" value={f.courseId} onChange={(e) => setF({ ...f, courseId: e.target.value })}>
                {db.courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="field">老師
              <select className="input" value={f.teacherId} onChange={(e) => setF({ ...f, teacherId: e.target.value })}>
                {db.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <label className="field">星期
              <select className="input" value={f.weekday} onChange={(e) => setF({ ...f, weekday: +e.target.value })}>
                {WEEKDAYS.map((w, i) => <option key={w} value={i}>週{w}</option>)}
              </select>
            </label>
            <label className="field">時間<input className="input" type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></label>
            <label className="field">人數上限<input className="input" type="number" min={1} value={f.capacity} onChange={(e) => setF({ ...f, capacity: +e.target.value })} /></label>
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
            <button className="btn" disabled={!f.name.trim()} onClick={() => {
              update((d) => ({ ...d, classes: [...d.classes, { id: uid('g'), ...f }] }))
              setAdding(false)
              toast('已開新班')
            }}>建立</button>
          </div>
        </Modal>
      )}
    </>
  )
}

export function Teachers() {
  const db = useDB()
  const t0 = today()
  const monthStart = t0.slice(0, 8) + '01'
  return (
    <>
      <PageHead title="老師管理" sub="授課統計與鐘點費試算（本月）" />
      <div className="grid auto-l">
        {db.teachers.map((t) => {
          const done = db.lessons.filter((l) => l.teacherId === t.id && l.status === 'done' && l.date >= monthStart)
          const hours = done.reduce((sum, l) => sum + (db.courses.find((c) => c.id === l.courseId)?.minutes ?? 50) / 60, 0)
          const students = db.students.filter((s) => s.teacherId === t.id).length
          const rate = 600
          return (
            <div key={t.id} className="card">
              <div className="row">
                <div className="avatar" style={{ margin: 0, width: 52, height: 52, fontSize: 28 }}>{t.emoji}</div>
                <div>
                  <b>{t.name}</b> <span className="tag">{t.title}</span>
                  <div className="muted">{t.instruments.join('・')}｜{t.phone}</div>
                </div>
              </div>
              <div className="stat-row">
                <div><b>{students}</b>負責學生</div>
                <div><b>{done.length}</b>本月堂數</div>
                <div><b>{hours.toFixed(1)}</b>授課時數</div>
              </div>
              <div className="row between" style={{ marginTop: 10 }}>
                <span className="muted">鐘點費（NT${rate}/小時）</span>
                <b>NT${Math.round(hours * rate).toLocaleString()}</b>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
