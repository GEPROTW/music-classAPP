import { useState } from 'react'
import { toast, update, useDB } from '../../lib/store'
import { addDays, ntd, roc, today, uid } from '../../lib/date'
import type { Campaign, Course } from '../../lib/types'
import { Modal, PageHead, Seg } from '../../components/ui'

function shareToLine(text: string) {
  const url = `https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(text)}`
  window.open(url, '_blank', 'noopener')
}

const TYPES: Campaign['type'][] = ['揪團優惠', '早鳥限定', '體驗課', '推薦有禮', '營隊']

export function Enroll() {
  const db = useDB()
  const [type, setType] = useState<'全部' | Campaign['type']>('全部')
  const [creating, setCreating] = useState(false)
  const [f, setF] = useState({ title: '', type: '揪團優惠' as Campaign['type'], price: 1990, original: 3000, groupSize: 3, days: 14 })
  const list = db.campaigns.filter((c) => type === '全部' || c.type === type)
  return (
    <>
      <PageHead title="招生工具" sub={`Hi～${db.schoolName}，累計發布活動 ${db.campaigns.length} 個`} right={<button className="btn" onClick={() => setCreating(true)}>＋ 建立活動</button>} />
      <div style={{ marginBottom: 12 }}><Seg value={type} options={['全部', ...TYPES] as const} onChange={setType} /></div>
      <div className="grid auto-l">
        {list.map((c) => {
          const left = Math.ceil((new Date(c.deadline).getTime() - new Date(today()).getTime()) / 86400000)
          return (
            <div key={c.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: c.color, color: '#fff', padding: 18, minHeight: 110 }}>
                <div style={{ fontSize: 40 }}>{c.cover}</div>
                <b style={{ fontSize: 18 }}>{c.title}</b>
              </div>
              <div style={{ padding: 14 }} className="col">
                <div className="row between">
                  <span className="tag">{c.type}{c.groupSize ? `・${c.groupSize} 人成團` : ''}</span>
                  <span className="muted">剩 {left} 天</span>
                </div>
                {c.price > 0 ? (
                  <div><b style={{ fontSize: 22, color: 'var(--bad)' }}>{ntd(c.price)}</b> <s className="muted">{ntd(c.original)}</s></div>
                ) : <b style={{ fontSize: 18, color: 'var(--good)' }}>推薦成功雙方各得 2 堂</b>}
                <div className="muted">已報名 {c.joined} 人</div>
                <div className="row">
                  <button className="btn small line" onClick={() => shareToLine(`【${db.schoolName}】${c.title}${c.price ? ` 特價 ${ntd(c.price)}` : ''}，${roc(c.deadline)} 截止，快揪朋友一起報名！`)}>分享到 LINE</button>
                  <button className="btn small secondary" onClick={() => {
                    update((d) => ({ ...d, campaigns: d.campaigns.map((x) => (x.id === c.id ? { ...x, joined: x.joined + 1 } : x)), leads: [{ id: uid('l'), name: '活動報名者', parent: '家長', phone: '09xx-xxx-xxx', source: '招生活動', interest: c.title, stage: 'new', nextFollow: today(), note: `報名「${c.title}」`, owner: '櫃台' }, ...d.leads] }))
                    toast('模擬一筆報名，已自動加入潛在學生名單')
                  }}>模擬報名</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {creating && (
        <Modal title="建立招生活動" onClose={() => setCreating(false)}>
          <div className="grid g2">
            <label className="field" style={{ gridColumn: '1 / -1' }}>活動名稱<input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="例：暑假烏克麗麗速成班" /></label>
            <label className="field">類型
              <select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as Campaign['type'] })}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="field">活動天數<input className="input" type="number" value={f.days} onChange={(e) => setF({ ...f, days: +e.target.value })} /></label>
            <label className="field">活動價<input className="input" type="number" value={f.price} onChange={(e) => setF({ ...f, price: +e.target.value })} /></label>
            <label className="field">原價<input className="input" type="number" value={f.original} onChange={(e) => setF({ ...f, original: +e.target.value })} /></label>
            {f.type === '揪團優惠' && <label className="field">成團人數<input className="input" type="number" min={2} value={f.groupSize} onChange={(e) => setF({ ...f, groupSize: +e.target.value })} /></label>}
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
            <button className="btn" disabled={!f.title.trim()} onClick={() => {
              const palette = ['#7fb2ff', '#ffb35c', '#ff7f7f', '#c78bff', '#43cea2']
              update((d) => ({ ...d, campaigns: [{ id: uid('p'), title: f.title.trim(), type: f.type, price: f.price, original: f.original, groupSize: f.type === '揪團優惠' ? f.groupSize : undefined, joined: 0, deadline: addDays(today(), f.days), cover: '🎵', color: palette[d.campaigns.length % palette.length] }, ...d.campaigns] }))
              setCreating(false)
              toast('活動已上架')
            }}>上架</button>
          </div>
        </Modal>
      )}
    </>
  )
}

