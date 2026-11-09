'use client'
import { RIVERS, TRIPS, TIERS, DEPOSIT_PCT, riverById } from '@/lib/data'
import { blockers, classLabel, fmtCfs, hardest, money, quote, runnableMonths, waterStatus, WATER_WORDS, type Needs } from '@/lib/model'
import { RANGE, setChoice, useChoice } from '@/lib/state'
import NumField from './NumField'
import CarryLink from './CarryLink'

/** Describe the group; see which trips it can take at the gauge's level, and why not for the rest. */
export default function Finder() {
  const c = useChoice()
  const g = { n: c.n, age: c.age, lb: c.lb, exp: c.exp as Needs }
  const rows = TRIPS.map((t) => { const r = riverById(t.river), why = blockers(r, g, c.cfs); return { t, r, why, q: quote(t.price, c.n, TIERS, DEPOSIT_PCT) } })
  const fit = rows.filter((x) => !x.why.length), no = rows.filter((x) => x.why.length)
  return (
    <section aria-label="Find a trip">
      <div className="fields">
        <NumField label="People in the group" value={c.n} min={RANGE.n[0]} max={RANGE.n[1]} onValid={(n) => setChoice({ n })} />
        <NumField label="Youngest rider's age" unit="years" value={c.age} min={RANGE.age[0]} max={RANGE.age[1]} onValid={(age) => setChoice({ age })} />
        <NumField label="Lightest rider" unit="lb" value={c.lb} min={RANGE.lb[0]} max={RANGE.lb[1]} hint={`about ${Math.round(c.lb * 0.4536)} kg`} onValid={(lb) => setChoice({ lb })} />
        <div className="field"><label htmlFor="f-exp">Paddling experience</label><select id="f-exp" value={c.exp} onChange={(e) => setChoice({ exp: e.target.value as Needs })}><option value="none">None yet</option><option value="some">A few easy trips</option><option value="iii">Class III or harder</option></select></div>
      </div>
      <p className="verdict" role="status" aria-live="polite"><b>{fit.length} of {rows.length}</b> trips fit this group at {fmtCfs(c.cfs)}.{fit.length === 0 ? ' Try another river level, a different group, or the months below.' : ''}</p>
      <ul className="tripcards">
        {fit.map(({ t, r, q }) => (
          <li key={t.slug} className="tc ok">
            <p className="kick">{r.name} · {r.tag}</p>
            <h3><CarryLink href={`/trips/${t.slug}/`}>{t.title}</CarryLink></h3>
            <p className="meta">{t.days > 1 ? t.days + ' days' : t.hours + ' hours'} · hardest rapid {classLabel(hardest(r, c.cfs))} at this level · {WATER_WORDS[waterStatus(r, c.cfs)]}</p>
            <p className="price"><b>{money(q.total)}</b> for {c.n}{q.pct ? ` after ${q.pct}% off` : ''} <span className="small">({money(Math.round(q.perPerson * 100) / 100)} each; deposit {money(q.deposit)})</span></p>
          </li>
        ))}
      </ul>
      {no.length > 0 && (
        <details className="edit"><summary>{no.length} trip{no.length > 1 ? 's' : ''} that do not fit, and why</summary>
          <ul className="why">{no.map(({ t, r, why }) => <li key={t.slug}><b>{t.title}</b><ul>{why.map((w) => <li key={w}>{w}</li>)}<li>{r.name} typically runs well in {runnableMonths(r).join(', ')}.</li></ul></li>)}</ul>
        </details>
      )}
      <p className="small">Rivers considered: {RIVERS.map((r) => r.name).join(', ')}. Weight and age limits are the outfitter's, set for the rapids at a normal level.</p>
    </section>
  )
}
