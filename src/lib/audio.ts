let ctx: AudioContext | null = null

function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const SOLFEGE = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

/** 簡易鋼琴音色：兩個振盪器 + 快速起音、指數衰減 */
export function playNote(midi: number, duration = 1.2, when = 0, gain = 0.28) {
  const c = ac()
  const t0 = c.currentTime + when
  const out = c.createGain()
  out.gain.setValueAtTime(0.0001, t0)
  out.gain.exponentialRampToValueAtTime(gain, t0 + 0.01)
  out.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  out.connect(c.destination)
  const f = midiToFreq(midi)
  for (const [type, mult, g] of [['triangle', 1, 1], ['sine', 2, 0.3]] as const) {
    const o = c.createOscillator()
    const og = c.createGain()
    o.type = type
    o.frequency.value = f * mult
    og.gain.value = g
    o.connect(og).connect(out)
    o.start(t0)
    o.stop(t0 + duration + 0.05)
  }
}

export function playSequence(midis: (number | null)[], beat = 0.45) {
  midis.forEach((m, i) => {
    if (m !== null) playNote(m, beat * 1.6, i * beat)
  })
  return midis.length * beat
}

function noiseBuffer(c: AudioContext) {
  const buf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buf
}

export type Drum = 'kick' | 'snare' | 'hihat' | 'tom1' | 'tom2' | 'crash'

export function playDrum(kind: Drum) {
  const c = ac()
  const t = c.currentTime
  const g = c.createGain()
  g.connect(c.destination)
  if (kind === 'kick' || kind === 'tom1' || kind === 'tom2') {
    const o = c.createOscillator()
    const [start, end, len] = kind === 'kick' ? [150, 45, 0.45] : kind === 'tom1' ? [260, 140, 0.35] : [180, 90, 0.4]
    o.frequency.setValueAtTime(start, t)
    o.frequency.exponentialRampToValueAtTime(end, t + len)
    g.gain.setValueAtTime(0.9, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + len)
    o.connect(g)
    o.start(t)
    o.stop(t + len)
    return
  }
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c)
  const filter = c.createBiquadFilter()
  const len = kind === 'snare' ? 0.2 : kind === 'hihat' ? 0.06 : 1.2
  filter.type = kind === 'snare' ? 'bandpass' : 'highpass'
  filter.frequency.value = kind === 'snare' ? 1800 : 7000
  g.gain.setValueAtTime(kind === 'crash' ? 0.5 : 0.7, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + len)
  src.connect(filter).connect(g)
  src.start(t)
  src.stop(t + len)
}

export function click(accent: boolean) {
  const c = ac()
  const t = c.currentTime
  const o = c.createOscillator()
  const g = c.createGain()
  o.frequency.value = accent ? 1500 : 1000
  g.gain.setValueAtTime(0.4, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + 0.06)
}
