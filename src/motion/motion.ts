import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useStore } from '../state/store'

gsap.registerPlugin(ScrollTrigger)
if (import.meta.env.DEV) Object.assign(window, { __gsap: gsap })

// Central motion system. Smooth scroll is a convenience layer only:
// every link and section works with native scrolling when motion is paused.

let lenis: Lenis | null = null
const tick = (t: number) => lenis?.raf(t * 1000)

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function startSmoothScroll() {
  if (lenis) return
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
}

export function stopSmoothScroll() {
  if (!lenis) return
  gsap.ticker.remove(tick)
  lenis.destroy()
  lenis = null
}

/** Sections that live inside a pinned sequence register their own scroll position. */
const anchors = new Map<string, () => number | null>()
export function setAnchor(id: string, fn: (() => number | null) | null) {
  if (fn) anchors.set(id, fn)
  else anchors.delete(id)
}
/** Page y for an id, honouring pinned sequences. */
export function anchorY(id: string): number | null {
  const y = anchors.get(id)?.()
  if (y != null) return y
  let el: HTMLElement | null = document.getElementById(id)
  if (!el) return null
  // a pinned element is fixed while active: measure its spacer instead
  const spacer = el.closest<HTMLElement>('.pin-spacer')
  if (spacer && spacer.firstElementChild === el) el = spacer
  return el.getBoundingClientRect().top + window.scrollY
}

/** Scroll to an element id; native jump when motion is paused. */
export function scrollToId(id: string) {
  const y = anchorY(id)
  if (y == null) return
  scrollToY(y + 1)
}

export function scrollToY(y: number) {
  if (lenis && !useStore.getState().motionOff) lenis.scrollTo(y, { duration: 1.6 })
  else window.scrollTo({ top: y, behavior: 'auto' })
}

/** Global reveal registry so pausing motion can finish everything instantly. */
const reveals = new Set<gsap.core.Animation>()
export function track<T extends gsap.core.Animation>(a: T): T {
  reveals.add(a)
  return a
}
export function finishAllReveals() {
  reveals.forEach((a) => {
    a.scrollTrigger?.kill()
    a.progress(1).kill()
  })
  reveals.clear()
}

export const motionOn = () => !useStore.getState().motionOff

export { gsap, ScrollTrigger }
