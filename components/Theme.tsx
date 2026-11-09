'use client'
import { useEffect } from 'react'
import { FLOW } from '@/lib/data'
import { flowFraction } from '@/lib/model'
import { useChoice } from '@/lib/state'

/** The page's colour follows the gauge on a heat scale: shallow acid, cobalt, flood crimson (--f1 blends acid to cobalt, --f2 cobalt to crimson). The property is set through the CSS object model, so no inline style is needed. */
export default function Theme() {
  const { cfs } = useChoice()
  useEffect(() => {
    const f = flowFraction(cfs, FLOW.min, FLOW.max), st = document.documentElement.style
    st.setProperty('--f1', String(Math.min(1, 2 * f))); st.setProperty('--f2', String(Math.max(0, 2 * f - 1)))
  }, [cfs])
  return null
}
