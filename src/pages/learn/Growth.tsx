import { useState } from 'react'
import { toast, update, useDB } from '../../lib/store'
import { WEEKDAYS, addDays, roc, today } from '../../lib/date'
import { Kpi, PageHead, Seg } from '../../components/ui'

function useMe() {
  const db = useDB()
  return db.students.find((s) => s.id === db.currentStudentId) ?? db.students[0]
}

export function Growth() {
  const db = useDB()
  const s = useMe()
  const c = db.courses.find((x) => x.id === s.courseId)!
  const works = db.works.filter((w) => w.studentId === s.id)
  const done = db.lessons.filter((l) => l.studentIds.includes(s.id) && l.status === 'done').sort((a, b) => b.date.localeCompare(a.date))
  const minutes = db.checkins.reduce((sum, x) => sum + x.minutes, 0)
  const milestones = [
    { date: s.joinedAt, text: `加入${db.schoolName}，開始學習${c.name}`, ico: '🎉' },
    ...(done.length >= 5 ? [{ date: done[Math.min(4, done.length - 1)].date, text: '完成第 5 堂課', ico: '🏅' }] : []),
    ...works.map((w) => ({ date: w.date, text: `上傳作品〈${w.title}〉${w.teacherScore ? `，老師評分 ${w.teacherScore}` : ''}`, ico: w.emoji })),
  ].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <>
      <PageHead title="成長檔案" sub={`${s.name}・${c.name}`} />
      <div className="grid g4">
        <Kpi k="累計上課" v={`${done.length} 堂`} />
        <Kpi k="練習時數" v={`${(minutes / 60).toFixed(1)} 小時`} />
        <Kpi k="作品" v={works.length} />
        <Kpi k="積分" v={`⭐ ${s.points}`} />
      </div>
      <div className="grid g2 stack-sm" style={{ marginTop: 14 }}>
        <div className="card">
          <h2>成長時間軸</h2>
          {milestones.map((m, i) => (
            <div key={i} className="list-item">
              <span style={{ fontSize: 24 }}>{m.ico}</span>
              <div><div>{m.text}</div><div className="muted">{roc(m.date)}</div></div>
            </div>
          ))}
        </div>
        <div className="card">
          <h2>證書與檢定</h2>
          {[
            ['🏅', 'YAMAHA 音樂檢定 13 級', '通過'],
            ['🎖️', '樂動期末成果發表會', '演出證書'],
            ['📜', 'ABRSM Grade 1 Theory', '準備中'],
          ].map(([i, n, st]) => (
            <div key={n} className="list-item"><span style={{ fontSize: 24 }}>{i}</span><div style={{ flex: 1 }}>{n}</div><span className={`tag ${st === '準備中' ? 'warn' : 'good'}`}>{st}</span></div>
          ))}
        </div>
      </div>
    </>
  )
}

export function Cloud() {
  const [folder, setFolder] = useState<'課堂錄影' | '講義樂譜' | '練習錄音' | '學校相簿'>('課堂錄影')
  const files: Record<typeof folder, [string, string, string][]> = {
    課堂錄影: [['🎬', '09/24 鋼琴課 重點回放.mp4', '128 MB'], ['🎬', '09/17 鋼琴課 重點回放.mp4', '116 MB'], ['🎬', '09/10 視奏示範.mp4', '64 MB']],
    講義樂譜: [['📄', '拜爾 No.60–70.pdf', '3.2 MB'], ['📄', 'YAMAHA 13 級和聲題庫.pdf', '1.1 MB'], ['📄', '音階指法表.pdf', '0.4 MB']],
    練習錄音: [['🎧', '小奏鳴曲 慢速版.m4a', '4.8 MB'], ['🎧', '〈望春風〉伴奏.mp3', '3.6 MB']],
    學校相簿: [['🖼️', '2026 夏季成果發表會', '86 張'], ['🖼️', '暑假檢定衝刺營', '42 張']],
  }
  return (
    <>
      <PageHead title="雲端空間" sub="已使用 2.3 GB／50 GB" />
      <div style={{ marginBottom: 12 }}><Seg value={folder} options={['課堂錄影', '講義樂譜', '練習錄音', '學校相簿'] as const} onChange={setFolder} /></div>
      <div className="card">
        {files[folder].map(([i, n, size]) => (
          <div key={n} className="list-item">
            <span style={{ fontSize: 26 }}>{i}</span>
            <div style={{ flex: 1 }}>{n}</div>
            <span className="muted">{size}</span>
            <button className="btn small secondary" onClick={() => toast('示範版：檔案下載功能需串接雲端儲存')}>開啟</button>
          </div>
        ))}
      </div>
    </>
  )
}

export function Checkin() {
  const db = useDB()
  const t = today()
  const [minutes, setMinutes] = useState(30)
  const [item, setItem] = useState('樂曲練習')
  const done = new Set(db.checkins.map((c) => c.date))
  const checkedToday = done.has(t)
  let streak = 0
  for (let d = checkedToday ? t : addDays(t, -1); done.has(d); d = addDays(d, -1)) streak++
  const monthStart = t.slice(0, 8) + '01'
  const first = new Date(monthStart + 'T00:00:00').getDay()
  const daysInMonth = new Date(+t.slice(0, 4), +t.slice(5, 7), 0).getDate()

  function checkin() {
    const bonus = 10 + (streak + 1 >= 7 ? 20 : 0)
    update((d) => ({
      ...d,
      checkins: [{ date: t, minutes, item }, ...d.checkins],
      students: d.students.map((s) => (s.id === d.currentStudentId ? { ...s, points: s.points + bonus } : s)),
      pet: { ...d.pet, exp: d.pet.exp + minutes, mood: Math.min(100, d.pet.mood + 15) },
    }))
    toast(`打卡成功！+${bonus} 積分，寵物經驗 +${minutes}`)
  }

  return (
    <>
      <PageHead title="練琴打卡" sub={`已連續練習 ${streak} 天 🔥`} />
      <div className="grid g2 stack-sm">
        <div className="card">
          <h2>{+t.slice(5, 7)} 月打卡紀錄</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, textAlign: 'center' }}>
            {WEEKDAYS.map((w) => <div key={w} className="muted">{w}</div>)}
            {Array.from({ length: first }, (_, i) => <div key={'e' + i} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = monthStart.slice(0, 8) + String(i + 1).padStart(2, '0')
              const on = done.has(d)
              return (
                <div key={d} style={{ aspectRatio: '1', borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 13, background: on ? 'var(--green)' : 'var(--card-soft)', color: on ? '#fff' : d === t ? 'var(--brand)' : 'var(--ink-2)', fontWeight: d === t ? 900 : 400, border: d === t ? '2px solid var(--brand)' : '1px solid var(--line)' }}>
                  {on ? '✓' : i + 1}
                </div>
              )
            })}
          </div>
        </div>
        <div className="card col">
          <h2>今日打卡</h2>
          {checkedToday ? (
            <div className="center"><div className="big-emoji">🎉</div><p>今天已經打卡囉，明天見！</p></div>
          ) : (
            <>
              <label className="field">練習項目
                <select className="input" value={item} onChange={(e) => setItem(e.target.value)}>
                  {['樂曲練習', '音階練習', '哈農', '視唱練耳', '樂理練習', '爵士鼓基本打點'].map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
              <label className="field">練習時間：{minutes} 分鐘
                <input type="range" min={5} max={120} step={5} value={minutes} onChange={(e) => setMinutes(+e.target.value)} />
              </label>
              <button className="btn" onClick={checkin}>✅ 打卡</button>
              <div className="muted">每日打卡 +10 積分，連續 7 天再 +20！</div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
