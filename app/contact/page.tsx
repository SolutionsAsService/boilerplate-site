import type { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = { title: 'Contact: ask us anything', description: 'Ask the outfitter a question: it opens your email program with the question filled in.' }

export default function Contact() {
  return (
    <div className="wrap page">
      <p className="kicker">Contact</p>
      <h1>Ask us anything</h1>
      <p className="lede">Questions about the rivers, the gear or whether your group should come? Write it here; your email program will open with it ready to send.</p>
      <ContactForm />
    </div>
  )
}
