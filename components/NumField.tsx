'use client'
import { useEffect, useId, useState } from 'react'

/** A number box you can type into: the draft is kept while you type, applied when it is valid, and an out-of-range entry is explained instead of ignored. */
export default function NumField({ label, value, min, max, step = 1, unit, hint, onValid, className }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; hint?: string; onValid: (n: number) => void; className?: string }) {
  const id = useId()
  const [draft, setDraft] = useState(String(value))
  const [err, setErr] = useState('')
  useEffect(() => { setDraft(String(value)); setErr('') }, [value])
  function change(t: string) {
    setDraft(t)
    const v = parseFloat(t)
    if (t.trim() === '') { setErr(''); return }
    if (!isFinite(v)) setErr('Enter a number.')
    else if (v < min || v > max) setErr(`${label} must be between ${min.toLocaleString('en-US')} and ${max.toLocaleString('en-US')}${unit ? ' ' + unit : ''}.`)
    else if (!Number.isInteger(v)) setErr('Use a whole number.')
    else { setErr(''); onValid(v) }
  }
  return (
    <div className={'field ' + (className || '')}>
      <label htmlFor={id}>{label}{unit ? <span className="unit"> ({unit})</span> : null}</label>
      <input id={id} type="text" inputMode="numeric" pattern="[0-9]*" value={draft} aria-invalid={err ? true : undefined} aria-describedby={err ? id + '-e' : hint ? id + '-h' : undefined} onChange={(e) => change(e.target.value)} onBlur={() => { setDraft(String(value)); setErr('') }} />
      {err ? <p id={id + '-e'} className="err" role="alert">{err}</p> : hint ? <p id={id + '-h'} className="small hint">{hint}</p> : null}
    </div>
  )
}
