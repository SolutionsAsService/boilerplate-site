'use client'
import { useEffect } from 'react'
import { FLOW } from '@/lib/data'
import { flowFraction } from '@/lib/model'
import { useChoice } from '@/lib/state'

/** The page's water colour follows the gauge. The property is set through the CSS object model, so no inline style is needed. */
export default function Theme() {
  const { cfs } = useChoice()
  useEffect(() => { document.documentElement.style.setProperty('--flow', String(flowFraction(cfs, FLOW.min, FLOW.max))) }, [cfs])
  return null
}
