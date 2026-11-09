import type { Metadata } from 'next'
import { RIVERS } from '@/lib/data'
import { classShown } from '@/lib/model'

export const metadata: Metadata = { title: 'About: how the gauge decides', description: 'The one formula that turns a river level into a rapid class, with every assumption listed. A demonstration outfitter.' }

export default function About() {
  return (
    <div className="wrap page">
      <p className="kicker">About</p>
      <h1>How the gauge decides</h1>
      <p className="lede">Gauge Rafting is a made-up outfitter, built to show a rafting site whose numbers are computed, not asserted.</p>
      <h2>The formula</h2>
      <p className="prose">Every rapid has a base class at its river's reference flow, and a sensitivity: how many classes it gains each time the flow doubles. At any level, <code>class = base + sensitivity × log₂(flow ÷ reference)</code>, kept between I and V+ and shown to the nearest half class.</p>
      <div className="tblwrap" tabIndex={0} role="region" aria-label="Every rapid and its assumptions"><table className="t"><caption>Every rapid, at its reference flow and at double and half of it</caption><thead><tr><th scope="col">River</th><th scope="col">Rapid</th><th scope="col" className="n">Base</th><th scope="col" className="n">Sensitivity</th><th scope="col">At half</th><th scope="col">At reference</th><th scope="col">At double</th></tr></thead>
        <tbody>{RIVERS.flatMap((r) => r.rapids.map((x) => <tr key={r.id + x.name}><th scope="row">{r.name}</th><td>{x.name}</td><td className="n">{x.base}</td><td className="n">{x.sens}</td><td>{classShown(x, r.refCfs, r.refCfs / 2)}</td><td>{classShown(x, r.refCfs, r.refCfs)}</td><td>{classShown(x, r.refCfs, r.refCfs * 2)}</td></tr>))}</tbody></table></div>
      <h2>What else is computed</h2>
      <ul className="prose"><li>A river is <b>good</b> between its minimum and maximum flow, <b>pushy</b> in the top fifth of that range or whenever its hardest rapid reaches class IV+, <b>too low</b> below the minimum and <b>closed</b> above the maximum.</li><li>A group may be asked to run no rapid harder than its limit: class II+ with no experience, III+ with a few easy trips, V+ with class III experience; and II+ under age 10, III+ under age 14. A trip that would pass a rapid above the limit is refused, with the rapid named.</li><li>The class is capped at V+: where the formula would give more, tables print "(cap)", because the model has no number beyond V+.</li><li>The group discount is 5% from four people and 10% from eight; the deposit is 25% of the total, rounded up to the dollar.</li><li>The page's water colour runs from clear green at the lowest flow on the site to silty brown at the highest, on a log scale.</li></ul>
      <p className="prose"><b>cfs</b> is cubic feet per second: the volume of water passing a point each second. A bathtub holds about 8 cubic feet.</p>
      <p className="prose">A test that runs on every change recomputes each figure on this site from its source data and fails if a page prints a different number.</p>
    </div>
  )
}
