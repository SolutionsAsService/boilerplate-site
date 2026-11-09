// The rules of the site, with no imports so that the gate (scripts/check.mjs) can run this exact file.
// Class at a flow is base + sens * log2(flow / refCfs), clamped to 1..5.5 and shown to the nearest half ("III+").

export type Needs = 'none' | 'some' | 'iii'
export interface Rapid { name: string; mile: number; base: number; sens: number; dropFt: number }
export interface River {
  id: string; name: string; tag: string; miles: number; startFt: number; endFt: number; refCfs: number; minCfs: number; maxCfs: number
  minAge: number; minLb: number; needs: Needs; blurb: string; monthlyCfs: number[]; rapids: Rapid[]
}
export interface Trip { slug: string; river: string; title: string; hours: number; days: number; price: number; meals: string; includes: string[] }
export type Water = 'low' | 'good' | 'pushy' | 'closed'

export const PUSHY_CLASS = 4.5
export const CLASS_MIN = 1
export const CLASS_MAX = 5.5
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V']

export function classAt(r: Rapid, ref: number, cfs: number): number {
  const raw = r.base + r.sens * Math.log2(cfs / ref)
  return Math.min(CLASS_MAX, Math.max(CLASS_MIN, raw))
}
/** Nearest half class: 2.5 prints as "II+", 3 as "III". */
export function classLabel(x: number): string {
  const h = Math.round(x * 2) / 2
  const whole = Math.floor(h)
  return ROMAN[whole] + (h - whole === 0.5 ? '+' : '')
}
/** The raw class before the cap: above CLASS_MAX the model has no number to give, and says so. */
export function rawClass(r: Rapid, ref: number, cfs: number): number { return r.base + r.sens * Math.log2(cfs / ref) }
export function classShown(r: Rapid, ref: number, cfs: number): string {
  const c = classAt(r, ref, cfs)
  return classLabel(c) + (rawClass(r, ref, cfs) > CLASS_MAX + 1e-9 ? ' (cap)' : '')
}
export function hardestRapid(river: River, cfs: number): Rapid {
  return river.rapids.reduce((a, b) => (classAt(b, river.refCfs, cfs) > classAt(a, river.refCfs, cfs) ? b : a))
}
export function hardestShown(river: River, cfs: number): string { return classShown(hardestRapid(river, cfs), river.refCfs, cfs) }
export function hardest(river: River, cfs: number): number {
  return Math.max(...river.rapids.map((r) => classAt(r, river.refCfs, cfs)))
}
/** low: scrapey below the minimum; good; pushy in the top fifth of the runnable range; closed above the maximum. */
export function waterStatus(river: River, cfs: number): Water {
  if (cfs > river.maxCfs) return 'closed'
  if (cfs < river.minCfs) return 'low'
  if (cfs > river.minCfs + 0.8 * (river.maxCfs - river.minCfs)) return 'pushy'
  return hardest(river, cfs) >= PUSHY_CLASS ? 'pushy' : 'good'
}
export const CLASS_WORDS = 'Class I easy · II novice · III intermediate · IV advanced · V expert. A + means harder than the number.'
export const WATER_WORDS: Record<Water, string> = { low: 'Too low: scraping', good: 'Good water', pushy: 'Pushy: big water', closed: 'Closed: too high' }

/** Elevation in feet at a mile: a steady gradient plus each rapid's drop, smoothed over half a mile around the rapid. */
export function elevation(river: River, mile: number): number {
  const dropTotal = river.rapids.reduce((s, r) => s + r.dropFt, 0)
  const gradient = (river.startFt - river.endFt - dropTotal) / river.miles
  let e = river.startFt - gradient * mile
  for (const r of river.rapids) {
    const t = Math.min(1, Math.max(0, (mile - (r.mile - 0.25)) / 0.5))
    e -= r.dropFt * t
  }
  return e
}

export function groupDiscountPct(n: number, tiers: { from: number; pct: number }[]): number {
  let pct = 0
  for (const t of tiers) if (n >= t.from && t.pct > pct) pct = t.pct
  return pct
}
export function quote(price: number, n: number, tiers: { from: number; pct: number }[], depositPct: number) {
  const pct = groupDiscountPct(n, tiers)
  const gross = price * n
  const total = Math.round(gross * (100 - pct)) / 100
  const deposit = Math.ceil((total * depositPct) / 100)
  return { pct, gross, total, deposit, perPerson: total / n }
}

export interface Guest { n: number; age: number; lb: number; exp: Needs }
/** The hardest class a group may be asked to run: set by its least experienced member and its youngest. */
export const EXP_CAP: Record<Needs, number> = { none: 2.5, some: 4, iii: CLASS_MAX }
export function classCeiling(g: Guest): number {
  const ageCap = g.age < 10 ? 2.5 : g.age < 14 ? 3.5 : CLASS_MAX
  return Math.min(EXP_CAP[g.exp], ageCap)
}
const RANK: Record<Needs, number> = { none: 0, some: 1, iii: 2 }
/** Reasons a group cannot take a river at a flow; an empty list means it can. */
export function blockers(river: River, g: Guest, cfs: number): string[] {
  const out: string[] = []
  if (g.age < river.minAge) out.push(`The youngest rider must be ${river.minAge} or older (you said ${g.age}).`)
  if (g.lb < river.minLb) out.push(`The lightest rider must weigh at least ${river.minLb} lb (you said ${g.lb}).`)
  if (RANK[g.exp] < RANK[river.needs]) out.push(river.needs === 'iii' ? 'Riders must have paddled class III before.' : 'Riders need at least a little paddling experience.')
  const hard = hardestRapid(river, cfs), hc = classAt(hard, river.refCfs, cfs), cap = classCeiling(g)
  if (waterStatus(river, cfs) !== 'closed' && waterStatus(river, cfs) !== 'low' && Math.round(hc * 2) / 2 > cap + 1e-9) out.push(`At ${cfs.toLocaleString('en-US')} cfs the hardest rapid, ${hard.name}, is class ${classLabel(hc)}. This group's limit is class ${classLabel(cap)} (set by its youngest rider and its experience).`)
  const w = waterStatus(river, cfs)
  if (w === 'closed') out.push(`At ${cfs.toLocaleString('en-US')} cfs the river is closed: it is above ${river.maxCfs.toLocaleString('en-US')} cfs.`)
  if (w === 'low') out.push(`At ${cfs.toLocaleString('en-US')} cfs the river is too low: it needs ${river.minCfs.toLocaleString('en-US')} cfs.`)
  return out
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function seasonMonths(river: River): Water[] { return river.monthlyCfs.map((c) => waterStatus(river, c)) }
export function runnableMonths(river: River): string[] { return seasonMonths(river).map((w, i) => (w === 'good' || w === 'pushy' ? MONTHS[i] : '')).filter(Boolean) }

/** The page colour follows the river: 0 = the lowest flow on the site, 1 = the highest, on a log scale. */
export function flowFraction(cfs: number, min: number, max: number): number {
  return Math.min(1, Math.max(0, Math.log(cfs / min) / Math.log(max / min)))
}
export function fmtCfs(n: number): string { return n.toLocaleString('en-US') + ' cfs' }
export function money(n: number): string { return '$' + (Number.isInteger(n) ? n.toLocaleString('en-US') : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) }
