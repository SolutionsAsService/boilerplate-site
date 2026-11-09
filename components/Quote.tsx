'use client'
import { useState } from 'react'
import { DEPOSIT_PCT, SITE, TIERS, TRIPS, riverById, tripBySlug } from '@/lib/data'
import { blockers, classLabel, fmtCfs, hardest, money, quote, type Needs } from '@/lib/model'
import { RANGE, setChoice, useChoice } from '@/lib/state'
import NumField from './NumField'

/** A trip request: what you would pay, whether the group and the river level allow it, and an email that carries the request. Nothing is sent from here. */
export default function Quote({ slug }: { slug?: string }) {
  const c = useChoice()
  const [sel, setSel] = useState(slug || TRIPS[2].slug)
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [copied, setCopied] = useState(false)
  const t = tripBySlug(sel) || TRIPS[0], r = riverById(t.river)
  const q = quote(t.price, c.n, TIERS, DEPOSIT_PCT)
  const why = blockers(r, { n: c.n, age: c.age, lb: c.lb, exp: c.exp as Needs }, c.cfs)
  const text = `Trip request\nTrip: ${t.title}\nPeople: ${c.n} (youngest ${c.age}, lightest ${c.lb} lb, experience: ${c.exp})\nPreferred date: ${date || 'not chosen'}\nName: ${name || 'not given'}\nQuoted total: ${money(q.total)} (deposit ${money(q.deposit)})`
  const href = `mailto:${SITE.email}?subject=${encodeURIComponent('Trip request: ' + t.title)}&body=${encodeURIComponent(text)}`
  return (
    <section className="quote" aria-label="Trip request">
      <div className="fields">
        {!slug && <div className="field"><label htmlFor="q-trip">Trip</label><select id="q-trip" value={sel} onChange={(e) => setSel(e.target.value)}>{TRIPS.map((x) => <option key={x.slug} value={x.slug}>{x.title}</option>)}</select></div>}
        <NumField label="People" value={c.n} min={RANGE.n[0]} max={RANGE.n[1]} onValid={(n) => setChoice({ n })} />
        <NumField label="Youngest rider's age" unit="years" value={c.age} min={RANGE.age[0]} max={RANGE.age[1]} onValid={(age) => setChoice({ age })} />
        <NumField label="Lightest rider" unit="lb" value={c.lb} min={RANGE.lb[0]} max={RANGE.lb[1]} hint={`about ${Math.round(c.lb * 0.4536)} kg`} onValid={(lb) => setChoice({ lb })} />
        <div className="field"><label htmlFor="q-exp">Paddling experience</label><select id="q-exp" value={c.exp} onChange={(e) => setChoice({ exp: e.target.value as Needs })}><option value="none">None yet</option><option value="some">A few easy trips</option><option value="iii">Class III or harder</option></select></div>
        <div className="field"><label htmlFor="q-date">Preferred date</label><input id="q-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /><p className="small hint">Prices do not change by date. We confirm the river level for your date by email.</p></div>
        <div className="field"><label htmlFor="q-name">Your name</label><input id="q-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
      </div>
      <table className="t"><caption>What it costs</caption><tbody>
        <tr><th scope="row">{money(t.price)} × {c.n} {c.n === 1 ? 'person' : 'people'}</th><td className="n">{money(q.gross)}</td></tr>
        {q.pct > 0 && <tr><th scope="row">Group discount, {q.pct}%</th><td className="n">−{money(Math.round((q.gross - q.total) * 100) / 100)}</td></tr>}
        <tr><th scope="row">Total</th><td className="n"><b>{money(q.total)}</b></td></tr>
        <tr><th scope="row">Deposit to hold the date ({DEPOSIT_PCT}%)</th><td className="n">{money(q.deposit)}</td></tr>
      </tbody></table>
      <p className={'verdict ' + (why.length ? 'bad' : 'good')} role="status" aria-live="polite">{why.length ? <><b>This group cannot take this trip at {fmtCfs(c.cfs)}.</b> {why.join(' ')}</> : <><b>This group can take this trip.</b> At {fmtCfs(c.cfs)} its hardest rapid is class {classLabel(hardest(r, c.cfs))}.</>}</p>
      <div className="chips"><a className="btn" href={href}>Email this request</a><button type="button" className="chip" onClick={() => { navigator.clipboard?.writeText(text).then(() => setCopied(true), () => setCopied(false)) }}>{copied ? 'Copied' : 'Copy the request'}</button></div>
      <p className="small">Whether the trip can run depends on the river level when you go, so the check above uses the gauge setting, not your date. This opens your email program with the request filled in. No payment is taken here, and nothing is sent until you send the email.</p>
    </section>
  )
}
