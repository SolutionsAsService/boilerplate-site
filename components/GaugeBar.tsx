'use client'
import { FLOW, RIVERS } from '@/lib/data'
import { classLabel, fmtCfs, hardest, waterStatus, WATER_WORDS } from '@/lib/model'
import { setChoice, useChoice } from '@/lib/state'

const PRESETS: [string, number][] = [['Dry summer', 400], ['Normal', 1200], ['Spring melt', 3000], ['Flood', 6000]]
const toT = (cfs: number) => Math.round((1000 * Math.log(cfs / FLOW.min)) / Math.log(FLOW.max / FLOW.min))
const fromT = (t: number) => Math.min(FLOW.max, Math.max(FLOW.min, Math.round((FLOW.min * Math.pow(FLOW.max / FLOW.min, t / 1000)) / FLOW.step) * FLOW.step))

/** The river level in cubic feet per second (cfs). Everything on the site recomputes from it. */
export default function GaugeBar({ compact = false }: { compact?: boolean }) {
  const { cfs } = useChoice()
  return (
    <section className={'gauge' + (compact ? ' compact' : '')} aria-label="River level">
      <div className="gauge-top">
        <label htmlFor="gauge-range" className="lab">River level <output id="gauge-out" htmlFor="gauge-range gauge-num">{fmtCfs(cfs)}</output></label>
        <div className="pair">
          <input id="gauge-range" type="range" min={0} max={1000} step={1} value={toT(cfs)} aria-valuetext={`${cfs.toLocaleString('en-US')} cubic feet per second`} onChange={(e) => setChoice({ cfs: fromT(+e.target.value) })} />
          <input id="gauge-num" type="number" inputMode="numeric" min={FLOW.min} max={FLOW.max} step={FLOW.step} value={cfs} aria-label="River level in cubic feet per second" onChange={(e) => { const v = parseFloat(e.target.value); if (isFinite(v) && v >= FLOW.min && v <= FLOW.max) setChoice({ cfs: Math.round(v) }) }} />
        </div>
      </div>
      <div className="chips" role="group" aria-label="Typical river levels">
        {PRESETS.map(([l, v]) => <button key={l} type="button" className="chip" aria-pressed={cfs === v} onClick={() => setChoice({ cfs: v })}>{l} · {v.toLocaleString('en-US')}</button>)}
      </div>
      {!compact && (
        <ul className="statuses" aria-label="Each river at this level">
          {RIVERS.map((r) => { const w = waterStatus(r, cfs); return <li key={r.id} className={'st ' + w}><b>{r.name}</b><span>{WATER_WORDS[w]}</span><span>{w === 'closed' || w === 'low' ? 'no trips' : 'hardest rapid ' + classLabel(hardest(r, cfs))}</span></li> })}
        </ul>
      )}
    </section>
  )
}
