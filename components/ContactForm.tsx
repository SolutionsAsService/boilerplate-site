'use client'
import { useState } from 'react'
import { SITE } from '@/lib/data'

/** A question for the outfitter: it builds an email, it does not post anywhere. */
export default function ContactForm() {
  const [name, setName] = useState(''), [msg, setMsg] = useState('')
  const href = `mailto:${SITE.email}?subject=${encodeURIComponent('A question from ' + (name || 'a visitor'))}&body=${encodeURIComponent(msg)}`
  return (
    <form className="contact" onSubmit={(e) => e.preventDefault()} aria-label="Ask a question">
      <div className="field"><label htmlFor="c-name">Your name</label><input id="c-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="field"><label htmlFor="c-msg">Your question</label><textarea id="c-msg" rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} /></div>
      {msg ? <a className="btn" href={href}>Email the question</a> : <button type="button" className="btn" disabled>Email the question</button>}
      <p className="small">This opens your email program. Nothing is sent from this page.</p>
    </form>
  )
}
