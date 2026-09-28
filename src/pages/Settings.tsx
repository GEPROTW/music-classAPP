import { useState } from 'react'
import { resetDB, toast, update, useDB } from '../lib/store'
import { roc, today, uid } from '../lib/date'
import { Empty, PageHead, Seg } from '../components/ui'

export function Messages() {
  const db = useDB()
  const [to, setTo] = useState<'全部家長' | '指定班級'>('全部家長')
  const [classId, setClassId] = useState(db.classes[0]?.id ?? '')
  const [text, setText] = useState('')
  const templates = [
    `【${db.schoolName}】中秋連假教室公休，課程將順延，請家長留意。`,
    `【${db.schoolName}】颱風停班停課依各縣市政府公告，當日課程改期或改線上課，補課時間另行通知。`,
    `【${db.schoolName}】期末成果發表會報名開始囉！歡迎家長一起來聽孩子演出 🎹`,
  ]
  function send() {
    const target = to === '全部家長' ? '全部家長' : db.classes.find((c) => c.id === classId)?.name + ' 家長'
    update((d) => ({ ...d, messages: [{ id: uid('m'), date: today(), to: target, channel: 'LINE', text }, ...d.messages] }))
    setText('')
    toast('已透過 LINE 官方帳號群發')
  }
  return (
    <>
      <PageHead title="訊息・家長通知" sub="透過 LINE 官方帳號（Messaging API）推播，未綁定者改發簡訊" />
      {db.role !== 'student' && (
        <div className="card col">
          <div className="row wrap">
            <Seg value={to} options={['全部家長', '指定班級'] as const} onChange={setTo} />
            {to === '指定班級' && (
              <select className="input" style={{ width: 200 }} value={classId} onChange={(e) => setClassId(e.target.value)}>
                {db.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
          <textarea className="input" rows={3} placeholder="輸入要推播給家長的內容…" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="row wrap" style={{ gap: 6 }}>
            {templates.map((t) => <button key={t} className="tag" style={{ cursor: 'pointer' }} onClick={() => setText(t)}>{t.slice(t.indexOf('】') + 1, t.indexOf('】') + 13)}…</button>)}
          </div>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn line" disabled={!text.trim()} onClick={send}>LINE 群發</button>
          </div>
        </div>
      )}
      <div className="card" style={{ marginTop: 14 }}>
        <h2>發送紀錄</h2>
        {db.messages.length === 0 ? <Empty text="尚無訊息。點名消課、約課、續費提醒都會自動產生通知。" /> : db.messages.slice(0, 50).map((m) => (
          <div key={m.id} className="list-item" style={{ alignItems: 'flex-start' }}>
            <span className={`tag ${m.channel === 'LINE' ? 'line' : ''}`}>{m.channel}</span>
            <div style={{ flex: 1 }}>
              <div>{m.text}</div>
              <div className="muted">→ {m.to}・{roc(m.date)}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export function Settings() {
  const db = useDB()
  const [name, setName] = useState(db.schoolName)
  const [license, setLicense] = useState(db.licenseNo)
  const [theme, setTheme] = useState<'跟隨系統' | '淺色' | '深色'>(() => {
    const v = document.documentElement.dataset.theme
    return v === 'light' ? '淺色' : v === 'dark' ? '深色' : '跟隨系統'
  })
  function applyTheme(v: typeof theme) {
    setTheme(v)
    if (v === '跟隨系統') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = v === '淺色' ? 'light' : 'dark'
    try {
      localStorage.setItem('yuedong-theme', document.documentElement.dataset.theme ?? '')
    } catch {
      /* ignore */
    }
  }
  return (
    <>
      <PageHead title="設定" />
      <div className="grid g2 stack-sm">
        <div className="card col">
          <h2>補習班資料</h2>
          <label className="field">機構名稱<input className="input" value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="field">立案字號<input className="input" value={license} onChange={(e) => setLicense(e.target.value)} /></label>
          <button className="btn" style={{ alignSelf: 'flex-end' }} onClick={() => { update((d) => ({ ...d, schoolName: name, licenseNo: license })); toast('已儲存') }}>儲存</button>
        </div>
        <div className="card col">
          <h2>外觀與身分</h2>
          <div className="field">主題<Seg value={theme} options={['跟隨系統', '淺色', '深色'] as const} onChange={applyTheme} /></div>
          <div className="field">目前身分
            <Seg
              value={db.role === 'admin' ? '校長' : db.role === 'teacher' ? '老師' : '學生／家長'}
              options={['校長', '老師', '學生／家長'] as const}
              onChange={(v) => update((d) => ({ ...d, role: v === '校長' ? 'admin' : v === '老師' ? 'teacher' : 'student' }))}
            />
          </div>
        </div>
        <div className="card col">
          <h2>串接服務（台灣在地）</h2>
          {[
            ['💚', 'LINE 官方帳號', '上課／續費／繳費通知推播、LIFF 家長端', true],
            ['🟢', 'LINE Pay', '線上收款', true],
            ['🔴', '街口支付', '線上收款', true],
            ['🧾', '電子發票加值中心', '收款自動開立、手機條碼載具', true],
            ['💳', '綠界／藍新金流', '信用卡、ATM 虛擬帳號、超商代碼', false],
            ['📍', 'Google 商家', '同步評論與地圖詢問名單', false],
          ].map(([ico, n, d, on]) => (
            <div key={n as string} className="list-item">
              <span style={{ fontSize: 22 }}>{ico}</span>
              <div style={{ flex: 1 }}><b>{n}</b><div className="muted">{d}</div></div>
              <span className={`tag ${on ? 'good' : ''}`}>{on ? '已串接' : '未串接'}</span>
            </div>
          ))}
        </div>
        <div className="card col">
          <h2>多端平台</h2>
          <div className="muted">同一套資料，支援教學、學習、溝通三大場景：</div>
          {[['📱', 'iOS／Android App', '學生練習、家長查堂數'], ['💻', 'Windows／Mac 教室端', '上課投影互動課件'], ['🖥️', 'Web 管理後台', '校長與櫃台行政'], ['💚', 'LINE LIFF 家長端', '免下載，在 LINE 裡約課、繳費']].map(([i, n, d]) => (
            <div key={n} className="row"><span style={{ fontSize: 22 }}>{i}</span><div><b>{n}</b> <span className="muted">{d}</span></div></div>
          ))}
          <hr style={{ border: 0, borderTop: '1px solid var(--line)', width: '100%' }} />
          <button className="btn secondary" onClick={() => { if (confirm('確定要清除所有變更，還原為示範資料？')) { resetDB(); toast('已還原示範資料') } }}>還原示範資料</button>
        </div>
      </div>
    </>
  )
}
