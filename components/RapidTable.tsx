'use client'
import { riverById } from '@/lib/data'
import { classAt, classLabel, classShown, fmtCfs, waterStatus, WATER_WORDS } from '@/lib/model'
import { useChoice } from '@/lib/state'

export default function RapidTable({ riverId }: { riverId: string }) {
  const { cfs } = useChoice(), r = riverById(riverId), w = waterStatus(r, cfs)
  return (
    <div>
      <p className={'verdict ' + (w === 'good' ? 'good' : w === 'pushy' ? 'watch' : 'bad')} role="status" aria-live="polite"><b>{WATER_WORDS[w]}</b> at {fmtCfs(cfs)}. The river runs from {fmtCfs(r.minCfs)} to {fmtCfs(r.maxCfs)}.</p>
      <div className="tblwrap" tabIndex={0} role="region" aria-label={`${r.name} rapids at ${fmtCfs(cfs)}`}>
        <table className="t"><caption>{r.name}: each rapid's class at {fmtCfs(cfs)}</caption><thead><tr><th scope="col">Rapid</th><th scope="col" className="n">Mile</th><th scope="col" className="n">Drop</th><th scope="col">Class now</th><th scope="col" className="n">At {fmtCfs(r.refCfs)}</th></tr></thead>
          <tbody>{r.rapids.map((x) => <tr key={x.name}><th scope="row">{x.name}</th><td className="n">{x.mile}</td><td className="n">{x.dropFt} ft</td><td><b>{classShown(x, r.refCfs, cfs)}</b></td><td className="n">{classLabel(classAt(x, r.refCfs, r.refCfs))}</td></tr>)}</tbody></table>
      </div>
    </div>
  )
}
