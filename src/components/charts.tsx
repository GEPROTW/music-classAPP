import { useLayoutEffect, useRef, useState } from 'react'

interface Point {
  label: string
  value: number
}

const H = 220
const PAD = { l: 44, r: 12, t: 12, b: 26 }

/** 以容器實際寬度繪圖，文字不會隨螢幕放大 */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(600)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

function niceMax(v: number) {
  if (v <= 0) return 1
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p
}

function fmt(v: number) {
  return v >= 10000 ? `${Math.round(v / 1000)}k` : v.toLocaleString('zh-TW')
}

/** 單一序列折線圖：2px 線、十字準線 + tooltip */
export function LineChart({ data, unit = '', format = fmt }: { data: Point[]; unit?: string; format?: (v: number) => string }) {
  const [hover, setHover] = useState<number | null>(null)
  const [ref, W] = useWidth()
  const max = niceMax(Math.max(...data.map((d) => d.value)))
  const iw = W - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  const x = (i: number) => PAD.l + (data.length <= 1 ? iw / 2 : (i / (data.length - 1)) * iw)
  const y = (v: number) => PAD.t + ih - (v / max) * ih
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.value)}`).join(' ')
  const ticks = [0, 0.5, 1].map((f) => f * max)
  const step = Math.ceil(data.length / 6)

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    const i = Math.round(((px - PAD.l) / iw) * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, i)))
  }

  return (
    <div className="chart" ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label="折線圖">
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid-line" x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} />
            <text className="axis-text" x={PAD.l - 6} y={y(t) + 4} textAnchor="end">{fmt(t)}</text>
          </g>
        ))}
        {data.map((d, i) =>
          i % step === 0 ? (
            <text key={i} className="axis-text" x={x(i)} y={H - 6} textAnchor="middle">{d.label}</text>
          ) : null,
        )}
        <path d={`${path} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill="var(--series-1)" opacity={0.08} />
        <path d={path} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + ih} stroke="var(--ink-3)" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r={5} fill="var(--series-1)" stroke="var(--card)" strokeWidth={2} />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div className="chart-tip" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(data[hover].value) / H) * 100}%` }}>
          {data[hover].label}：<b>{format(data[hover].value)}</b>{unit}
        </div>
      )}
    </div>
  )
}

/** 單一序列長條圖：圓角頂端、2px 間隔、hover tooltip */
export function BarChart({ data, unit = '', format = fmt }: { data: Point[]; unit?: string; format?: (v: number) => string }) {
  const [hover, setHover] = useState<number | null>(null)
  const [ref, W] = useWidth()
  const max = niceMax(Math.max(...data.map((d) => d.value)))
  const iw = W - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  const bw = iw / data.length
  const y = (v: number) => PAD.t + ih - (v / max) * ih
  const ticks = [0, 0.5, 1].map((f) => f * max)
  return (
    <div className="chart" ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="長條圖" onPointerLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid-line" x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} />
            <text className="axis-text" x={PAD.l - 6} y={y(t) + 4} textAnchor="end">{fmt(t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x0 = PAD.l + i * bw
          const w = Math.min(36, bw - 2)
          const cx = x0 + bw / 2
          const top = y(d.value)
          const h = Math.max(0, PAD.t + ih - top)
          const r = Math.min(4, w / 2, h)
          return (
            <g key={d.label} onPointerEnter={() => setHover(i)}>
              <rect x={x0} y={PAD.t} width={bw} height={ih} fill="transparent" />
              <path
                d={`M${cx - w / 2},${PAD.t + ih} V${top + r} Q${cx - w / 2},${top} ${cx - w / 2 + r},${top} H${cx + w / 2 - r} Q${cx + w / 2},${top} ${cx + w / 2},${top + r} V${PAD.t + ih} Z`}
                fill="var(--series-1)"
                opacity={hover === null || hover === i ? 1 : 0.45}
              />
              <text className="axis-text" x={cx} y={H - 6} textAnchor="middle">{d.label}</text>
            </g>
          )
        })}
      </svg>
      {hover !== null && (
        <div className="chart-tip" style={{ left: `${((PAD.l + (hover + 0.5) * bw) / W) * 100}%`, top: `${(y(data[hover].value) / H) * 100}%` }}>
          {data[hover].label}：<b>{format(data[hover].value)}</b>{unit}
        </div>
      )}
    </div>
  )
}
