import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TRIPS, riverById, tripBySlug } from '@/lib/data'
import RapidTable from '@/components/RapidTable'
import Quote from '@/components/Quote'
import GaugeBar from '@/components/GaugeBar'
import CarryLink from '@/components/CarryLink'
import { money } from '@/lib/model'

export const dynamicParams = false
export function generateStaticParams() { return TRIPS.map((t) => ({ slug: t.slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = tripBySlug((await params).slug)
  return t ? { title: `Trips: ${t.title}`, description: `${t.title} on the ${riverById(t.river).name}. ${t.days > 1 ? t.days + ' days' : t.hours + ' hours'}, ${money(t.price)} per person. ${t.includes[0]}.` } : {}
}

export default async function Trip({ params }: { params: Promise<{ slug: string }> }) {
  const t = tripBySlug((await params).slug); if (!t) notFound()
  const r = riverById(t.river)
  return (
    <div className="wrap page">
      <p className="kicker"><CarryLink href="/trips/">Trips</CarryLink> · {r.name}</p>
      <h1>{t.title}</h1>
      <p className="lede">{r.blurb} {t.days > 1 ? `${t.days} days` : `${t.hours} hours on the water`}, {money(t.price)} per person.</p>
      <h2>At this river level</h2>
      <GaugeBar compact />
      <RapidTable riverId={r.id} />
      <h2>What is included</h2>
      <ul className="prose">{t.includes.map((x) => <li key={x}>{x}</li>)}<li>Meals: {t.meals}</li></ul>
      <h2>Who can come</h2>
      <p className="prose">Riders must be {r.minAge} or older and weigh at least {r.minLb} lb.{r.needs === 'iii' ? ' Everyone must have paddled class III before.' : r.needs === 'some' ? ' Riders need at least a few easy trips behind them; our guides teach the rest.' : ' No experience is needed.'} The river runs from {r.minCfs.toLocaleString('en-US')} to {r.maxCfs.toLocaleString('en-US')} cfs.</p>
      <h2>Request this trip</h2>
      <Quote slug={t.slug} />
    </div>
  )
}
