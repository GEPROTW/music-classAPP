import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast, update, useDB } from '../lib/store'
import { addDays, ntd, roc, today, uid } from '../lib/date'
import type { Lead, Message } from '../lib/types'
import { Empty, Modal, PageHead } from '../components/ui'

const STAGES: { key: Lead['stage']; label: string; color: string }[] = [
  { key: 'new', label: '新名單', color: '#3d8bff' },
  { key: 'contacted', label: '已聯繫', color: '#9b7bff' },
  { key: 'trial', label: '已約體驗', color: '#ffa53d' },
  { key: 'won', label: '已報名', color: '#2fbf8a' },
  { key: 'lost', label: '暫不考慮', color: '#9c94a6' },
]
const SOURCES: Lead['source'][] = ['LINE 官方帳號', 'Facebook', 'Instagram', 'Google 地圖', '朋友介紹', '路過詢問', '招生活動']

export function Leads() {
  const db = useDB()
  const t = today()
  const [open, setOpen] = useState<Lead | null>(null)
  const [adding, setAdding] = useState(false)
  const due = db.leads.filter((l) => l.nextFollow <= t && l.stage !== 'won' && l.stage !== 'lost')
  const bySource = SOURCES.map((s) => ({ s, n: db.leads.filter((l) => l.source === s).length })).filter((x) => x.n)
  const conv = db.leads.length ? Math.round((db.leads.filter((l) => l.stage === 'won').length / db.leads.length) * 100) : 0

  return (
    <>
      <PageHead title="潛在學生・跟進管理" sub={`今日待跟進 ${due.length} 位・轉換率 ${conv}%`} right={<button className="btn" onClick={() => setAdding(true)}>＋ 新增名單</button>} />
      <div className="row wrap" style={{ marginBottom: 12, gap: 6 }}>
        {bySource.map((x) => <span key={x.s} className="tag">{x.s}：{x.n}</span>)}
      </div>
      <div className="table-wrap">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(200px, 1fr))', gap: 12 }}>
          {STAGES.map((st) => (
            <div key={st.key} className="card" style={{ padding: 10, background: 'var(--card-soft)' }}>
              <div className="row between" style={{ marginBottom: 8 }}>
                <b style={{ borderLeft: `4px solid ${st.color}`, paddingLeft: 8 }}>{st.label}</b>
                <span className="muted">{db.leads.filter((l) => l.stage === st.key).length}</span>
              </div>
              <div className="col" style={{ gap: 8 }}>
                {db.leads.filter((l) => l.stage === st.key).map((l) => (
                  <button key={l.id} className="card" style={{ border: 0, textAlign: 'left', padding: 10 }} onClick={() => setOpen(l)}>
                    <div className="row between"><b>{l.name}</b>{l.nextFollow <= t && st.key !== 'won' && st.key !== 'lost' && <span className="tag bad">待跟進</span>}</div>
                    <div className="muted">{l.interest}・{l.source}</div>
                    <div className="muted">{l.note}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {open && <LeadModal lead={open} onClose={() => setOpen(null)} />}
      {adding && <AddLead onClose={() => setAdding(false)} />}
    </>
  )
}

function LeadModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [l, setL] = useState(lead)
  function save(patch: Partial<Lead> = {}) {
    const next = { ...l, ...patch }
    update((d) => ({ ...d, leads: d.leads.map((x) => (x.id === next.id ? next : x)) }))
    toast('已更新跟進紀錄')
    onClose()
  }
  return (
    <Modal title={`${l.name}（${l.parent}）`} onClose={onClose}>
      <div className="sub">{l.phone}・來源：{l.source}・負責：{l.owner}</div>
      <div className="row wrap" style={{ margin: '12px 0', gap: 6 }}>
        {STAGES.map((s) => (
          <button key={s.key} className={`chip ${l.stage === s.key ? 'active' : ''}`} onClick={() => setL({ ...l, stage: s.key })}>{s.label}</button>
        ))}
      </div>
      <label className="field">下次跟進日<input className="input" type="date" value={l.nextFollow} onChange={(e) => setL({ ...l, nextFollow: e.target.value })} /></label>
      <label className="field" style={{ marginTop: 10 }}>備註<textarea className="input" rows={3} value={l.note} onChange={(e) => setL({ ...l, note: e.target.value })} /></label>
      <div className="row wrap" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
        <a className="btn secondary" href={`tel:${l.phone.replace(/-/g, '')}`}>📞 撥打</a>
        <button className="btn line" onClick={() => save({ stage: l.stage === 'new' ? 'contacted' : l.stage, nextFollow: addDays(today(), 3) })}>LINE 已傳訊，3 天後再跟</button>
        <button className="btn" onClick={() => save()}>儲存</button>
      </div>
    </Modal>
  )
}

function AddLead({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState<Lead>({ id: uid('l'), name: '', parent: '', phone: '', source: 'LINE 官方帳號', interest: '鋼琴', stage: 'new', nextFollow: today(), note: '', owner: '櫃台' })
  return (
    <Modal title="新增潛在學生" onClose={onClose}>
      <div className="grid g2">
        <label className="field">學生姓名<input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="field">家長<input className="input" value={f.parent} onChange={(e) => setF({ ...f, parent: e.target.value })} /></label>
        <label className="field">手機<input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
        <label className="field">有興趣課程<input className="input" value={f.interest} onChange={(e) => setF({ ...f, interest: e.target.value })} /></label>
        <label className="field">來源
          <select className="input" value={f.source} onChange={(e) => setF({ ...f, source: e.target.value as Lead['source'] })}>
            {SOURCES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
        <button className="btn" disabled={!f.name.trim()} onClick={() => { update((d) => ({ ...d, leads: [f, ...d.leads] })); toast('已加入名單'); onClose() }}>加入</button>
      </div>
    </Modal>
  )
}

export function Renewal() {
  const db = useDB()
  const list = db.students
    .filter((s) => s.status === 'active' && s.lessonsTotal - s.lessonsUsed <= 2)
    .sort((a, b) => a.lessonsTotal - a.lessonsUsed - (b.lessonsTotal - b.lessonsUsed))
  const sentToday = new Set(db.messages.filter((m) => m.date === today() && m.text.startsWith('【續費提醒】')).map((m) => m.to))

  function remind(ids: string[]) {
    const msgs: Message[] = ids.map((id) => {
      const s = db.students.find((x) => x.id === id)!
      const c = db.courses.find((x) => x.id === s.courseId)!
      return { id: uid('m'), date: today(), to: s.parent, channel: s.lineBound ? 'LINE' : '簡訊', text: `【續費提醒】${s.name}的${c.name}剩餘 ${s.lessonsTotal - s.lessonsUsed} 堂，續報 ${c.packLessons} 堂 ${ntd(c.pricePerLesson * c.packLessons)}，可直接點此以 LINE Pay 付款。` }
    })
    update((d) => ({ ...d, messages: [...msgs, ...d.messages] }))
    toast(`已發送 ${msgs.length} 則續費提醒`)
  }

  return (
    <>
      <PageHead title="續費提醒" sub="剩餘 2 堂以下的在學學生" right={list.length > 0 && <button className="btn line" onClick={() => remind(list.map((s) => s.id))}>一鍵 LINE 提醒全部</button>} />
      <div className="card">
        {list.length === 0 ? <Empty text="目前沒有需要續費的學生" /> : list.map((s) => {
          const c = db.courses.find((x) => x.id === s.courseId)!
          const left = s.lessonsTotal - s.lessonsUsed
          return (
            <div key={s.id} className="list-item" style={{ flexWrap: 'wrap' }}>
              <div className="emoji-box" style={{ background: c.color }}>{c.cover}</div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <Link to={`/students/${s.id}`}><b>{s.name}</b></Link>
                <div className="muted">{c.name}・{s.parent} {s.phone}</div>
              </div>
              <span className={`tag ${left <= 0 ? 'bad' : 'warn'}`}>{left <= 0 ? '⛔ 堂數用完' : `⚠ 剩 ${left} 堂`}</span>
              {sentToday.has(s.parent) ? <span className="tag good">今日已提醒（{roc(today())}）</span> : (
                <button className="btn small line" onClick={() => remind([s.id])}>LINE 提醒</button>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
