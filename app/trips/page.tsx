import type { Metadata } from 'next'
import { RIVERS, TRIPS, riverById } from '@/lib/data'
import CarryLink from '@/components/CarryLink'
import GaugeBar from '@/components/GaugeBar'
import { money } from '@/lib/model'

export const metadata: Metadata = { title: 'Trips: three rivers, five ways to ride', description: 'Five trips on three rivers, from a three-hour family float to an expert day in a steep gorge, with prices and what each includes.' }

export default function Trips() {
  return (
    <div className="wrap page">
      <p className="kicker">Trips</p>
      <h1>Three rivers, five ways to ride</h1>
      <p className="lede">Prices are per person, with a group discount from four people. Which trip runs on a given day depends on the river level.</p>
      <GaugeBar compact />
      {RIVERS.map((r) => (
        <section key={r.id} aria-labelledby={'r-' + r.id}>
          <h2 id={'r-' + r.id}>{r.name} <span className="tagline">{r.tag}</span></h2>
          <p className="prose">{r.blurb}</p>
          <ul className="tripcards">
            {TRIPS.filter((t) => t.river === r.id).map((t) => (
              <li key={t.slug} className="tc"><h3><CarryLink href={`/trips/${t.slug}/`}>{t.title}</CarryLink></h3><p className="meta">{t.days > 1 ? t.days + ' days' : t.hours + ' hours'} · {t.meals}</p><p className="price"><b>{money(t.price)}</b> per person</p></li>
            ))}
          </ul>
        </section>
      ))}
      <p className="small">Rivers are listed with riders' age, weight and experience limits on each trip page. {riverById('black-narrows').name} requires class III experience.</p>
    </div>
  )
}
