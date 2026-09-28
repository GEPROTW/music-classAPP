import { useState } from 'react'
import { useDB } from '../lib/store'
import { addDays, ntd, today } from '../lib/date'
import { Kpi, PageHead, Seg } from '../components/ui'
import { BarChart, LineChart } from '../components/charts'

const TABS = ['教務', '教學', '學習', '招生', '財務'] as const

export default function DataCenter() {
  const db = useDB()
  const [tab, setTab] = useState<(typeof TABS)[number]>('教務')
  const t = today()
  const days = Array.from({ length: 14 }, (_, i) => addDays(t, i - 13))
  const label = (d: string) => d.slice(5).replace('-', '/')
  const done = db.lessons.filter((l) => l.status === 'done')

  return (
    <>
      <PageHead title="數據中心" sub="系統自動彙整教務、教學、學習、招生、財務數據（近 14 天）" />
      <div style={{ marginBottom: 14 }}><Seg value={tab} options={TABS} onChange={setTab} /></div>

      {tab === '教務' && (
        <>
          <div className="grid g4">
            <Kpi k="學生總數" v={db.students.length} />
            <Kpi k="在學學生" v={db.students.filter((s) => s.status === 'active').length} />
            <Kpi k="體驗中" v={db.students.filter((s) => s.status === 'trial').length} />
            <Kpi k="LINE 綁定率" v={`${Math.round((db.students.filter((s) => s.lineBound).length / db.students.length) * 100)}%`} d="綁定後可自動推播上課通知" />
          </div>
          <div className="card" style={{ marginTop: 14 }}>
            <h2>每日消課堂數</h2>
            <LineChart data={days.map((d) => ({ label: label(d), value: done.filter((l) => l.date === d).length }))} unit=" 堂" />
          </div>
        </>
      )}

      {tab === '教學' && (
        <>
          <div className="grid g4">
            <Kpi k="已上課堂數" v={done.filter((l) => l.date >= days[0]).length} />
            <Kpi k="請假" v={db.lessons.filter((l) => l.status === 'leave' && l.date >= days[0]).length} />
            <Kpi k="作品點評" v={db.works.filter((w) => w.teacherScore).length} />
            <Kpi k="平均點評分" v={Math.round(db.works.filter((w) => w.teacherScore).reduce((s, w) => s + (w.teacherScore ?? 0), 0) / Math.max(1, db.works.filter((w) => w.teacherScore).length))} />
          </div>
          <div className="card table-wrap" style={{ marginTop: 14 }}>
            <h2>老師授課排行（近 14 天）</h2>
            <table className="t">
              <thead><tr><th>老師</th><th className="num">授課堂數</th><th className="num">學生數</th></tr></thead>
              <tbody>
                {db.teachers
                  .map((te) => ({ te, n: done.filter((l) => l.teacherId === te.id && l.date >= days[0]).length }))
                  .sort((a, b) => b.n - a.n)
                  .map(({ te, n }) => (
                    <tr key={te.id}><td>{te.emoji} {te.name}</td><td className="num">{n}</td><td className="num">{db.students.filter((s) => s.teacherId === te.id).length}</td></tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === '學習' && (
        <>
          <div className="grid g4">
            <Kpi k="練琴打卡天數" v={db.checkins.length} d="示範學生：近 14 天" />
            <Kpi k="累計練習分鐘" v={db.checkins.reduce((s, c) => s + c.minutes, 0)} />
            <Kpi k="作品上傳" v={db.works.length} />
            <Kpi k="積分總發放" v={db.students.reduce((s, x) => s + x.points, 0).toLocaleString()} />
          </div>
          <div className="card" style={{ marginTop: 14 }}>
            <h2>每日練習分鐘</h2>
            <BarChart data={days.map((d) => ({ label: label(d), value: db.checkins.find((c) => c.date === d)?.minutes ?? 0 }))} unit=" 分鐘" />
          </div>
        </>
      )}

      {tab === '招生' && (
        <>
          <div className="grid g4">
            <Kpi k="潛在名單" v={db.leads.length} />
            <Kpi k="已約體驗" v={db.leads.filter((l) => l.stage === 'trial').length} />
            <Kpi k="已報名" v={db.leads.filter((l) => l.stage === 'won').length} />
            <Kpi k="活動報名人次" v={db.campaigns.reduce((s, c) => s + c.joined, 0)} />
          </div>
          <div className="card table-wrap" style={{ marginTop: 14 }}>
            <h2>名單來源</h2>
            <table className="t">
              <thead><tr><th>來源</th><th className="num">名單數</th><th className="num">成交</th></tr></thead>
              <tbody>
                {[...new Set(db.leads.map((l) => l.source))].map((s) => (
                  <tr key={s}><td>{s}</td><td className="num">{db.leads.filter((l) => l.source === s).length}</td><td className="num">{db.leads.filter((l) => l.source === s && l.stage === 'won').length}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === '財務' && (
        <>
          {(() => {
            const paid = db.orders.filter((o) => o.status === 'paid' && o.date >= days[0])
            const total = paid.reduce((s, o) => s + o.amount, 0)
            return (
              <div className="grid g4">
                <Kpi k="訂單收款" v={ntd(total)} />
                <Kpi k="訂單數" v={paid.length} />
                <Kpi k="退款" v={ntd(0)} />
                <Kpi k="日均營收" v={ntd(Math.round(total / 14))} />
              </div>
            )
          })()}
          <div className="card" style={{ marginTop: 14 }}>
            <h2>每日營收</h2>
            <LineChart
              data={days.map((d) => ({ label: label(d), value: db.orders.filter((o) => o.date === d && o.status === 'paid').reduce((s, o) => s + o.amount, 0) }))}
              format={ntd}
            />
          </div>
        </>
      )}
    </>
  )
}
