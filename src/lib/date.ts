export const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export function ymd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function today(): string {
  return ymd(new Date())
}

export function addDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return ymd(d)
}

/** 民國年顯示：2026-09-28 → 115/09/28（週一） */
export function roc(date: string, withWeekday = false): string {
  const d = new Date(date + 'T00:00:00')
  const y = d.getFullYear() - 1911
  const s = `${y}/${date.slice(5, 7)}/${date.slice(8, 10)}`
  return withWeekday ? `${s}（${WEEKDAYS[d.getDay()]}）` : s
}

export function weekday(date: string): number {
  return new Date(date + 'T00:00:00').getDay()
}

export function ntd(n: number): string {
  return 'NT$' + n.toLocaleString('zh-TW')
}

export function uid(prefix = 'id'): string {
  return prefix + '-' + Math.random().toString(36).slice(2, 9)
}
