'use client'
import { FLOW, RIVERS } from '@/lib/data'
import { blockers, fmtCfs, hardestShown, waterStatus, WATER_WORDS, type Needs } from '@/lib/model'
import { RANGE, setChoice, useChoice, useNotice } from '@/lib/state'
import NumField from './NumField'
import CarryLink from './CarryLink'

const PRESETS: [string, number][] = [['Dry summer', 400], ['Normal', 1200], ['Spring melt', 3000], ['Flood', 6000]]
const STEPS = 60
const toT = (cfs: number) => Math.round((STEPS * Math.log(cfs / FLOW.min)) / Math.log(FLOW.max / FLOW.min))
const fromT = (t: number) => Math.min(FLOW.max, Math.max(FLOW.min, Math.round((FLOW.min * Math.pow(FLOW.max / FLOW.min, t / STEPS)) / FLOW.step) * FLOW.step))

/** The river level in cfs (cubic feet per second: how much water passes a point each second). Everything on the site recomputes from it.
    `hero` adds the giant readout, the group fields and a verdict for each river. */
export default function GaugeBar({ compact = false, hero = false, part }: { compact?: boolean; hero?: boolean; part?: 'dial' | 'group' | 'verdict' }) {
  const c = useChoice(), { cfs } = c
  const notice = useNotice()
  const g = { n: c.n, age: c.age, lb: c.lb, exp: c.exp as Needs }
  const cur = RIVERS.filter((r) => r.id === c.river)[0]
  const w = waterStatus(cur, cfs)
  const range = (
    <div className="pair">
      <input id="gauge-range" type="range" min={0} max={STEPS} step={1} value={toT(cfs)} aria-label="River level" aria-valuetext={`${cfs.toLocaleString('en-US')} cubic feet per second`} onChange={(e) => setChoice({ cfs: fromT(+e.target.value) })} />
      <NumField label="cfs" value={cfs} min={RANGE.cfs[0]} max={RANGE.cfs[1]} onValid={(v) => setChoice({ cfs: v })} className="cfsf" />
    </div>
  )
  const GROUP = (
    <>
      {hero && (
        <>
          <h2 className="mini">Who is coming?</h2>
          <div className="fields grp">
            <NumField label="People" value={c.n} min={RANGE.n[0]} max={RANGE.n[1]} onValid={(n) => setChoice({ n })} />
            <NumField label="Youngest rider's age" unit="years" value={c.age} min={RANGE.age[0]} max={RANGE.age[1]} onValid={(age) => setChoice({ age })} />
            <NumField label="Lightest rider" unit="lb" value={c.lb} min={RANGE.lb[0]} max={RANGE.lb[1]} hint={`about ${Math.round(c.lb * 0.4536)} kg`} onValid={(lb) => setChoice({ lb })} />
            <div className="field"><label htmlFor="g-exp">Paddling experience</label><select id="g-exp" value={c.exp} onChange={(e) => setChoice({ exp: e.target.value as Needs })}><option value="none">None yet</option><option value="some">A few easy trips</option><option value="iii">Class III or harder</option></select></div>
          </div>
        </>
      )}
    </>
  )
  const VERDICTS = (
    <>
      {!compact && (
        <ul className="statuses" aria-label={hero ? 'What your group can ride' : 'Each river at this level'}>
          {RIVERS.map((r) => { const ws = waterStatus(r, cfs), why = hero ? blockers(r, g, cfs) : []; const cls = ws === 'closed' || ws === 'low' ? 'no trips' : 'hardest rapid ' + hardestShown(r, cfs); return <li key={r.id} className={'st ' + ws + (hero ? (why.length ? ' no' : ' yes') : '')}><b>{r.name}</b><span>{WATER_WORDS[ws]} · {cls}</span>{hero && <span className="verd">{why.length ? 'Not for this group: ' + why[0] : 'Your group can ride it.'}</span>}</li> })}
        </ul>
      )}
      {hero && <div className="chips"><CarryLink href="/plan/" className="btn">Find a trip for this group</CarryLink><CarryLink href="/trips/" className="chip">See the five trips</CarryLink></div>}
    </>
  )
  if (part === 'group') return (
    <section className="gauge herobox grpbox" aria-label="Your group">
      {GROUP}
    </section>
  )
  if (part === 'verdict') return <section className="verdicts" aria-label="What your group can ride">{VERDICTS}</section>
  return (
    <section className={'gauge' + (compact ? ' compact' : '') + (hero ? ' herobox' : '')} aria-label="River level">
      {hero && (
        <div className="readout" aria-hidden="true"><span className="cap">River level now</span><span className="big">{cfs.toLocaleString('en-US')}<small>cfs</small></span><span className="state">{cur.name}: {WATER_WORDS[w]}</span></div>
      )}
      <div className="gauge-top">
        <label htmlFor="gauge-range" className="lab">River level{!hero && <output htmlFor="gauge-range">{fmtCfs(cfs)}</output>}</label>
        {range}
        <p className="small def">cfs means cubic feet per second: how much water passes a point each second. A bathtub is about 8 cubic feet.</p>
      </div>
      {notice && <p className="err" role="alert">{notice}</p>}
      <div className="chips" role="group" aria-label="Typical river levels">
        {PRESETS.map(([l, v]) => <button key={l} type="button" className="chip" aria-pressed={cfs === v} onClick={() => setChoice({ cfs: v })}>{l} · {v.toLocaleString('en-US')}</button>)}
      </div>
      {part === undefined && hero && <>{GROUP}{VERDICTS}</>}
    </section>
  )
}
