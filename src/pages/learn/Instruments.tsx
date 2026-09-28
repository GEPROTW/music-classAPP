import { useEffect, useRef, useState } from 'react'
import { NOTE_NAMES, SOLFEGE, click, playDrum, playNote, type Drum } from '../../lib/audio'
import { toast, update } from '../../lib/store'
import { Kpi, PageHead, Seg } from '../../components/ui'

const KEYMAP = 'awsedftgyhujkolp;'.split('') // 電腦鍵盤對應 C4 起的半音
const WHITE = [0, 2, 4, 5, 7, 9, 11]

function Piano() {
  const [on, setOn] = useState<Set<number>>(new Set())
  const start = 60
  const octaves = 2
  const notes = Array.from({ length: octaves * 12 + 1 }, (_, i) => start + i)
  const whites = notes.filter((n) => WHITE.includes(n % 12))

  function press(n: number) {
    playNote(n)
    setOn((s) => new Set(s).add(n))
    setTimeout(() => setOn((s) => { const x = new Set(s); x.delete(n); return x }), 180)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.target instanceof HTMLInputElement) return
      const i = KEYMAP.indexOf(e.key.toLowerCase())
      if (i >= 0) press(start + i)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const ww = 100 / whites.length
  return (
    <div className="card">
      <div className="piano">
        {whites.map((n) => (
          <div key={n} className={`w ${on.has(n) ? 'on' : ''}`} onPointerDown={() => press(n)}>
            {SOLFEGE[n % 12]}
          </div>
        ))}
        {notes.filter((n) => !WHITE.includes(n % 12)).map((n) => {
          const wi = whites.filter((w) => w < n).length
          return (
            <div key={n} className={`b ${on.has(n) ? 'on' : ''}`} style={{ left: `calc(${wi * ww}% - ${ww * 0.3}%)`, width: `${ww * 0.6}%` }} onPointerDown={(e) => { e.stopPropagation(); press(n) }} />
          )
        })}
      </div>
      <p className="muted">可用電腦鍵盤 A W S E D F T G Y H U J K 彈奏（C4 起）。</p>
    </div>
  )
}

const PADS: { kind: Drum; label: string; key: string; color: string }[] = [
  { kind: 'crash', label: '銅鈸', key: 'u', color: '#e0a800' },
  { kind: 'tom1', label: '高音筒鼓', key: 'i', color: '#ff7f50' },
  { kind: 'tom2', label: '落地筒鼓', key: 'o', color: '#c7508b' },
  { kind: 'hihat', label: '腳踏鈸', key: 'j', color: '#d4a017' },
  { kind: 'snare', label: '小鼓', key: 'k', color: '#3d8bff' },
  { kind: 'kick', label: '大鼓', key: 'l', color: '#7b61c9' },
]

