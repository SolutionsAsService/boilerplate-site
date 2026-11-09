'use client'
import { RIVERS } from '@/lib/data'
import { fmtCfs, MONTHS, seasonMonths, WATER_WORDS } from '@/lib/model'
import { setChoice, useChoice } from '@/lib/state'

const CODE = { good: 'G', pushy: 'P', low: 'L', closed: 'X' } as const
/** Twelve months for each river. Press a month to set the gauge to that month's typical flow. */
export default function Seasons() {
  const { cfs, river } = useChoice()
  return (
    <section className="seasons" aria-label="When to go">
      {RIVERS.map((r) => {
        const st = seasonMonths(r)
        return (
          <div key={r.id} className="srow">
            <h3>{r.name}</h3>
            <div className="months" role="group" aria-label={`${r.name} by month`}>
              {r.monthlyCfs.map((c, i) => {
                const on = r.id === river && Math.round(c / 50) * 50 === cfs
                return <button type="button" key={MONTHS[i]} className={'m ' + st[i]} aria-pressed={on} aria-label={`${MONTHS[i]}: typically ${fmtCfs(c)}, ${WATER_WORDS[st[i]]}. Set the gauge to this.`} onClick={() => setChoice({ cfs: Math.min(7000, Math.max(200, Math.round(c / 50) * 50)), river: r.id })}><span>{MONTHS[i]}</span><b>{CODE[st[i]]}</b></button>
              })}
            </div>
          </div>
        )
      })}
      <p className="small key"><b>G</b> good water · <b>P</b> pushy, big water · <b>L</b> too low, no trips · <b>X</b> too high, closed. Typical flows, not a forecast. Press a month to set the gauge.</p>
    </section>
  )
}
