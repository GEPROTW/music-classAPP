import { useState } from 'react'
import { SOLFEGE, playNote } from '../../lib/audio'
import { toast, update } from '../../lib/store'
import { Kpi, PageHead, Seg } from '../../components/ui'

const INTERVALS = [
  { name: '大二度', semi: 2 },
  { name: '大三度', semi: 4 },
  { name: '完全四度', semi: 5 },
  { name: '完全五度', semi: 7 },
  { name: '大六度', semi: 9 },
  { name: '完全八度', semi: 12 },
]

function addPoints(n: number) {
  update((d) => ({ ...d, students: d.students.map((s) => (s.id === d.currentStudentId ? { ...s, points: s.points + n } : s)) }))
}

export function EarTraining() {
  const [mode, setMode] = useState<'音程辨識' | '單音辨識'>('音程辨識')
  const [q, setQ] = useState(() => newQ())
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })

  function newQ() {
    const root = 60 + Math.floor(Math.random() * 7)
    const iv = INTERVALS[Math.floor(Math.random() * INTERVALS.length)]
    const note = [60, 62, 64, 65, 67, 69, 71][Math.floor(Math.random() * 7)]
    return { root, iv, note }
  }
  function play() {
    if (mode === '音程辨識') {
      playNote(q.root, 0.9, 0)
      playNote(q.root + q.iv.semi, 0.9, 0.7)
    } else {
      playNote(60, 0.7, 0) // 先給 Do 當參考音
      playNote(q.note, 0.9, 0.9)
    }
  }
  const answer = mode === '音程辨識' ? q.iv.name : SOLFEGE[q.note - 60]
  const options = mode === '音程辨識' ? INTERVALS.map((i) => i.name) : ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si']
  function pick(o: string) {
    if (picked) return
    setPicked(o)
    const ok = o === answer
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }))
    if (ok) addPoints(2)
  }
  function next() {
    setQ(newQ())
    setPicked(null)
  }

  return (
    <>
      <PageHead title="視唱練耳" sub="答對每題 +2 積分" right={<Seg value={mode} options={['音程辨識', '單音辨識'] as const} onChange={(m) => { setMode(m); next() }} />} />
      <div className="grid g3" style={{ marginBottom: 14 }}>
        <Kpi k="答對" v={score.right} />
        <Kpi k="作答" v={score.total} />
        <Kpi k="正確率" v={score.total ? `${Math.round((score.right / score.total) * 100)}%` : '—'} />
      </div>
      <div className="card center col" style={{ alignItems: 'center' }}>
        <div className="big-emoji">👂</div>
        <p className="sub">{mode === '音程辨識' ? '聽兩個音，判斷它們的音程' : '先聽 Do，再聽第二個音是唱名幾？'}</p>
        <button className="btn" style={{ padding: '12px 32px', fontSize: 18 }} onClick={play}>▶ 播放題目</button>
        <div className="row wrap" style={{ justifyContent: 'center', marginTop: 14 }}>
          {options.map((o) => {
            const state = picked ? (o === answer ? 'good' : o === picked ? 'bad' : '') : ''
            return (
              <button key={o} className="btn secondary" style={{ minWidth: 90, borderColor: state ? `var(--${state})` : undefined, borderWidth: 2, color: state ? `var(--${state})` : undefined }} onClick={() => pick(o)}>
                {state === 'good' ? '✓ ' : state === 'bad' ? '✗ ' : ''}{o}
              </button>
            )
          })}
        </div>
        {picked && <button className="btn green" style={{ marginTop: 14 }} onClick={next}>下一題 ›</button>}
      </div>
    </>
  )
}

