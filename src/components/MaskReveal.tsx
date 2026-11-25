import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../motion/motion'
import { useStore } from '../state/store'

/** Pinned transition: a small arch on the page grows until the roof fills the screen. */
export function MaskReveal() {
  const root = useRef<HTMLElement>(null)
  const motionOff = useStore((s) => s.motionOff)
  useLayoutEffect(() => {
    const el = root.current!
    if (motionOff) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: '+=70%', scrub: 0.8, pin: true, anticipatePin: 1 } })
      tl.fromTo('.mask-img', { '--t': 52, '--s': 43, '--b': 18, '--r': 7 }, { '--t': 0, '--s': 0, '--b': 0, '--r': 0, ease: 'power2.inOut', duration: 1 }, 0)
        .fromTo('.mask-img img', { scale: 1.6 }, { scale: 1.05, ease: 'power2.inOut', duration: 1 }, 0)
        .fromTo('.mask-title .ci', { yPercent: 0, color: '#14213d' }, { color: '#ffffff', duration: 0.5, stagger: 0.01 }, 0.25)
        .fromTo('.mask-title', { scale: 1.25 }, { scale: 1, duration: 1, ease: 'power2.out' }, 0)
        .fromTo('.mask-tag', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.2 }, 0.8)
    }, el)
    return () => ctx.revert()
  }, [motionOff])
  const words = ['Step', 'onto', 'the', 'roof.']
  return (
    <section className="mask" ref={root} aria-label="Step onto the roof" data-motion={motionOff ? 'off' : 'on'}>
      <div className="mask-img">
        <img src="img/x/sunset.webp" alt="Concept image: a planted school roof at sunset with a solar canopy, edible beds and students on the walkway." loading="lazy" />
      </div>
      <h2 className="mask-title" aria-label="Step onto the roof.">
        {words.map((w, i) => (
          <span key={i}>
            <span className="w" aria-hidden="true">
              <span className="wi">
                {w.split('').map((c, j) => (
                  <span className="ci" key={j}>
                    {c}
                  </span>
                ))}
              </span>
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </h2>
      <p className="mask-tag">Concept image</p>
    </section>
  )
}
