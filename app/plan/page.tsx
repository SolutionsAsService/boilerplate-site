import type { Metadata } from 'next'
import Finder from '@/components/Finder'
import GaugeBar from '@/components/GaugeBar'
import Seasons from '@/components/Seasons'

export const metadata: Metadata = { title: 'Plan: which trips fit your group today', description: 'Tell us the size, ages, weights and experience of your group and the river level; see which trips you can take and why the others are out.' }

export default function Plan() {
  return (
    <div className="wrap page">
      <p className="kicker">Plan</p>
      <h1>Which trips fit your group today?</h1>
      <p className="lede">Describe your group and set the river level. Trips that do not fit say exactly why, so you can change the group, the day or the river.</p>
      <GaugeBar compact />
      <Finder />
      <h2>Pick the month</h2>
      <Seasons />
    </div>
  )
}