function Drums() {
  const [hit, setHit] = useState<Drum | null>(null)
  function strike(k: Drum) {
    playDrum(k)
    setHit(k)
    setTimeout(() => setHit(null), 100)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const p = PADS.find((p) => p.key === e.key.toLowerCase())
      if (p) strike(p.kind)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return (
    <div className="card">
      <div className="grid g3" style={{ maxWidth: 520, margin: '0 auto' }}>
        {PADS.map((p) => (
          <button key={p.kind} className={`drum-pad ${hit === p.kind ? 'hit' : ''}`} style={{ background: p.color }} onPointerDown={() => strike(p.kind)}>
            {p.label}<br /><span style={{ opacity: 0.7, fontSize: 12 }}>{p.key.toUpperCase()}</span>
          </button>
        ))}
      </div>
      <p className="muted center">電腦鍵盤 U I O / J K L 對應鼓組。</p>
    </div>
  )
}

export function Instruments() {
  const [tab, setTab] = useState<'鋼琴' | '爵士鼓'>('鋼琴')
  return (
    <>
      <PageHead title="樂器模擬器" right={<Seg value={tab} options={['鋼琴', '爵士鼓'] as const} onChange={setTab} />} />
      {tab === '鋼琴' ? <Piano /> : <Drums />}
    </>
  )
}

/* ---------------- 基本功：節拍器 + 音階 ---------------- */

function useMetronome(bpm: number, beats: number, running: boolean, onBeat?: (i: number) => void) {
  const beatRef = useRef(0)
  const cb = useRef(onBeat)
  cb.current = onBeat
  useEffect(() => {
    if (!running) return
    beatRef.current = 0
    const tick = () => {
      const i = beatRef.current % beats
      click(i === 0)
      cb.current?.(i)
      beatRef.current++
    }
    tick()
    const id = window.setInterval(tick, 60000 / bpm)
    return () => window.clearInterval(id)
  }, [bpm, beats, running])
}

const SCALES: Record<string, number[]> = {
  'C 大調': [60, 62, 64, 65, 67, 69, 71, 72],
  'G 大調': [67, 69, 71, 72, 74, 76, 78, 79],
  'D 大調': [62, 64, 66, 67, 69, 71, 73, 74],
  'F 大調': [65, 67, 69, 70, 72, 74, 76, 77],
  'a 小調（和聲）': [57, 59, 60, 62, 64, 65, 68, 69],
}

export function Basics() {
  const [bpm, setBpm] = useState(80)
  const [beats, setBeats] = useState(4)
  const [running, setRunning] = useState(false)
  const [beat, setBeat] = useState(-1)
  useMetronome(bpm, beats, running, setBeat)

  function playScale(name: string) {
    const seq = SCALES[name]
    const up = [...seq, ...seq.slice(0, -1).reverse()]
    up.forEach((n, i) => playNote(n, 0.5, (i * 60) / bpm))
  }

  return (
    <>
      <PageHead title="基本功" sub="節拍器與音階練習" />
      <div className="grid g2 stack-sm">
        <div className="card col" style={{ alignItems: 'center' }}>
          <h2>節拍器</h2>
          <div style={{ fontSize: 56, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{bpm}<span className="muted"> BPM</span></div>
          <div className="row" style={{ gap: 8 }}>
            {Array.from({ length: beats }, (_, i) => (
              <span key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: running && beat === i ? (i === 0 ? 'var(--brand)' : 'var(--blue)') : 'var(--line)' }} />
            ))}
          </div>
          <input type="range" min={40} max={208} value={bpm} onChange={(e) => setBpm(+e.target.value)} style={{ width: '100%' }} aria-label="速度" />
          <div className="row wrap" style={{ justifyContent: 'center' }}>
            <button className="btn secondary small" onClick={() => setBpm(Math.max(40, bpm - 5))}>−5</button>
            <Seg value={`${beats}/4`} options={['2/4', '3/4', '4/4', '6/4'] as const} onChange={(v) => setBeats(+v[0])} />
            <button className="btn secondary small" onClick={() => setBpm(Math.min(208, bpm + 5))}>+5</button>
          </div>
          <button className="btn" style={{ padding: '12px 40px' }} onClick={() => setRunning(!running)}>{running ? '■ 停止' : '▶ 開始'}</button>
          <div className="muted">{bpm < 66 ? 'Adagio 慢板' : bpm < 108 ? 'Andante／Moderato 行板・中板' : bpm < 168 ? 'Allegro 快板' : 'Presto 急板'}</div>
        </div>
        <div className="card col">
          <h2>音階練習（跟隨節拍器速度）</h2>
          {Object.keys(SCALES).map((k) => (
            <div key={k} className="list-item">
              <b style={{ flex: 1 }}>{k}</b>
              <span className="muted hide-sm">{SCALES[k].map((n) => NOTE_NAMES[n % 12]).join(' ')}</span>
              <button className="btn small" onClick={() => playScale(k)}>▶ 上下行</button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ---------------- AI 節奏陪練：聽節奏、跟著打，計算時間誤差 ---------------- */

const PATTERNS: Record<string, number[]> = {
  '四分音符': [0, 1, 2, 3],
  '八分音符': [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
  '附點節奏': [0, 1.5, 2, 3],
  '切分音': [0, 0.5, 1.5, 2, 3],
}

export function AiPractice() {
  const [pattern, setPattern] = useState<keyof typeof PATTERNS>('四分音符')
  const [bpm, setBpm] = useState(80)
  const [phase, setPhase] = useState<'idle' | 'demo' | 'countin' | 'play' | 'result'>('idle')
  const [result, setResult] = useState<{ score: number; avg: number; hits: number; expected: number } | null>(null)
  const startRef = useRef(0)
  const taps = useRef<number[]>([])
  const beatMs = 60000 / bpm

  function demo() {
    setPhase('demo')
    PATTERNS[pattern].forEach((b) => setTimeout(() => playDrum('snare'), b * beatMs))
    setTimeout(() => setPhase('idle'), 4 * beatMs)
  }

  function start() {
    taps.current = []
    setResult(null)
    setPhase('countin')
    for (let i = 0; i < 4; i++) setTimeout(() => click(i === 0), i * beatMs)
    setTimeout(() => {
      startRef.current = performance.now()
      setPhase('play')
      for (let i = 0; i < 4; i++) setTimeout(() => click(i === 0), i * beatMs)
    }, 4 * beatMs)
    setTimeout(() => score(), 8.6 * beatMs)
  }

  function tap() {
    if (phase !== 'play') return
    playDrum('snare')
    taps.current.push((performance.now() - startRef.current) / beatMs)
  }

  function score() {
    const expected = PATTERNS[pattern]
    const used = new Set<number>()
    const errs: number[] = []
    for (const e of expected) {
      let best = -1
      let bestD = Infinity
      taps.current.forEach((t, i) => {
        const d = Math.abs(t - e)
        if (!used.has(i) && d < bestD) { bestD = d; best = i }
      })
      if (best >= 0 && bestD < 0.5) { used.add(best); errs.push(bestD * beatMs) } else errs.push(beatMs / 2)
    }
    const extra = taps.current.length - used.size
    const avg = errs.reduce((a, b) => a + b, 0) / errs.length
    const s = Math.max(0, Math.round(100 - avg / 3 - extra * 8))
    setResult({ score: s, avg: Math.round(avg), hits: used.size, expected: expected.length })
    setPhase('result')
    if (s >= 80) {
      update((d) => ({ ...d, students: d.students.map((x) => (x.id === d.currentStudentId ? { ...x, points: x.points + 15 } : x)) }))
      toast('節奏很穩！+15 積分')
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); tap() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <>
      <PageHead title="AI 節奏陪練" sub="先聽示範 → 預備 4 拍 → 跟著節奏點擊（或按空白鍵）" />
      <div className="card col" style={{ alignItems: 'center' }}>
        <div className="row wrap" style={{ justifyContent: 'center' }}>
          <Seg value={pattern} options={Object.keys(PATTERNS) as (keyof typeof PATTERNS)[]} onChange={setPattern} />
          <label className="row">速度 <input className="input" type="number" min={50} max={140} value={bpm} onChange={(e) => setBpm(+e.target.value)} style={{ width: 80 }} /></label>
        </div>
        <div className="row" style={{ gap: 6, fontSize: 28 }} aria-label="節奏型">
          {PATTERNS[pattern].map((b, i) => <span key={i} title={`第 ${b + 1} 拍`}>{Number.isInteger(b) ? '♩' : '♪'}</span>)}
        </div>
        <button
          className="drum-pad"
          style={{ width: 200, background: phase === 'play' ? 'var(--brand)' : phase === 'countin' ? 'var(--orange)' : 'var(--blue)' }}
          onPointerDown={tap}
        >
          {phase === 'play' ? '打！' : phase === 'countin' ? '預備…' : phase === 'demo' ? '示範中' : '鼓面'}
        </button>
        <div className="row">
          <button className="btn secondary" disabled={phase === 'play' || phase === 'countin'} onClick={demo}>🔊 聽示範</button>
          <button className="btn" disabled={phase === 'play' || phase === 'countin'} onClick={start}>▶ 開始挑戰</button>
        </div>
      </div>
      {result && (
        <div className="grid g3" style={{ marginTop: 14 }}>
          <Kpi k="AI 評分" v={`${result.score} 分`} d={result.score >= 90 ? '節奏超穩 🎉' : result.score >= 70 ? '不錯，再穩一點' : '放慢速度再試試'} />
          <Kpi k="平均誤差" v={`${result.avg} ms`} d="越小越準" />
          <Kpi k="命中" v={`${result.hits} / ${result.expected}`} />
        </div>
      )}
    </>
  )
}
