import type { Metadata } from 'next'
import Link from 'next/link'
export const metadata: Metadata = { title: 'Not found: that page is off the map', description: 'The page you asked for does not exist. Go back to the trips or to the river-level gauge on the home page.' }
export default function NotFound() {
  return (
    <div className="wrap page"><p className="kicker">404</p><h1>That stretch of river is not on the map</h1><p className="lede">The page you asked for does not exist. Try the <Link href="/trips/">trips</Link> or go back to the <Link href="/">gauge</Link>.</p></div>
  )
}
