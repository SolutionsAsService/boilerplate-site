import type { Metadata } from 'next'
import Quote from '@/components/Quote'
import GaugeBar from '@/components/GaugeBar'

export const metadata: Metadata = { title: 'Book now: request a trip', description: 'Choose a trip and a group size, see the price and whether the river level allows it, then email the request.' }

export default function Book() {
  return (
    <div className="wrap page">
      <p className="kicker">Book now</p>
      <h1>Request a trip</h1>
      <p className="lede">Choose a trip, set the group and the day's river level, and see the price and whether it can run. Nothing is booked until we reply by email.</p>
      <GaugeBar compact />
      <Quote />
    </div>
  )
}
