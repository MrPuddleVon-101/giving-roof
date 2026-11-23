import { useEffect, useRef, useState, type RefObject } from 'react'
import { useStore } from '../../state/store'

export function useInView(ref: RefObject<Element | null>, threshold = 0.25) {
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])
  return v
}

/** rAF loop that only runs while visible and while motion is on. dt in seconds. */
export function useLoop(active: boolean, fn: (dt: number, t: number) => void) {
  const cb = useRef(fn)
  cb.current = fn
  const motionOff = useStore((s) => s.motionOff)
  useEffect(() => {
    if (!active || motionOff) return
    let raf = 0
    let last = performance.now()
    const start = last
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      cb.current(dt, (now - start) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active, motionOff])
}

/** Client point to SVG viewBox coordinates. */
export function svgPoint(svg: SVGSVGElement, x: number, y: number) {
  const p = svg.createSVGPoint()
  p.x = x
  p.y = y
  const m = svg.getScreenCTM()
  return m ? p.matrixTransform(m.inverse()) : p
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

export function mixHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, t))
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t))
  const bl = Math.round(lerp(pa & 255, pb & 255, t))
  return `rgb(${r},${g},${bl})`
}
