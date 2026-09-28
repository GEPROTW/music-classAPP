import { useState } from 'react'
import { toast, update, useDB } from '../../lib/store'
import { roc, today, uid } from '../../lib/date'
import { Modal, PageHead, Progress } from '../../components/ui'

export function Works() {
  const db = useDB()
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<string | null>(null)
  const me = db.students.find((s) => s.id === db.currentStudentId) ?? db.students[0]
  const canScore = db.role !== 'student'
  const works = [...db.works].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <PageHead title="作品秀場" sub="上傳演奏影片，老師點評、同學按讚" right={<button className="btn" onClick={() => setAdding(true)}>＋ 上傳作品</button>} />
      <div className="grid auto-l">
        {works.map((w) => {
          const s = db.students.find((x) => x.id === w.studentId)
          return (
            <div key={w.id} className="card">
              <div className="emoji-box" style={{ width: '100%', height: 140, fontSize: 64, background: 'linear-gradient(135deg,#ffe0ec,#e0e8ff)' }}>{w.emoji}</div>
              <b style={{ display: 'block', marginTop: 10 }}>{w.title}</b>
              <div className="muted">{s?.name}・{w.instrument}・{roc(w.date)}</div>
              <div className="row between" style={{ marginTop: 10 }}>
                <button className="btn small secondary" onClick={() => update((d) => ({ ...d, works: d.works.map((x) => (x.id === w.id ? { ...x, likes: x.likes + 1 } : x)) }))}>❤️ {w.likes}</button>
                {w.teacherScore ? <span className="tag good">老師評分 {w.teacherScore}</span> : canScore ? (
                  <button className="btn small" onClick={() => {
                    update((d) => ({ ...d, works: d.works.map((x) => (x.id === w.id ? { ...x, teacherScore: 90 } : x)), students: d.students.map((x) => (x.id === w.studentId ? { ...x, points: x.points + 20 } : x)) }))
                    toast('已點評 90 分，學生獲得 20 積分')
                  }}>給予點評</button>
                ) : <span className="tag warn">等待老師點評</span>}
              </div>
            </div>
          )
        })}
      </div>
      {adding && (
        <Modal title="上傳作品" onClose={() => setAdding(false)}>
          <div className="col">
            <label className="field">作品名稱<input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例：〈小幸運〉鋼琴版" /></label>
            <label className="field">影片或錄音檔<input type="file" accept="video/*,audio/*" onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)} /></label>
            <p className="muted">示範版僅記錄檔名；正式版會上傳至雲端空間。作品是否公開由家長決定。</p>
            <button className="btn" disabled={!title.trim()} onClick={() => {
              const c = db.courses.find((c) => c.id === me.courseId)!
              update((d) => ({ ...d, works: [{ id: uid('w'), studentId: me.id, title: title.trim(), instrument: c.category, date: today(), likes: 0, emoji: c.cover }, ...d.works] }))
              toast(file ? `已上傳 ${file}` : '已發布作品')
              setAdding(false)
              setTitle('')
            }}>發布</button>
          </div>
        </Modal>
      )}
    </>
  )
}

export function Points() {
  const db = useDB()
  const me = db.students.find((s) => s.id === db.currentStudentId) ?? db.students[0]
  function redeem(id: string) {
    const r = db.rewards.find((x) => x.id === id)!
    if (me.points < r.cost || r.stock <= 0) return
    update((d) => ({
      ...d,
      students: d.students.map((s) => (s.id === me.id ? { ...s, points: s.points - r.cost } : s)),
      rewards: d.rewards.map((x) => (x.id === id ? { ...x, stock: x.stock - 1 } : x)),
      redeemed: [{ id: uid('x'), rewardId: id, date: today() }, ...d.redeemed],
      pet: id === 'r5' ? { ...d.pet, kind: '🐻' } : d.pet,
    }))
    toast(`兌換成功：${r.name}，請至櫃台領取`)
  }
  return (
    <>
      <PageHead title="積分兌換" sub={`${me.name} 目前有 ⭐ ${me.points} 積分`} />
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="muted">怎麼賺積分？上課出席 +10・練琴打卡 +10・視唱答對 +2・樂理全對 +30・作品被點評 +20</div>
      </div>
      <div className="grid auto">
        {db.rewards.map((r) => (
          <div key={r.id} className="card center">
            <div style={{ fontSize: 48 }}>{r.emoji}</div>
            <b>{r.name}</b>
            <div className="muted">剩 {r.stock} 份</div>
            <button className="btn small" style={{ marginTop: 8 }} disabled={me.points < r.cost || r.stock <= 0} onClick={() => redeem(r.id)}>⭐ {r.cost} 兌換</button>
          </div>
        ))}
      </div>
      {db.redeemed.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <h2>兌換紀錄</h2>
          {db.redeemed.map((x) => {
            const r = db.rewards.find((r) => r.id === x.rewardId)
            return <div key={x.id} className="list-item">{r?.emoji} {r?.name}<div className="spacer" /><span className="muted">{roc(x.date)}</span></div>
          })}
        </div>
      )}
    </>
  )
}

