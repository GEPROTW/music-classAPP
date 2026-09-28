import { useState } from 'react'
import { toast, update, useDB } from '../lib/store'
import { WEEKDAYS, addDays, roc, today, uid, weekday } from '../lib/date'
import { holiday } from '../lib/holidays'
import type { Lesson } from '../lib/types'
import { Modal, PageHead } from '../components/ui'

const ROOMS = ['A 教室', 'B 教室', '琴房 1', '琴房 2', '鼓室', '團體教室', '律動教室']

export default function Schedule() {
  const db = useDB()
  const [start, setStart] = useState(() => {
    const t = today()
    return addDays(t, -weekday(t)) // 週日為一週起點
  })
  const [teacher, setTeacher] = useState('all')
  const [booking, setBooking] = useState<string | null>(null)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  return (
    <>
      <PageHead title="排課約課" sub="週課表・一對一約課・衝堂自動檢查" right={<button className="btn" onClick={() => setBooking(today())}>＋ 約課</button>} />
      <div className="row wrap" style={{ marginBottom: 12 }}>
        <button className="btn secondary small" onClick={() => setStart(addDays(start, -7))}>‹ 上週</button>
        <button className="btn secondary small" onClick={() => setStart(addDays(today(), -weekday(today())))}>本週</button>
        <button className="btn secondary small" onClick={() => setStart(addDays(start, 7))}>下週 ›</button>
        <b>{roc(days[0])} – {roc(days[6])}</b>
        <div className="spacer" />
        <select className="input" style={{ width: 160 }} value={teacher} onChange={(e) => setTeacher(e.target.value)}>
          <option value="all">全部老師</option>
          {db.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(140px, 1fr))', gap: 10 }}>
          {days.map((d) => {
            const h = holiday(d)
            const lessons = db.lessons
              .filter((l) => l.date === d && (teacher === 'all' || l.teacherId === teacher))
              .sort((a, b) => a.time.localeCompare(b.time))
            return (
              <div key={d} className="card" style={{ padding: 10, background: d === today() ? 'var(--card-soft)' : undefined, outline: d === today() ? '2px solid var(--brand)' : undefined }}>
                <div className="row between">
                  <b>週{WEEKDAYS[weekday(d)]}</b>
                  <span className="muted">{d.slice(5).replace('-', '/')}</span>
                </div>
                {h && <div className="tag bad" style={{ marginTop: 4 }}>🎌 {h}</div>}
                {weekday(d) === 1 && <div className="tag" style={{ marginTop: 4 }}>公休</div>}
                <div className="col" style={{ gap: 6, marginTop: 8 }}>
                  {lessons.map((l) => {
                    const c = db.courses.find((c) => c.id === l.courseId)!
                    const t = db.teachers.find((t) => t.id === l.teacherId)!
                    return (
                      <div key={l.id} style={{ background: c.color, color: '#2a2233', borderRadius: 10, padding: '6px 8px', fontSize: 12, opacity: l.status === 'leave' ? 0.5 : 1 }}>
                        <b>{l.time}</b> {c.name}
                        <div>{t.name}・{l.room}{l.kind === 'trial' && '・體驗'}</div>
                      </div>
                    )
                  })}
                  <button className="btn secondary small" onClick={() => setBooking(d)}>＋</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {booking && <BookModal date={booking} onClose={() => setBooking(null)} />}
    </>
  )
}

function BookModal({ date, onClose }: { date: string; onClose: () => void }) {
  const db = useDB()
  const [f, setF] = useState({ studentId: db.students[0].id, date, time: '15:00', room: ROOMS[2], repeat: 1 })
  const s = db.students.find((s) => s.id === f.studentId)!
  const dates = Array.from({ length: f.repeat }, (_, i) => addDays(f.date, i * 7))
  const conflicts = dates.flatMap((d) =>
    db.lessons
      .filter((l) => l.date === d && l.time === f.time && l.status !== 'leave' && (l.teacherId === s.teacherId || l.room === f.room))
      .map((l) => `${roc(d)} ${l.time} ${l.teacherId === s.teacherId ? '老師已有課' : `${l.room} 已被使用`}`),
  )
  const left = s.lessonsTotal - s.lessonsUsed
  function save() {
    const news: Lesson[] = dates.map((d) => ({
      id: uid('L'), date: d, time: f.time, courseId: s.courseId, teacherId: s.teacherId, studentIds: [s.id], room: f.room,
      status: 'scheduled', kind: s.status === 'trial' ? 'trial' : 'private',
    }))
    update((d) => ({
      ...d,
      lessons: [...d.lessons, ...news],
      messages: [{ id: uid('m'), date: today(), to: s.parent, channel: s.lineBound ? 'LINE' : '簡訊', text: `【約課成功】${s.name} ${dates.map((x) => roc(x)).join('、')} ${f.time} @${f.room}` }, ...d.messages],
    }))
    toast(`已約 ${news.length} 堂課，並通知家長`)
    onClose()
  }
  return (
    <Modal title="約課" onClose={onClose}>
      <div className="grid g2">
        <label className="field">學生
          <select className="input" value={f.studentId} onChange={(e) => setF({ ...f, studentId: e.target.value })}>
            {db.students.map((s) => <option key={s.id} value={s.id}>{s.name}（剩 {s.lessonsTotal - s.lessonsUsed} 堂）</option>)}
          </select>
        </label>
        <label className="field">教室
          <select className="input" value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })}>
            {ROOMS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label className="field">日期<input className="input" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></label>
        <label className="field">時間<input className="input" type="time" step={1800} value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></label>
        <label className="field">每週重複
          <select className="input" value={f.repeat} onChange={(e) => setF({ ...f, repeat: +e.target.value })}>
            {[1, 4, 8, 12].map((n) => <option key={n} value={n}>{n === 1 ? '不重複' : `連續 ${n} 週`}</option>)}
          </select>
        </label>
      </div>
      <p className="sub">授課老師：{db.teachers.find((t) => t.id === s.teacherId)?.name}</p>
      {dates.some((d) => holiday(d)) && <p className="tag warn">⚠ 包含國定假日：{dates.filter((d) => holiday(d)).map((d) => `${roc(d)} ${holiday(d)}`).join('、')}</p>}
      {f.repeat > left && <p className="tag warn">⚠ 剩餘堂數 {left} 堂，少於排課數 {f.repeat} 堂</p>}
      {conflicts.length > 0 && <div className="tag bad" style={{ whiteSpace: 'normal' }}>衝堂：{conflicts.join('；')}</div>}
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
        <button className="btn secondary" onClick={onClose}>取消</button>
        <button className="btn" disabled={conflicts.length > 0} onClick={save}>確認約課</button>
      </div>
    </Modal>
  )
}
