import GaugeBar from '@/components/GaugeBar'
import RiverProfile from '@/components/RiverProfile'
import Seasons from '@/components/Seasons'
import CarryLink from '@/components/CarryLink'
import { RIVERS } from '@/lib/data'

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="kicker">Whitewater rafting · three rivers · one gauge</p>
          <div className="top">
            <div className="head">
              <h1>The river decides.</h1>
              <p className="lede">The same rapid is a splash at 600 cfs and a wall of water at 3,000. Set the gauge: every rapid, every trip, who may ride and the colour of this page follow it.</p>
            </div>
            <div className="dialcell"><GaugeBar hero part="dial" /></div>
            <div className="grpcell"><GaugeBar hero part="group" /></div>
            <div className="vercell"><GaugeBar hero part="verdict" /></div>
          </div>
          <RiverProfile />
        </div>
      </section>
      <section className="wrap page">
        <h2>Three rivers</h2>
        <ul className="rivers">
          {RIVERS.map((r) => (
            <li key={r.id}><p className="kick">{r.tag}</p><h3>{r.name}</h3><p>{r.blurb}</p><p className="meta">{r.miles} miles · riders {r.minAge}+ and {r.minLb} lb+ · runs from {r.minCfs.toLocaleString('en-US')} to {r.maxCfs.toLocaleString('en-US')} cfs</p></li>
          ))}
        </ul>
        <h2>When to go</h2>
        <p className="prose">Rivers rise with the snowmelt and fall by late summer. Each month below is that river's typical flow; press one to set the gauge to it.</p>
        <Seasons />
        <h2>How we decide</h2>
        <p className="prose">We close a river when it is too high or too low to run well, and we limit who may ride by the hardest rapid at that level, not just by age. The class of each rapid at each level comes from one formula that you can read on the <CarryLink href="/about/">About page</CarryLink>. Read <CarryLink href="/safety/">Safety</CarryLink> before you ask for a trip.</p>
      </section>
    </>
  )
}
