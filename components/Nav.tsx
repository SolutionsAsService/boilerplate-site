'use client'
import { usePathname } from 'next/navigation'
import CarryLink from './CarryLink'
import { SITE } from '@/lib/data'

export const NAV: [string, string][] = [['/trips/', 'Trips'], ['/plan/', 'Find a trip'], ['/safety/', 'Safety'], ['/about/', 'About'], ['/contact/', 'Contact']]

export default function Nav() {
  const path = usePathname() || ''
  return (
    <header className="site">
      <div className="wrap bar">
        <CarryLink href="/" className="brand"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M2 20c4-6 8-6 12 0s8 6 16-2v8H2z" /><path d="M6 12c3-4 6-4 9 0s6 4 11-1" fill="none" /></svg>{SITE.name}</CarryLink>
        <nav aria-label="Main">
          {NAV.map(([h, l]) => <CarryLink key={h} href={h} aria-current={path.startsWith(h.slice(0, -1)) ? 'page' : undefined}>{l}</CarryLink>)}
          <CarryLink href="/book-now/" className="cta" aria-current={path.startsWith('/book-now') ? 'page' : undefined}>Request a trip</CarryLink>
        </nav>
      </div>
    </header>
  )
}