export function PetPage() {
  const db = useDB()
  const pet = db.pet
  const me = db.students.find((s) => s.id === db.currentStudentId) ?? db.students[0]
  const [bounce, setBounce] = useState(false)
  const FOODS = [
    { name: '音符餅乾', ico: '🍪', cost: 10, hunger: 15, exp: 5 },
    { name: '鳳梨酥', ico: '🍍', cost: 20, hunger: 30, exp: 12 },
    { name: '珍珠奶茶', ico: '🧋', cost: 30, hunger: 40, exp: 20 },
  ]
  function feed(f: (typeof FOODS)[number]) {
    if (me.points < f.cost) return toast('積分不足，去練琴打卡賺積分吧！')
    update((d) => {
      let exp = d.pet.exp + f.exp
      let level = d.pet.level
      while (exp >= 100) { exp -= 100; level++ }
      return {
        ...d,
        students: d.students.map((s) => (s.id === me.id ? { ...s, points: s.points - f.cost } : s)),
        pet: { ...d.pet, hunger: Math.min(100, d.pet.hunger + f.hunger), mood: Math.min(100, d.pet.mood + 10), exp, level, lastFed: today() },
      }
    })
    setBounce(true)
    setTimeout(() => setBounce(false), 400)
    toast(`${pet.name}吃了${f.name}，好開心！`)
  }
  return (
    <>
      <PageHead title="音樂寵物" sub="練琴得積分，餵寵物一起長大" />
      <div className="grid g2 stack-sm">
        <div className="card center col" style={{ alignItems: 'center', background: 'linear-gradient(180deg,#e0f5ff,#eaffea)', color: '#2a2233' }}>
          <div className="big-emoji" style={{ fontSize: 120, transform: bounce ? 'translateY(-16px) scale(1.08)' : 'none', transition: 'transform 0.2s' }}>{pet.kind}</div>
          <h2 style={{ margin: 0 }}>{pet.name}　Lv.{pet.level}</h2>
          <div style={{ width: '100%', maxWidth: 280 }} className="col">
            <div className="row between"><span>經驗值</span><span>{pet.exp}/100</span></div>
            <Progress value={pet.exp / 100} color="var(--purple)" />
            <div className="row between"><span>飽足度</span><span>{pet.hunger}</span></div>
            <Progress value={pet.hunger / 100} color="var(--green)" />
            <div className="row between"><span>心情</span><span>{pet.mood}</span></div>
            <Progress value={pet.mood / 100} color="var(--orange)" />
          </div>
        </div>
        <div className="card">
          <h2>餵食（你有 ⭐ {me.points}）</h2>
          {FOODS.map((f) => (
            <div key={f.name} className="list-item">
              <span style={{ fontSize: 32 }}>{f.ico}</span>
              <div style={{ flex: 1 }}><b>{f.name}</b><div className="muted">飽足 +{f.hunger}・經驗 +{f.exp}</div></div>
              <button className="btn small" disabled={pet.hunger >= 100} onClick={() => feed(f)}>⭐ {f.cost}</button>
            </div>
          ))}
          <p className="muted">上次餵食：{roc(pet.lastFed)}。在積分兌換可解鎖「台灣黑熊」造型！</p>
        </div>
      </div>
    </>
  )
}
