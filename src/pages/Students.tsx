import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast, update, useDB } from '../lib/store'
import { roc, today, uid } from '../lib/date'
import type { Student } from '../lib/types'
import { Empty, Modal, PageHead, Progress, Seg } from '../components/ui'

const STATUS = { active: ['在學', 'good'], trial: ['體驗中', 'warn'], paused: ['暫停', 'bad'] } as const

export function Students() {
  const db = useDB()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'全部' | '在學' | '體驗中' | '暫停' | '堂數不足'>('全部')
  const [adding, setAdding] = useState(false)
  const list = db.students.filter((s) => {
    if (q && !(s.name + s.parent + s.phone).includes(q)) return false
    if (filter === '全部') return true
    if (filter === '堂數不足') return s.lessonsTotal - s.lessonsUsed <= 2
    return STATUS[s.status][0] === filter
  })
  return (
    <>
      <PageHead title="學生管理" sub={`共 ${db.students.length} 位學生`} right={<button className="btn" onClick={() => setAdding(true)}>＋ 新增學生</button>} />
      <div className="row wrap" style={{ marginBottom: 12 }}>
        <input className="input" style={{ maxWidth: 260 }} placeholder="搜尋姓名、家長、手機" value={q} onChange={(e) => setQ(e.target.value)} />
        <Seg value={filter} options={['全部', '在學', '體驗中', '暫停', '堂數不足'] as const} onChange={setFilter} />
      </div>
      <div className="card table-wrap">
        {list.length === 0 ? (
          <Empty text="找不到符合的學生" />
        ) : (
          <table className="t">
            <thead>
              <tr>
                <th>學生</th><th>課程</th><th>老師</th><th>剩餘堂數</th><th>家長</th><th>LINE</th><th>狀態</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => {
                const c = db.courses.find((c) => c.id === s.courseId)
                const t = db.teachers.find((t) => t.id === s.teacherId)
                const left = s.lessonsTotal - s.lessonsUsed
                return (
                  <tr key={s.id}>
                    <td><Link to={`/students/${s.id}`}><b>{s.name}</b></Link> <span className="muted">{s.age} 歲</span></td>
                    <td>{c?.name}</td>
                    <td>{t?.name}</td>
                    <td className="num" style={{ color: left <= 2 ? 'var(--bad)' : undefined, fontWeight: left <= 2 ? 700 : 400 }}>
                      {left <= 2 && '⚠ '}{left} / {s.lessonsTotal}
                    </td>
                    <td>{s.parent}<div className="muted">{s.phone}</div></td>
                    <td>{s.lineBound ? <span className="tag line">已綁定</span> : <span className="tag">未綁定</span>}</td>
                    <td><span className={`tag ${STATUS[s.status][1]}`}>{STATUS[s.status][0]}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      {adding && <AddStudent onClose={() => setAdding(false)} />}
    </>
  )
}

function AddStudent({ onClose }: { onClose: () => void }) {
  const db = useDB()
  const [f, setF] = useState({ name: '', age: 7, parent: '', phone: '', courseId: db.courses[0].id, teacherId: db.teachers[0].id, lessons: 12, trial: false })
  const valid = f.name.trim() && /^09\d{2}-?\d{3}-?\d{3}$/.test(f.phone)
  function save() {
    const s: Student = {
      id: uid('s'), name: f.name.trim(), age: f.age, parent: f.parent || f.name + '家長', phone: f.phone,
      lineBound: false, courseId: f.courseId, teacherId: f.teacherId, lessonsTotal: f.trial ? 1 : f.lessons, lessonsUsed: 0,
      points: 50, joinedAt: today(), status: f.trial ? 'trial' : 'active',
    }
    update((d) => ({ ...d, students: [s, ...d.students] }))
    toast(`已新增 ${s.name}，並贈送 50 點入學積分`)
    onClose()
  }
  return (
    <Modal title="新增學生" onClose={onClose}>
      <div className="grid g2">
        <label className="field">學生姓名<input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="field">年齡<input className="input" type="number" min={1} value={f.age} onChange={(e) => setF({ ...f, age: +e.target.value })} /></label>
        <label className="field">家長稱呼<input className="input" placeholder="例：王媽媽" value={f.parent} onChange={(e) => setF({ ...f, parent: e.target.value })} /></label>
        <label className="field">家長手機<input className="input" placeholder="0912-345-678" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
        <label className="field">報名課程
          <select className="input" value={f.courseId} onChange={(e) => setF({ ...f, courseId: e.target.value })}>
            {db.courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="field">授課老師
          <select className="input" value={f.teacherId} onChange={(e) => setF({ ...f, teacherId: e.target.value })}>
            {db.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <label className="field">購買堂數<input className="input" type="number" min={1} value={f.lessons} disabled={f.trial} onChange={(e) => setF({ ...f, lessons: +e.target.value })} /></label>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
          <input type="checkbox" checked={f.trial} onChange={(e) => setF({ ...f, trial: e.target.checked })} /> 僅報名體驗課
        </label>
      </div>
      <p className="muted">依《個人資料保護法》，蒐集之資料僅用於課務聯繫與教學紀錄。</p>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button className="btn secondary" onClick={onClose}>取消</button>
        <button className="btn" disabled={!valid} onClick={save}>儲存</button>
      </div>
    </Modal>
  )
}

export function StudentDetail() {
  const { id } = useParams()
  const db = useDB()
  const s = db.students.find((s) => s.id === id)
  const [buy, setBuy] = useState(false)
  if (!s) return <><PageHead title="找不到學生" /><Empty text="此學生不存在" /></>
  const c = db.courses.find((c) => c.id === s.courseId)!
  const t = db.teachers.find((t) => t.id === s.teacherId)!
  const history = db.lessons.filter((l) => l.studentIds.includes(s.id) && l.status !== 'scheduled').sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)
  const upcoming = db.lessons.filter((l) => l.studentIds.includes(s.id) && l.status === 'scheduled').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4)
  const orders = db.orders.filter((o) => o.studentId === s.id)
  const left = s.lessonsTotal - s.lessonsUsed

  function patch(p: Partial<Student>) {
    update((d) => ({ ...d, students: d.students.map((x) => (x.id === s!.id ? { ...x, ...p } : x)) }))
  }
  function notifyParent() {
    const text = `【${db.schoolName}】${s!.parent}您好，${s!.name}的${c.name}目前剩餘 ${left} 堂，如需續報請與櫃台聯繫，謝謝！`
    update((d) => ({ ...d, messages: [{ id: uid('m'), date: today(), to: s!.parent, channel: s!.lineBound ? 'LINE' : '簡訊', text }, ...d.messages] }))
    toast(s!.lineBound ? '已透過 LINE 官方帳號推播給家長' : '家長尚未綁定 LINE，已改用簡訊發送')
  }

  return (
    <>
      <PageHead title={s.name} sub={`${s.age} 歲・${c.name}・${t.name}老師`} right={<span className={`tag ${STATUS[s.status][1]}`}>{STATUS[s.status][0]}</span>} />
      <div className="grid g3 stack-sm">
        <div className="card">
          <h3>剩餘堂數</h3>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{left} <span className="muted">/ {s.lessonsTotal} 堂</span></div>
          <Progress value={s.lessonsUsed / s.lessonsTotal} color={left <= 2 ? 'var(--bad)' : undefined} />
          <div className="row wrap" style={{ marginTop: 12 }}>
            <button className="btn small" onClick={() => setBuy(true)}>續報堂數</button>
            <button className="btn small line" onClick={notifyParent}>通知家長</button>
          </div>
        </div>
        <div className="card">
          <h3>家長資訊</h3>
          <div>{s.parent}</div>
          <div className="muted">{s.phone}</div>
          <div style={{ marginTop: 8 }}>
            {s.lineBound ? <span className="tag line">LINE 已綁定</span> : (
              <button className="btn small line" onClick={() => { patch({ lineBound: true }); toast('已產生 LINE 綁定 QR Code，家長掃描後完成綁定') }}>產生 LINE 綁定碼</button>
            )}
          </div>
          <div className="muted" style={{ marginTop: 8 }}>入學日：{roc(s.joinedAt)}</div>
        </div>
        <div className="card">
          <h3>學習積分</h3>
          <div style={{ fontSize: 32, fontWeight: 900 }}>⭐ {s.points}</div>
          <div className="row wrap" style={{ marginTop: 12 }}>
            {[10, 30, 50].map((n) => (
              <button key={n} className="btn small secondary" onClick={() => { patch({ points: s.points + n }); toast(`已加 ${n} 點`) }}>+{n}</button>
            ))}
          </div>
          <div className="row wrap" style={{ marginTop: 8 }}>
            <Seg value={STATUS[s.status][0]} options={['在學', '體驗中', '暫停'] as const} onChange={(v) => patch({ status: v === '在學' ? 'active' : v === '體驗中' ? 'trial' : 'paused' })} />
          </div>
        </div>
      </div>
      <div className="grid g2 stack-sm" style={{ marginTop: 14 }}>
        <div className="card">
          <h2>即將上課</h2>
          {upcoming.length === 0 ? <Empty text="尚無排課" /> : upcoming.map((l) => (
            <div key={l.id} className="list-item"><b>{roc(l.date, true)} {l.time}</b><span className="muted">{l.room}</span></div>
          ))}
          <h2 style={{ marginTop: 16 }}>上課紀錄</h2>
          {history.map((l) => (
            <div key={l.id} className="list-item">
              <span>{roc(l.date, true)} {l.time}</span>
              <div className="spacer" />
              <span className={`tag ${l.status === 'done' ? 'good' : 'warn'}`}>{l.status === 'done' ? '已上課' : l.status === 'leave' ? '請假' : '缺席'}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h2>繳費紀錄</h2>
          {orders.length === 0 ? <Empty text="近 30 天無繳費紀錄" /> : orders.map((o) => (
            <div key={o.id} className="list-item">
              <div style={{ flex: 1 }}>
                <b>{o.item}</b>
                <div className="muted">{roc(o.date)}・{o.method}・發票 {o.invoice}</div>
              </div>
              <b>NT${o.amount.toLocaleString()}</b>
            </div>
          ))}
        </div>
      </div>
      {buy && (
        <Modal title="續報堂數" onClose={() => setBuy(false)}>
          <p>{c.name}：每堂 NT${c.pricePerLesson.toLocaleString()}</p>
          <div className="grid g3">
            {[c.packLessons, c.packLessons * 2, c.packLessons * 4].map((n) => {
              const off = n === c.packLessons ? 1 : n === c.packLessons * 2 ? 0.95 : 0.9
              const amount = Math.round(c.pricePerLesson * n * off)
              return (
                <button key={n} className="card" style={{ border: '1px solid var(--line)' }} onClick={() => {
                  update((d) => ({
                    ...d,
                    students: d.students.map((x) => (x.id === s.id ? { ...x, lessonsTotal: x.lessonsTotal + n, status: 'active' } : x)),
                    orders: [{ id: uid('o'), date: today(), studentId: s.id, item: `${c.name}｜${n} 堂`, amount, method: 'LINE Pay', invoice: `AB-${Math.floor(10000000 + Math.random() * 89999999)}`, status: 'paid' }, ...d.orders],
                  }))
                  setBuy(false)
                  toast(`已續報 ${n} 堂，電子發票已開立`)
                }}>
                  <b>{n} 堂</b>
                  <div>NT${amount.toLocaleString()}</div>
                  {off < 1 && <div className="tag good">{off * 100 === 95 ? '95 折' : '9 折'}</div>}
                </button>
              )
            })}
          </div>
        </Modal>
      )}
    </>
  )
}
