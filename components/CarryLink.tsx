'use client'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { toQuery, useChoice } from '@/lib/state'

/** A link that carries the gauge setting and the group in the URL. */
export default function CarryLink({ href, children, className, ...rest }: { href: string; children: ReactNode; className?: string; 'aria-current'?: 'page' | undefined; 'aria-label'?: string }) {
  const c = useChoice()
  return <Link href={href + (href.indexOf('?') === -1 ? toQuery(c) : '')} className={className} {...rest}>{children}</Link>
}
