import { useState } from 'react'
import { toast, update, useDB } from '../lib/store'
import { addDays, roc, today, uid } from '../lib/date'
import type { Course, Lesson, Message } from '../lib/types'
import { Empty, Modal, PageHead, Seg } from '../components/ui'

const CATS = ['全部', '鋼琴', '檢定', '幼兒啟蒙', '爵士鼓', '聲樂', '吉他／烏克麗麗', '弦樂', '國樂'] as const

export function CourseAdmin() {
  const db = useDB()
  const [cat, setCat] = useState<(typeof CATS)[number]>('全部')
  const [edit, setEdit] = useState<Course | null>(null)
  const list = db.courses.filter((c) => cat === '全部' || c.category === cat)
  return (
    <>
      <PageHead title="課程管理" sub="全年齡段課程：鋼琴、爵士鼓、聲樂、幼兒啟蒙、檢定班" />
      <div style={{ marginBottom: 12 }}><Seg value={cat} options={CATS} onChange={setCat} /></div>
      <div className="grid auto">
        {list.map((c) => (
          <button key={c.id} className="tile" style={{ border: 0, textAlign: 'left' }} onClick={() => setEdit(c)}>
            <div className="art" style={{ background: c.color, minHeight: 100 }}>{c.cover}</div>
            <div className="label" style={{ textAlign: 'left' }}>
              {c.name}
              <div className="muted" style={{ fontWeight: 400 }}>{c.age}・{c.minutes} 分鐘・NT${c.pricePerLesson}/堂</div>
            </div>
          </button>
        ))}
      </div>
      {edit && (
        <Modal title={`編輯：${edit.name}`} onClose={() => setEdit(null)}>
          <p className="sub">{edit.desc}</p>
          <div className="grid g2">
            <label className="field">每堂價格（NT$）<input className="input" type="number" value={edit.pricePerLesson} onChange={(e) => setEdit({ ...edit, pricePerLesson: +e.target.value })} /></label>
            <label className="field">課程包堂數<input className="input" type="number" value={edit.packLessons} onChange={(e) => setEdit({ ...edit, packLessons: +e.target.value })} /></label>
            <label className="field">每堂分鐘<input className="input" type="number" value={edit.minutes} onChange={(e) => setEdit({ ...edit, minutes: +e.target.value })} /></label>
            <label className="field">適合年齡<input className="input" value={edit.age} onChange={(e) => setEdit({ ...edit, age: e.target.value })} /></label>
          </div>
          <p className="muted">課程包總價：NT${(edit.pricePerLesson * edit.packLessons).toLocaleString()}（含稅）</p>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => {
              update((d) => ({ ...d, courses: d.courses.map((c) => (c.id === edit.id ? edit : c)) }))
              setEdit(null)
              toast('課程已更新')
            }}>儲存</button>
          </div>
        </Modal>
      )}
    </>
  )
}

/** 點名消課：標記上課會扣除學生堂數並以 LINE 通知家長 */
export function Lessons() {
  const db = useDB()
  const [day, setDay] = useState(today())
  const list = db.lessons.filter((l) => l.date === day).sort((a, b) => a.time.localeCompare(b.time))

  function mark(l: Lesson, status: Lesson['status']) {
    const c = db.courses.find((c) => c.id === l.courseId)!
    update((d) => {
      const prev = d.lessons.find((x) => x.id === l.id)!.status
      const used = (st: Lesson['status']) => (st === 'done' || st === 'absent' ? 1 : 0) // 無故缺席照常扣堂
      const delta = used(status) - used(prev)
      const msgs: Message[] = status === 'done' && prev !== 'done'
        ? l.studentIds.map((sid) => {
            const s = d.students.find((x) => x.id === sid)!
            return { id: uid('m'), date: day, to: s.parent, channel: s.lineBound ? 'LINE' : '簡訊', text: `【上課通知】${s.name}已於 ${roc(day)} ${l.time} 完成${c.name}，剩餘 ${s.lessonsTotal - s.lessonsUsed - 1} 堂。` }
          })
        : []
      return {
        ...d,
        lessons: d.lessons.map((x) => (x.id === l.id ? { ...x, status } : x)),
        students: d.students.map((s) => (l.studentIds.includes(s.id) ? { ...s, lessonsUsed: s.lessonsUsed + delta, points: s.points + (status === 'done' && prev !== 'done' ? 10 : 0) } : s)),
        messages: [...msgs, ...d.messages],
      }
    })
    toast(status === 'done' ? '已消課，並以 LINE 通知家長' : status === 'leave' ? '已登記請假，不扣堂數' : status === 'absent' ? '已登記缺席（依規定扣 1 堂）' : '已更新')
  }

  return (
    <>
      <PageHead title="堂數點名" sub="點名後自動扣堂、加積分、推播家長" />
      <div className="row wrap" style={{ marginBottom: 12 }}>
        <button className="btn secondary small" onClick={() => setDay(addDays(day, -1))}>‹ 前一天</button>
        <input className="input" type="date" style={{ width: 170 }} value={day} onChange={(e) => setDay(e.target.value)} />
        <button className="btn secondary small" onClick={() => setDay(addDays(day, 1))}>後一天 ›</button>
        <b>{roc(day, true)}</b>
      </div>
      <div className="card">
        {list.length === 0 ? <Empty text="這天沒有課程" /> : list.map((l) => {
          const c = db.courses.find((c) => c.id === l.courseId)!
          const t = db.teachers.find((t) => t.id === l.teacherId)!
          const names = l.studentIds.map((id) => db.students.find((s) => s.id === id)?.name).filter(Boolean).join('、')
          return (
            <div key={l.id} className="list-item" style={{ flexWrap: 'wrap' }}>
              <div className="emoji-box" style={{ background: c.color }}>{c.cover}</div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <b>{l.time}　{c.name}</b>
                <div className="muted">{t.name}・{l.room}・{names || '（無學生）'}</div>
              </div>
              <Seg
                value={l.status === 'done' ? '已上課' : l.status === 'leave' ? '請假' : l.status === 'absent' ? '缺席' : '未點名'}
                options={['未點名', '已上課', '請假', '缺席'] as const}
                onChange={(v) => mark(l, v === '已上課' ? 'done' : v === '請假' ? 'leave' : v === '缺席' ? 'absent' : 'scheduled')}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}