const QUIZ = [
  { q: '四分音符在 4/4 拍中是幾拍？', opts: ['半拍', '一拍', '兩拍', '四拍'], a: 1, lv: 'YAMAHA 初級' },
  { q: '附點二分音符等於幾拍？', opts: ['兩拍', '兩拍半', '三拍', '四拍'], a: 2, lv: 'YAMAHA 初級' },
  { q: 'C 大調的關係小調是？', opts: ['a 小調', 'e 小調', 'd 小調', 'c 小調'], a: 0, lv: 'ABRSM Grade 2' },
  { q: 'G 大調有幾個升記號？', opts: ['0 個', '1 個', '2 個', '3 個'], a: 1, lv: 'ABRSM Grade 1' },
  { q: 'F 大調的調號是？', opts: ['一個升記號 F#', '一個降記號 B♭', '兩個降記號', '沒有升降'], a: 1, lv: 'ABRSM Grade 1' },
  { q: '「Allegro」是什麼意思？', opts: ['慢板', '中板', '快板', '漸慢'], a: 2, lv: '音樂術語' },
  { q: '「p」（piano）代表？', opts: ['很強', '弱', '漸強', '持續'], a: 1, lv: '音樂術語' },
  { q: 'C 到 G 是什麼音程？', opts: ['大三度', '完全四度', '完全五度', '大六度'], a: 2, lv: 'YAMAHA 中級' },
  { q: 'C 大三和弦的組成音是？', opts: ['C E G', 'C E♭ G', 'C F A', 'C D G'], a: 0, lv: 'YAMAHA 中級' },
  { q: '6/8 拍通常一小節分成幾個大拍？', opts: ['1', '2', '3', '6'], a: 1, lv: 'ABRSM Grade 3' },
  { q: 'D 大調有哪些升記號？', opts: ['F#', 'F# C#', 'F# C# G#', 'B♭ E♭'], a: 1, lv: 'ABRSM Grade 2' },
  { q: '「rit.」表示？', opts: ['漸快', '漸慢', '回原速', '斷奏'], a: 1, lv: '音樂術語' },
]

export function TheoryQuiz() {
  const deal = () => [...QUIZ].sort(() => Math.random() - 0.5).slice(0, 8)
  const [order, setOrder] = useState(deal)
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [right, setRight] = useState(0)
  const done = i >= order.length
  const item = order[i]
  return (
    <>
      <PageHead title="樂理練習題" sub="YAMAHA／ABRSM 常見題型，每回 8 題" />
      <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
        {done ? (
          <div className="center col" style={{ alignItems: 'center' }}>
            <div className="big-emoji">{right >= 6 ? '🏆' : '💪'}</div>
            <h2>答對 {right} / {order.length} 題</h2>
            <p className="sub">{right >= 6 ? '太厲害了！已獲得 30 積分' : '再接再厲，多練幾次就會囉！'}</p>
            <button className="btn" onClick={() => { setOrder(deal()); setI(0); setRight(0) }}>再練一回</button>
          </div>
        ) : (
          <>
            <div className="row between"><span className="tag">{item.lv}</span><span className="muted">第 {i + 1} / {order.length} 題</span></div>
            <h2 style={{ margin: '14px 0' }}>{item.q}</h2>
            <div className="col">
              {item.opts.map((o, k) => {
                const st = picked === null ? '' : k === item.a ? 'good' : k === picked ? 'bad' : ''
                return (
                  <button key={o} className="btn secondary" style={{ textAlign: 'left', borderWidth: 2, borderColor: st ? `var(--${st})` : undefined, color: st ? `var(--${st})` : undefined }} onClick={() => {
                    if (picked !== null) return
                    setPicked(k)
                    if (k === item.a) setRight((r) => r + 1)
                  }}>
                    {String.fromCharCode(65 + k)}. {o} {st === 'good' ? '✓' : st === 'bad' ? '✗' : ''}
                  </button>
                )
              })}
            </div>
            {picked !== null && (
              <button className="btn" style={{ marginTop: 14 }} onClick={() => {
                const last = i + 1 >= order.length
                if (last && right >= 6) { addPoints(30); toast('全回合完成！+30 積分') }
                setI(i + 1)
                setPicked(null)
              }}>{i + 1 >= order.length ? '看結果' : '下一題 ›'}</button>
            )}
          </>
        )}
      </div>
    </>
  )
}
