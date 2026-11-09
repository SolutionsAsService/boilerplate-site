'use client'
import { useRef } from 'react'
import { RIVERS } from '@/lib/data'
import { fmtCfs, MONTHS, seasonMonths, WATER_WORDS } from '@/lib/model'
import { setChoice, useChoice } from '@/lib/state'

const CODE = { good: 'G', pushy: 'P', low: 'L', closed: 'X' } as const
/** Twelve months for each river. Press a month to set the gauge to that month's typical flow. */
export default function Seasons() {
  const { cfs, river } = useChoice()
  const rove = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key as 'ArrowRight']; if (!k) return
    const bs = Array.from((e.currentTarget.parentElement as HTMLElement).querySelectorAll('button')) as HTMLButtonElement[], i = bs.indexOf(e.currentTarget), n = bs[(i + k + bs.length) % bs.length]
    e.preventDefault(); bs.forEach((b) => b.setAttribute('tabindex', '-1')); n.setAttribute('tabindex', '0'); n.focus()
  }
  return (
    <section className="seasons" aria-label="When to go">
      {RIVERS.map((r) => {
        const st = seasonMonths(r)
        return (
          <div key={r.id} className="srow">
            <h3>{r.name}</h3>
            <div className="months" role="group" aria-label={`${r.name} by month`}>
              {r.monthlyCfs.map((c, i) => {
                const on = r.id === river && c === cfs
                return <button type="button" key={MONTHS[i]} className={'m ' + st[i]} aria-pressed={on} aria-label={`${MONTHS[i]}: typically ${fmtCfs(c)}, ${WATER_WORDS[st[i]]}. Set the gauge to this.`} tabIndex={on || (i === 0 && !(r.id === river && r.monthlyCfs.some((x) => x === cfs))) ? 0 : -1} onKeyDown={rove} onClick={() => setChoice({ cfs: Math.min(7000, Math.max(200, c)), river: r.id })}><span>{MONTHS[i]}</span><b>{CODE[st[i]]}</b></button>
              })}
            </div>
          </div>
        )
      })}
      <p className="small key"><b>G</b> good water · <b>P</b> pushy, big water · <b>L</b> too low, no trips · <b>X</b> too high, closed. Typical flows, not a forecast. Press a month to set the gauge; the arrow keys move between months.</p>
    </section>
  )
}
