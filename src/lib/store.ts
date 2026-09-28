import { useSyncExternalStore } from 'react'
import type { DB } from './types'
import { createMockDB } from './mock'

const KEY = 'yuedong-music-tw:v1'
const listeners = new Set<() => void>()

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DB
  } catch {
    /* 私密瀏覽或資料損毀時改用預設資料 */
  }
  return createMockDB()
}

let state: DB = load()

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function getDB(): DB {
  return state
}

/** 以不可變方式更新資料並寫入 localStorage */
export function update(fn: (draft: DB) => DB) {
  state = fn(state)
  persist()
  listeners.forEach((l) => l())
}

export function resetDB() {
  state = createMockDB()
  persist()
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, getDB)
}

let toastTimer: number | undefined
const toastListeners = new Set<(msg: string | null) => void>()
export function toast(msg: string) {
  toastListeners.forEach((l) => l(msg))
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => toastListeners.forEach((l) => l(null)), 2200)
}
export function onToast(l: (msg: string | null) => void) {
  toastListeners.add(l)
  return () => {
    toastListeners.delete(l)
  }
}
