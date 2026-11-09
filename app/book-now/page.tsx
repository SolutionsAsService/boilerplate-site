import type { Metadata } from 'next'
import Quote from '@/components/Quote'
import GaugeBar from '@/components/GaugeBar'

export const metadata: Metadata = { title: 'Request a trip: price and whether it can run', description: 'Choose a trip and a group size, see the price and whether the river level allows it, then email the request.' }

export default function Book() {
  return (
    <div className="wrap page">
      <p className="kicker">Request a trip</p>
      <h1>Request a trip</h1>
      <p className="lede">Choose a trip, describe the group and set the river level, and see the price and whether the trip can run. Nothing is booked: this opens an email to the outfitter.</p>
      <GaugeBar compact />
      <Quote />
    </div>
  )
}
