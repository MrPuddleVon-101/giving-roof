import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useStore } from '../state/store'

gsap.registerPlugin(ScrollTrigger)
if (import.meta.env.DEV) Object.assign(window, { __gsap: gsap })

// Central motion system. Scrolling is always the browser's own, so it stays smooth
// even when a frame is late. Pinned scenes are CSS sticky for the same reason:
// scripts only draw what is inside them, they never move the page.

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Hold `el` still inside `wrap` for `len()` pixels of scroll, using position: sticky.
 * Returns ScrollTrigger settings for the held stretch, and a cleanup.
 */
export function hold(wrap: HTMLElement, el: HTMLElement, len: () => number) {
  const set = () => {
    wrap.style.height = `${Math.round(el.offsetHeight + len())}px`
  }
  el.style.position = 'sticky'
  el.style.top = '0px'
  set()
  ScrollTrigger.addEventListener('refreshInit', set)
  return {
    vars: { trigger: wrap, start: 'top top', end: () => `+=${Math.round(len())}`, scrub: true, invalidateOnRefresh: true } as const,
    release: () => {
      ScrollTrigger.removeEventListener('refreshInit', set)
      wrap.style.height = ''
      el.style.position = ''
      el.style.top = ''
    },
  }
}

/** Light mode: if the machine cannot keep up while scrolling, decoration is dropped for good. */
export function watchFrames() {
  let slow = 0
  let seen = 0
  let last = 0
  let raf = 0
  let until = 0
  const loop = (n: number) => {
    if (last) {
      seen++
      if (n - last > 26) slow++
    }
    last = n
    if (seen >= 90) {
      if (slow > 32) {
        document.documentElement.dataset.lite = 'true'
        useStore.setState({ lite: true })
        window.removeEventListener('scroll', on)
        return
      }
      seen = slow = 0
    }
    if (n < until) raf = requestAnimationFrame(loop)
    else raf = last = 0
  }
  const on = () => {
    until = performance.now() + 250
    if (!raf) raf = requestAnimationFrame(loop)
  }
  window.addEventListener('scroll', on, { passive: true })
  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('scroll', on)
  }
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
  // a held element moves inside its wrapper: measure the wrapper
  if (el.parentElement?.classList.contains('pinw')) el = el.parentElement
  return el.getBoundingClientRect().top + window.scrollY
}

/** Scroll to an element id; native jump when motion is paused. */
export function scrollToId(id: string) {
  const y = anchorY(id)
  if (y == null) return
  scrollToY(y + 1)
}

let glide: gsap.core.Tween | null = null
export function scrollToY(y: number) {
  glide?.kill()
  if (useStore.getState().motionOff) return window.scrollTo({ top: y, behavior: 'auto' })
  const o = { y: window.scrollY }
  const stop = () => glide?.kill()
  glide = gsap.to(o, {
    y,
    duration: Math.min(1.3, 0.5 + Math.abs(y - o.y) / 9000),
    ease: 'power3.inOut',
    onUpdate: () => window.scrollTo(0, o.y),
  })
  // any real input takes over at once
  window.addEventListener('wheel', stop, { once: true, passive: true })
  window.addEventListener('touchstart', stop, { once: true, passive: true })
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
