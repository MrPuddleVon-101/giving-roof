import { useLayoutEffect, type RefObject } from 'react'
import { gsap, track, motionOn } from './motion'

// Staged reveals, chosen per element with data-reveal:
//   words  - heading words rise out of a mask, staggered
//   clip   - image wipes open from one edge
//   rule   - a line draws across
//   rise   - children enter one after another with a slight lift and fade
//   count  - number counts up to data-to (with data-dec decimals)
// The default CSS state is the final state, so nothing hides if JS or motion is off.

const fmtN = (v: number, d: number) => v.toLocaleString('en-SG', { minimumFractionDigits: d, maximumFractionDigits: d })

export function useReveal(root: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const el = root.current
    if (!el || !motionOn()) return
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('[data-reveal="words"]').forEach((h) => {
        const chars = h.querySelectorAll('.ci')
        const targets = chars.length ? chars : h.querySelectorAll('.wi')
        track(
          gsap.from(targets, {
            yPercent: 120,
            rotateX: -85,
            rotate: chars.length ? 0 : 4,
            opacity: chars.length ? 0 : 1,
            transformOrigin: '50% 100% -20px',
            duration: 1.15,
            ease: 'expo.out',
            stagger: chars.length ? { each: 0.022, from: 'start' } : 0.055,
            scrollTrigger: { trigger: h, start: 'top 90%', once: true },
          }),
        )
      })
      // odometer: each digit column rolls to its value
      el.querySelectorAll<HTMLElement>('[data-reveal="odo"]').forEach((o) => {
        const cols = o.querySelectorAll<HTMLElement>('.odo-col')
        cols.forEach((c, i) => {
          const d = Number(c.dataset.d)
          track(
            gsap.fromTo(
              c,
              { y: 0, yPercent: 0 },
              {
                y: 0,
                yPercent: -(d + 10) * (100 / 21),
                duration: 2 + i * 0.18,
                ease: 'expo.out',
                scrollTrigger: { trigger: o, start: 'top 92%', once: true },
              },
            ),
          )
        })
      })
      // images drift inside their frames while scrolling
      el.querySelectorAll<HTMLElement>('[data-parallax]').forEach((m) => {
        const amt = Number(m.dataset.parallax || 12)
        gsap.fromTo(
          m,
          { yPercent: -amt },
          { yPercent: amt, ease: 'none', scrollTrigger: { trigger: m.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
      el.querySelectorAll<HTMLElement>('[data-reveal="pop-off"]').forEach((g) => {
        track(
          gsap.from(g.children, {
            scale: 0.6,
            y: 40,
            rotate: (i: number) => (i % 2 ? 6 : -6),
            opacity: 0,
            duration: 1,
            ease: 'expo.out',
            stagger: 0.08,
            scrollTrigger: { trigger: g, start: 'top 85%', once: true },
          }),
        )
      })
      el.querySelectorAll<HTMLElement>('[data-reveal="clip"]').forEach((m) => {
        const from = m.dataset.from ?? 'bottom'
        const start =
          from === 'left' ? 'inset(0 100% 0 0)' : from === 'right' ? 'inset(0 0 0 100%)' : 'inset(100% 0 0 0)'
        const img = m.querySelector('img')
        const tl = gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 85%', once: true } })
        tl.fromTo(m, { clipPath: start }, { clipPath: 'inset(0 0 0 0)', duration: 1.4, ease: 'expo.inOut' })
        if (img) tl.from(img, { scale: 1.18, duration: 1.8, ease: 'expo.out' }, 0)
        track(tl)
      })
      el.querySelectorAll<HTMLElement>('[data-reveal="rule"]').forEach((r) => {
        track(
          gsap.from(r, {
            scaleX: 0,
            transformOrigin: r.dataset.origin ?? 'left center',
            duration: 1.3,
            ease: 'expo.inOut',
            scrollTrigger: { trigger: r, start: 'top 92%', once: true },
          }),
        )
      })
      el.querySelectorAll<HTMLElement>('[data-reveal="rise-off"]').forEach((g) => {
        track(
          gsap.from(g.children, {
            y: 28,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.09,
            scrollTrigger: { trigger: g, start: 'top 86%', once: true },
          }),
        )
      })
      el.querySelectorAll<SVGElement>('[data-reveal="draw"]').forEach((svg) => {
        const paths = svg.querySelectorAll<SVGPathElement>('.draw')
        paths.forEach((p) => {
          const L = p.getTotalLength()
          p.style.strokeDasharray = `${L}`
        })
        track(
          gsap.fromTo(
            paths,
            { strokeDashoffset: (_i: number, t: SVGPathElement) => t.getTotalLength() },
            { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', stagger: 0.4, scrollTrigger: { trigger: svg, start: 'top 85%', once: true } },
          ),
        )
      })
      el.querySelectorAll<SVGElement>('[data-reveal="bars"]').forEach((svg) => {
        track(
          gsap.from(svg.querySelectorAll('.bar'), {
            scaleY: 0,
            duration: 1.1,
            ease: 'expo.out',
            stagger: 0.06,
            scrollTrigger: { trigger: svg, start: 'top 85%', once: true },
          }),
        )
      })
      el.querySelectorAll<HTMLElement>('[data-reveal="count-off"]').forEach((n) => {
        const to = Number(n.dataset.to)
        const dec = Number(n.dataset.dec ?? 0)
        const o = { v: 0 }
        track(
          gsap.to(o, {
            v: to,
            duration: 1.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: n, start: 'top 90%', once: true },
            onStart: () => {
              n.textContent = fmtN(0, dec)
            },
            onUpdate: () => {
              n.textContent = fmtN(o.v, dec)
            },
          }),
        )
      })
    }, el)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