export function Contests() {
  const db = useDB()
  const t = today()
  return (
    <>
      <PageHead title="賽事活動" sub="線上報名、收費、評審與公布成績" />
      <div className="col">
        {db.contests.map((c) => {
          const status = t < c.signupStart ? ['即將開放', 'warn'] : t <= c.signupEnd ? ['報名中', 'good'] : ['已截止', 'bad']
          return (
            <div key={c.id} className="card row wrap" style={{ padding: 0, overflow: 'hidden', alignItems: 'stretch' }}>
              <div style={{ background: c.color, width: 140, minHeight: 110, display: 'grid', placeItems: 'center', fontSize: 52 }}>{c.cover}</div>
              <div style={{ flex: 1, padding: 14, minWidth: 200 }} className="col">
                <b style={{ fontSize: 17 }}>{c.title}</b>
                <div className="muted">主辦：{c.organizer}</div>
                <div className="muted">報名期間：{roc(c.signupStart)} – {roc(c.signupEnd)}・報名費 {c.fee ? ntd(c.fee) : '免費'}</div>
                <div className="row wrap">
                  <span className={`tag ${status[1]}`}>{status[0]}</span>
                  <span className="tag">🔥 {c.applicants} 人報名</span>
                  <div className="spacer" />
                  <button className="btn small" disabled={status[0] !== '報名中'} onClick={() => {
                    update((d) => ({ ...d, contests: d.contests.map((x) => (x.id === c.id ? { ...x, applicants: x.applicants + 1 } : x)) }))
                    toast(c.fee ? `已報名，請以 LINE Pay 繳交 ${ntd(c.fee)}` : '報名成功')
                  }}>幫學生報名</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export function Shop() {
  const db = useDB()
  const [cat, setCat] = useState<'全部' | '樂器' | '教材' | '周邊' | '課程'>('全部')
  const [q, setQ] = useState('')
  const list = db.products.filter((p) => (cat === '全部' || p.category === cat) && p.name.includes(q))
  const commission = db.products.reduce((s, p) => s + p.sold * p.commission, 0)
  return (
    <>
      <PageHead title="推薦商城" sub={`累計分潤 ${ntd(commission)}`} />
      <div className="card" style={{ background: 'linear-gradient(135deg,#ffd23d,#ff8a5c)', color: '#2a2233', marginBottom: 14 }}>
        <b style={{ fontSize: 22 }}>🧧 開學季・樂器教材特惠</b>
        <div>家長透過老師的推薦連結購買，老師與機構皆可獲得分潤</div>
      </div>
      <div className="row wrap" style={{ marginBottom: 12 }}>
        <input className="input" style={{ maxWidth: 240 }} placeholder="搜尋商品" value={q} onChange={(e) => setQ(e.target.value)} />
        <Seg value={cat} options={['全部', '樂器', '教材', '周邊', '課程'] as const} onChange={setCat} />
      </div>
      <div className="card">
        {list.map((p) => (
          <div key={p.id} className="list-item" style={{ flexWrap: 'wrap' }}>
            <div className="emoji-box" style={{ background: 'var(--card-soft)', width: 64, height: 64, fontSize: 34 }}>{p.emoji}</div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <b>{p.name}</b>
              <div className="muted">售價 {ntd(p.price)}・已售 {p.sold}</div>
              <div style={{ color: 'var(--bad)', fontWeight: 700 }}>{ntd(p.commission)} 分潤可賺</div>
            </div>
            <button className="btn small line" onClick={() => shareToLine(`老師推薦：${p.name} ${ntd(p.price)}（${db.schoolName}學生專屬）`)}>LINE 推薦</button>
            <button className="btn small" onClick={() => {
              update((d) => ({ ...d, products: d.products.map((x) => (x.id === p.id ? { ...x, sold: x.sold + 1 } : x)) }))
              toast(`模擬售出 1 件，分潤 +${ntd(p.commission)}`)
            }}>模擬售出</button>
          </div>
        ))}
      </div>
    </>
  )
}

export function Catalog() {
  const db = useDB()
  const [open, setOpen] = useState<Course | null>(null)
  const groups = [...new Set(db.courses.map((c) => c.category))]
  return (
    <>
      <PageHead title="全年齡段音樂課程" sub="鋼琴、爵士鼓、聲樂、音樂啟蒙、國樂、檢定班等全齡課程" />
      {groups.map((g) => (
        <div key={g}>
          <div className="section-title">🎤 {g}</div>
          <div className="grid auto">
            {db.courses.filter((c) => c.category === g).map((c) => (
              <button key={c.id} className="tile" style={{ border: 0 }} onClick={() => setOpen(c)}>
                <div className="art" style={{ background: c.color, minHeight: 110 }}>{c.cover}</div>
                <div className="label">{c.name}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
      {open && (
        <Modal title={open.name} onClose={() => setOpen(null)}>
          <div className="big-emoji center">{open.cover}</div>
          <p>{open.desc}</p>
          <div className="grid g3">
            <div><div className="muted">適合年齡</div><b>{open.age}</b></div>
            <div><div className="muted">每堂</div><b>{open.minutes} 分鐘</b></div>
            <div><div className="muted">課程包</div><b>{ntd(open.pricePerLesson * open.packLessons)}／{open.packLessons} 堂</b></div>
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
            <button className="btn line" onClick={() => shareToLine(`${db.schoolName}｜${open.name}（${open.age}）免費體驗課開放預約！`)}>分享到 LINE</button>
            <button className="btn" onClick={() => {
              update((d) => ({ ...d, leads: [{ id: uid('l'), name: '線上預約', parent: '家長', phone: '09xx-xxx-xxx', source: 'LINE 官方帳號', interest: open.name, stage: 'trial', nextFollow: today(), note: '從課程型錄預約體驗課', owner: '櫃台' }, ...d.leads] }))
              setOpen(null)
              toast('已預約體驗課，櫃台將以 LINE 聯繫')
            }}>預約免費體驗</button>
          </div>
        </Modal>
      )}
    </>
  )
}
