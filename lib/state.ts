'use client'
// The visitor's choices live in the URL (?cfs=1200&n=4&age=14&lb=120&exp=some&river=granite-run), never in storage:
// a link to this page carries the gauge setting and the group with it.
import { useSyncExternalStore } from 'react'
import type { Needs } from './model'

export interface Choice { cfs: number; n: number; age: number; lb: number; exp: Needs; river: string }
export const DEFAULTS: Choice = { cfs: 1200, n: 4, age: 14, lb: 120, exp: 'some', river: 'granite-run' }
export const RANGE: Record<string, [number, number]> = { cfs: [200, 7000], n: [1, 20], age: [3, 90], lb: [20, 400] }
const RIVER_IDS = ['elk-fork', 'granite-run', 'black-narrows']

let state: Choice = DEFAULTS
let noticeText = ''
let started = false
const listeners = new Set<() => void>()

function parse(search: string): Choice {
  const q = new URLSearchParams(search), s: Choice = { ...DEFAULTS }
  const bad: string[] = []
  for (const k of ['cfs', 'n', 'age', 'lb'] as const) {
    const raw = q.get(k); if (raw === null) continue
    const v = parseFloat(raw)
    if (isFinite(v) && v >= RANGE[k][0] && v <= RANGE[k][1]) s[k] = Math.round(v)
    else bad.push(`${k}=${raw} (this site takes ${RANGE[k][0]} to ${RANGE[k][1]})`)
  }
  noticeText = bad.length ? 'The link asked for ' + bad.join(', ') + '. Those values were replaced with the defaults.' : ''
  const e = q.get('exp'); if (e === 'none' || e === 'some' || e === 'iii') s.exp = e
  const r = q.get('river'); if (r && RIVER_IDS.indexOf(r) !== -1) s.river = r
  return s
}
export function toQuery(s: Choice): string {
  const parts: string[] = []
  ;(Object.keys(DEFAULTS) as (keyof Choice)[]).forEach((k) => { if (s[k] !== DEFAULTS[k]) parts.push(k + '=' + encodeURIComponent(String(s[k]))) })
  return parts.length ? '?' + parts.join('&') : ''
}
function start() {
  if (started || typeof window === 'undefined') return
  started = true
  state = parse(window.location.search)
  window.addEventListener('popstate', () => { state = parse(window.location.search); emit() })
}
function emit() { listeners.forEach((l) => l()) }
function subscribe(l: () => void) { start(); listeners.add(l); if (state !== DEFAULTS) queueMicrotask(l); return () => { listeners.delete(l) } }
export function setChoice(patch: Partial<Choice>) {
  state = { ...state, ...patch }
  window.history.replaceState(null, '', window.location.pathname + toQuery(state))
  emit()
}
export function useNotice(): string { return useSyncExternalStore(subscribe, () => noticeText, () => '') }
export function useChoice(): Choice { return useSyncExternalStore(subscribe, () => state, () => DEFAULTS) }
