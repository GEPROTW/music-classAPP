import { useState } from 'react'
import { toast, update, useDB } from '../lib/store'
import { addDays, ntd, roc, today, uid } from '../lib/date'
import type { PayMethod } from '../lib/types'
import { Kpi, PageHead, Seg } from '../components/ui'
import { BarChart } from '../components/charts'

const METHODS: PayMethod[] = ['LINE Pay', '街口支付', '台灣Pay', '信用卡', 'ATM 轉帳', '超商代碼', '現金']
const METHOD_ICON: Record<PayMethod, string> = {
  'LINE Pay': '🟢', 街口支付: '🔴', 台灣Pay: '🔵', 信用卡: '💳', 'ATM 轉帳': '🏦', 超商代碼: '🏪', 現金: '💵',
}

export function Finance() {
  const db = useDB()
  const [range, setRange] = useState<'近 7 天' | '近 30 天'>('近 30 天')
  const from = addDays(today(), range === '近 7 天' ? -6 : -29)
  const orders = db.orders.filter((o) => o.date >= from).sort((a, b) => b.date.localeCompare(a.date))
  const paid = orders.filter((o) => o.status === 'paid')
  const revenue = paid.reduce((s, o) => s + o.amount, 0)
  const pending = orders.filter((o) => o.status === 'pending')
  const byMethod = METHODS.map((m) => ({ label: m, value: paid.filter((o) => o.method === m).reduce((s, o) => s + o.amount, 0) })).filter((x) => x.value > 0)
  const unused = db.students.reduce((s, st) => {
    const c = db.courses.find((c) => c.id === st.courseId)!
    return s + (st.lessonsTotal - st.lessonsUsed) * c.pricePerLesson
  }, 0)

  return (
    <>
      <PageHead title="財務中心" sub="收入、未收款、預收學費與電子發票" right={<Seg value={range} options={['近 7 天', '近 30 天'] as const} onChange={setRange} />} />
      <div className="grid g4">
        <Kpi k="實收金額" v={ntd(revenue)} d={`${paid.length} 筆`} />
        <Kpi k="待收款" v={ntd(pending.reduce((s, o) => s + o.amount, 0))} d={`${pending.length} 筆未付款`} />
        <Kpi k="預收學費（未上堂數）" v={ntd(unused)} d="屬負債，上課後認列收入" />
        <Kpi k="客單價" v={ntd(paid.length ? Math.round(revenue / paid.length) : 0)} />
      </div>
      <div className="grid g2 stack-sm" style={{ marginTop: 14 }}>
        <div className="card">
          <h2>各付款方式實收</h2>
          <BarChart data={byMethod} format={(v) => ntd(v)} />
        </div>
        <div className="card">
          <h2>待收款提醒</h2>
          {pending.length === 0 ? <div className="muted">目前沒有待收款 🎉</div> : pending.map((o) => {
            const s = db.students.find((s) => s.id === o.studentId)!
            return (
              <div key={o.id} className="list-item">
                <div style={{ flex: 1 }}><b>{s.name}</b><div className="muted">{o.item}・{roc(o.date)}</div></div>
                <b>{ntd(o.amount)}</b>
                <button className="btn small green" onClick={() => {
                  update((d) => ({ ...d, orders: d.orders.map((x) => (x.id === o.id ? { ...x, status: 'paid' } : x)) }))
                  toast('已標記收款，電子發票已開立')
                }}>確認收款</button>
              </div>
            )
          })}
        </div>
      </div>
      <div className="card table-wrap" style={{ marginTop: 14 }}>
        <h2>收支明細</h2>
        <table className="t">
          <thead><tr><th>日期</th><th>學生</th><th>項目</th><th>付款方式</th><th>電子發票</th><th className="num">金額</th><th>狀態</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{roc(o.date)}</td>
                <td>{db.students.find((s) => s.id === o.studentId)?.name}</td>
                <td>{o.item}</td>
                <td>{METHOD_ICON[o.method]} {o.method}</td>
                <td>{o.invoice}{o.carrier && <div className="muted">手機載具 {o.carrier}</div>}</td>
                <td className="num">{ntd(o.amount)}</td>
                <td><span className={`tag ${o.status === 'paid' ? 'good' : o.status === 'pending' ? 'warn' : 'bad'}`}>{o.status === 'paid' ? '已收款' : o.status === 'pending' ? '待付款' : '已退款'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function Cashier() {
  const db = useDB()
  const [studentId, setStudentId] = useState(db.students[0].id)
  const s = db.students.find((x) => x.id === studentId)!
  const c = db.courses.find((x) => x.id === s.courseId)!
  const [lessons, setLessons] = useState(c.packLessons)
  const [method, setMethod] = useState<PayMethod>('LINE Pay')
  const [invoiceType, setInvoiceType] = useState<'手機條碼載具' | '會員載具' | '統一編號' | '捐贈'>('手機條碼載具')
  const [carrier, setCarrier] = useState('/ABC1234')
  const [taxId, setTaxId] = useState('')
  const [stage, setStage] = useState<'form' | 'qr'>('form')
  const amount = c.pricePerLesson * lessons
  const carrierOk = invoiceType !== '手機條碼載具' || /^\/[0-9A-Z.+-]{7}$/.test(carrier)
  const taxOk = invoiceType !== '統一編號' || /^\d{8}$/.test(taxId)

  function finish() {
    const inv = `AB-${Math.floor(10000000 + Math.random() * 89999999)}`
    update((d) => ({
      ...d,
      orders: [{ id: uid('o'), date: today(), studentId: s.id, item: `${c.name}｜${lessons} 堂`, amount, method, invoice: inv, carrier: invoiceType === '手機條碼載具' ? carrier : undefined, status: 'paid' }, ...d.orders],
      students: d.students.map((x) => (x.id === s.id ? { ...x, lessonsTotal: x.lessonsTotal + lessons, status: 'active' } : x)),
      messages: [{ id: uid('m'), date: today(), to: s.parent, channel: s.lineBound ? 'LINE' : '簡訊', text: `【繳費成功】已收到 ${ntd(amount)}（${method}），電子發票 ${inv}。` }, ...d.messages],
    }))
    toast(`收款成功 ${ntd(amount)}，發票 ${inv}`)
    setStage('form')
  }

  return (
    <>
      <PageHead title="收銀台" sub="一碼支援台灣主流支付，收款自動開立電子發票並入帳" />
      <div className="grid g2 stack-sm">
        <div className="card col">
          <label className="field">學生
            <select className="input" value={studentId} onChange={(e) => { setStudentId(e.target.value); setStage('form') }}>
              {db.students.map((x) => <option key={x.id} value={x.id}>{x.name}｜{db.courses.find((c) => c.id === x.courseId)?.name}</option>)}
            </select>
          </label>
          <label className="field">購買堂數
            <input className="input" type="number" min={1} value={lessons} onChange={(e) => setLessons(Math.max(1, +e.target.value))} />
          </label>
          <div className="field">付款方式
            <div className="row wrap" style={{ gap: 6 }}>
              {METHODS.map((m) => (
                <button key={m} className={`chip ${m === method ? 'active' : ''}`} onClick={() => setMethod(m)}>{METHOD_ICON[m]} {m}</button>
              ))}
            </div>
          </div>
          <div className="field">電子發票
            <Seg value={invoiceType} options={['手機條碼載具', '會員載具', '統一編號', '捐贈'] as const} onChange={setInvoiceType} />
            {invoiceType === '手機條碼載具' && <input className="input" value={carrier} onChange={(e) => setCarrier(e.target.value.toUpperCase())} placeholder="/ABC1234" />}
            {invoiceType === '統一編號' && <input className="input" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="8 碼統一編號" />}
            {invoiceType === '捐贈' && <div className="muted">捐贈碼：8585（財團法人台灣兒童暨家庭扶助基金會）</div>}
          </div>
        </div>
        <div className="card col" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className="sub">{s.name}・{c.name} × {lessons} 堂</div>
          <div style={{ fontSize: 40, fontWeight: 900 }}>{ntd(amount)}</div>
          {stage === 'form' ? (
            <button className="btn" style={{ padding: '12px 32px', fontSize: 16 }} disabled={!carrierOk || !taxOk} onClick={() => setStage(method === '現金' ? 'form' : 'qr')}>
              {method === '現金' ? '請使用下方確認' : `產生 ${method} 付款碼`}
            </button>
          ) : (
            <>
              <FakeQR seed={s.id + amount + method} />
              <div className="muted">請家長以 {method} 掃描付款（示範）</div>
            </>
          )}
          {(stage === 'qr' || method === '現金') && (
            <button className="btn green" disabled={!carrierOk || !taxOk} onClick={finish}>✓ 已收到款項，開立發票</button>
          )}
          {(!carrierOk || !taxOk) && <div className="tag bad">載具或統編格式不正確</div>}
        </div>
      </div>
    </>
  )
}

function FakeQR({ seed }: { seed: string }) {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21, y = Math.floor(i / 21)
    const finder = (a: number, b: number) => x >= a && x < a + 7 && y >= b && y < b + 7
    if (finder(0, 0) || finder(14, 0) || finder(0, 14)) {
      const lx = x % 14 % 7, ly = y % 14 % 7
      return lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4)
    }
    h = (h * 1103515245 + 12345) >>> 0
    return (h >> 16) % 2 === 0
  })
  return (
    <svg viewBox="-1 -1 23 23" width={180} height={180} style={{ background: '#fff', borderRadius: 12 }} aria-label="付款 QR Code（示範）">
      {cells.map((on, i) => on && <rect key={i} x={i % 21} y={Math.floor(i / 21)} width={1} height={1} fill="#111" />)}
    </svg>
  )
}
