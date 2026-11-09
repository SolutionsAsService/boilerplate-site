import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Safety: what we require and what this demo cannot do', description: 'The international scale of river difficulty, what guides and gear are required, and what this demonstration site does not decide for you.' }

const SCALE: [string, string, string][] = [
  ['I', 'Easy', 'Fast-moving water with small waves and few obstructions. Risk to swimmers is low.'],
  ['II', 'Novice', 'Straightforward rapids with wide, clear channels. Some manoeuvring; swimmers are rarely in danger.'],
  ['III', 'Intermediate', 'Moderate, irregular waves and narrow passages that need careful maneuvering. Swimmers may need help.'],
  ['IV', 'Advanced', 'Intense, powerful rapids that demand precise boat handling. Swims are dangerous and rescue is difficult.'],
  ['V', 'Expert', 'Extremely long, violent or obstructed rapids with severe consequences for a swim.'],
  ['VI', 'Extreme', 'Not run on any trip we offer.'],
]

export default function Safety() {
  return (
    <div className="wrap page">
      <p className="kicker">Before you book</p>
      <h1>Safety: what we require and what this demo cannot do</h1>
      <div className="notice"><b>This is a demonstration</b>Gauge Rafting is a fictional outfitter. The rules below show what a good outfitter publishes; they are not a safety plan for any real river. Use a licensed guide service and follow its instructions.</div>
      <h2 id="scale">The scale of difficulty</h2>
      <div className="tblwrap" tabIndex={0} role="region" aria-label="Scale of river difficulty"><table className="t"><caption>International scale of river difficulty, summarised</caption><thead><tr><th scope="col">Class</th><th scope="col">Name</th><th scope="col">What it means</th></tr></thead><tbody>{SCALE.map(([c, n, d]) => <tr key={c}><th scope="row">{c}</th><td>{n}</td><td>{d}</td></tr>)}</tbody></table></div>
      <p className="prose">A rapid's class changes with the river's level. On this site the class of each rapid at each level comes from the formula on the <a href="/about/">About page</a>; it is a teaching model, not a measurement.</p>
      <h2 id="require">What every trip requires</h2>
      <ul className="prose"><li>A life jacket and a helmet, fitted by a guide, worn for the whole trip.</li><li>A guide in every raft, and a safety briefing before the put-in that every rider must attend.</li><li>The age, weight and experience limits on each trip page. They are not negotiable on the day.</li><li>A river inside its runnable range. We close a river that is too high and we do not run one that is too low.</li></ul>
      <h2 id="not">What this site does not decide</h2>
      <ul className="prose"><li>It does not forecast the river. The monthly flows are typical values.</li><li>It does not know your health, swimming ability or nerve. Tell the guides anything that matters.</li><li>It takes no booking and no payment. The request button only opens an email.</li></ul>
    </div>
  )
}
