import type { Metadata, Viewport } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Theme from '@/components/Theme'
import { SITE } from '@/lib/data'

export const metadata: Metadata = {
  title: { default: `${SITE.name}: the river decides the trip`, template: `%s | ${SITE.name}` },
  description: 'A whitewater rafting site where the river level changes every rapid. Move the gauge and watch the class, the trips and the page itself change. A demonstration outfitter.',
  icons: { icon: '/icon.svg' },
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">Skip to the content</a>
        <Theme />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
