'use client'
import { useEffect, useRef, useState } from 'react'
import { RIVERS, riverById } from '@/lib/data'
import { classAt, classLabel, elevation, fmtCfs, waterStatus, WATER_WORDS } from '@/lib/model'
import { setChoice, useChoice } from '@/lib/state'

/** The river as a profile: miles across, feet of elevation up. Each rapid is a badge whose size and numeral are its class at the gauge's level.
    Drawn in real pixels (the viewBox is the container's width) so the text is the size it is written. */
export default function RiverProfile() {
  const { cfs, river: id } = useChoice()
  const river = riverById(id)
  const box = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(640)
  const [p, setP] = useState<number | null>(null)       // raft position, 0..1; null = not running
  const [run, setRun] = useState(false)
  const [reduce, setReduce] = useState(false)
  const raf = useRef(0)

  useEffect(() => {
    const el = box.current; if (!el) return
    const inner = () => { const cs = getComputedStyle(el); return Math.max(280, Math.floor(el.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth))) }
    const ro = new ResizeObserver(() => setW(inner()))
    ro.observe(el); setW(inner())
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)'); setReduce(mq.matches)
    return () => ro.disconnect()
  }, [])
  useEffect(() => { setP(null); setRun(false) }, [id])
  useEffect(() => {
    if (!run || reduce) return
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000; last = now
      setP((q) => { const n = (q ?? 0) + dt / 10; if (n >= 1) { setRun(false); return 1 } return n })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [run, reduce])

  const narrow = W < 520, H = narrow ? 262 : 300, L = 34, R = 14, T = narrow ? 56 : 78, B = 46, iw = W - L - R, ih = H - T - B
  const e0 = river.endFt - 6, e1 = river.startFt + 4
  const X = (m: number) => L + (m / river.miles) * iw
  const Y = (e: number) => T + ih - ((e - e0) / (e1 - e0)) * ih
  const pts: [number, number][] = []
  for (let m = 0; m <= river.miles + 1e-9; m += river.miles / 120) pts.push([X(m), Y(elevation(river, m))])
  const line = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('')
  const water = waterStatus(river, cfs)
  const ok = water === 'good' || water === 'pushy'
  const mile = p === null ? null : p * river.miles
  const here = mile === null ? null : river.rapids.filter((r) => Math.abs(r.mile - mile) < 0.35)[0]
  const rapidIdx = (m: number) => river.rapids.findIndex((r) => r.mile > m + 0.01)

  function step() {
    if (reduce) { const m = p === null ? -1 : p * river.miles; const i = rapidIdx(m); const nxt = i === -1 ? null : river.rapids[i]; setP(nxt ? nxt.mile / river.miles : null) }
    else if (run) setRun(false)
    else { if (p === null || p >= 1) setP(0); setRun(true) }
  }
  const ticks: number[] = []; for (let m = 0; m <= river.miles; m += river.miles > 9 ? 2 : 1) ticks.push(m)

  return (
    <div className="profile" ref={box}>
      <div className="chips" role="group" aria-label="Choose a river">
        {RIVERS.map((r) => <button key={r.id} type="button" className="chip" aria-pressed={r.id === id} onClick={() => setChoice({ river: r.id })}>{r.name}<small>{r.tag}</small></button>)}
      </div>
      <svg role="img" aria-labelledby="prof-t prof-d" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <title id="prof-t">{`${river.name} at ${fmtCfs(cfs)}: the river from mile 0 to mile ${river.miles}, with its rapids and their class`}</title>
        <desc id="prof-d">{`${river.rapids.map((r) => `${r.name}, mile ${r.mile}, class ${classLabel(classAt(r, river.refCfs, cfs))}`).join('. ')}. ${WATER_WORDS[water]}.`}</desc>
        <path className={'wfill ' + water} d={line + `L${X(river.miles)} ${H - B}L${X(0)} ${H - B}Z`} />
        <path className="pline" d={line} />
        <line className="axis" x1={L} x2={W - R} y1={H - B} y2={H - B} />
        {ticks.map((m) => <g key={m}><line className="tick" x1={X(m)} x2={X(m)} y1={H - B} y2={H - B + 5} /><text className="tl" x={X(m)} y={H - B + 20} textAnchor="middle">{m}</text></g>)}
        <text className="tl" x={W - R} y={H - B + 34} textAnchor="end">miles downstream</text>
        {river.rapids.map((r, i) => {
          const c = classAt(r, river.refCfs, cfs), rad = (11 + (c - 1) * 4.2) * (narrow ? 0.8 : 1), x = Math.min(W - R - rad, Math.max(L + rad, X(r.mile))), y = Y(elevation(river, r.mile)), up = narrow ? 18 : i % 2 === 0 ? 30 : 52
          const by = Math.max(rad + 6, y - up - rad)
          return (
            <g key={r.name} className={'rap k' + Math.min(5, Math.floor(c))}>
              <line className="stem" x1={x} x2={x} y1={y} y2={by + rad} />
              <circle cx={x} cy={by} r={rad} className="badge" />
              <text x={x} y={by + 5} textAnchor="middle" className="num">{classLabel(c)}</text>
              {!narrow && <text x={Math.min(W - 6, Math.max(6, x))} y={by - rad - 5} textAnchor={x > W - 80 ? 'end' : x < 80 ? 'start' : 'middle'} className="rn">{r.name}</text>}
            </g>
          )
        })}
        {mile !== null && <g className="raft" transform={`translate(${X(mile)} ${Y(elevation(river, mile)) - 9})`}><rect x={-12} y={-7} width={24} height={13} rx={6} /><line x1={-8} x2={8} y1={-1} y2={-1} /></g>}
        {!ok && <g><rect className="veil" x={L} y={T} width={iw} height={ih} /><text className="veilt" x={L + iw / 2} y={T + ih / 2} textAnchor="middle">{water === 'closed' ? `Closed at ${fmtCfs(cfs)}: above ${fmtCfs(river.maxCfs)}` : `Too low at ${fmtCfs(cfs)}: needs ${fmtCfs(river.minCfs)}`}</text></g>}
      </svg>
      <p className="small">{`${river.startFt.toLocaleString('en-US')} ft at the put-in, ${river.endFt.toLocaleString('en-US')} ft at the take-out (${(river.startFt - river.endFt).toLocaleString('en-US')} ft of fall in ${river.miles} miles).`}</p>
      <div className="runbar">
        <button type="button" className="btn" onClick={step} disabled={!ok}>{reduce ? 'Next rapid' : run ? 'Pause the raft' : p === null || p >= 1 ? 'Run the river' : 'Resume'}</button>
        <p className="now" role="status" aria-live="polite">{!ok ? WATER_WORDS[water] + '.' : mile === null ? 'Press the button to put the raft in at mile 0.' : p !== null && p >= 1 ? 'Take-out at mile ' + river.miles + '.' : here ? `${here.name}: class ${classLabel(classAt(here, river.refCfs, cfs))}. ${here.dropFt} ft of drop.` : `Mile ${mile.toFixed(1)}.`}</p>
      </div>
      <details className="edit" open={narrow ? true : undefined}><summary>{narrow ? 'The rapids' : 'The rapids as a table'}</summary>
        <div className="tblwrap" tabIndex={0} role="region" aria-label={`${river.name} rapids at ${fmtCfs(cfs)}`}>
          <table className="t"><caption>{river.name} at {fmtCfs(cfs)}</caption><thead><tr><th scope="col">Rapid</th><th scope="col" className="n">Mile</th><th scope="col" className="n">Drop</th><th scope="col">Class here</th><th scope="col" className="n">Class at {fmtCfs(river.refCfs)}</th></tr></thead>
            <tbody>{river.rapids.map((r) => <tr key={r.name}><th scope="row">{r.name}</th><td className="n">{r.mile}</td><td className="n">{r.dropFt} ft</td><td>{classLabel(classAt(r, river.refCfs, cfs))}</td><td className="n">{classLabel(classAt(r, river.refCfs, river.refCfs))}</td></tr>)}</tbody></table>
        </div>
      </details>
    </div>
  )
}
