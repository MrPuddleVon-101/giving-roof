import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap, motionOn, scrollToId } from '../motion/motion'
import { useStore } from '../state/store'
import { Arrow } from './Icons'

// Callout anchors as fractions of the hero render (1672 x 941).
const CALLOUTS = [
  { x: 0.52, y: 0.29, label: 'Chapel dome stays as designed', tone: 'ink' },
  { x: 0.74, y: 0.355, label: 'Solar canopy', tone: 'gold' },
  { x: 0.7, y: 0.455, label: 'Shade planting', tone: 'leaf' },
  { x: 0.905, y: 0.43, label: 'Edible beds', tone: 'leaf' },
]

const TITLE = ['The', 'Giving', 'Roof']

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const motionOff = useStore((s) => s.motionOff)

  // entrance once the loader lifts
  useLayoutEffect(() => {
    const el = root.current!
    if (!ready || !motionOn()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.hero-zoom', { scale: 1.25, duration: 2.6 }, 0)
        .from('.hero-title .ci', { yPercent: 130, rotateX: -90, opacity: 0, duration: 1.4, stagger: 0.035 }, 0.1)
        .from('.hero-ask', { y: 24, opacity: 0, duration: 1 }, 0.45)
        .from('.hero-sub', { y: 24, opacity: 0, duration: 1 }, 0.6)
        .from('.hero-cta > *', { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, 0.7)
        .from('.hero-foot > *', { y: 16, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.85)
        .from('.hero-foot .rule', { scaleX: 0, transformOrigin: 'left', duration: 1.6, ease: 'expo.inOut' }, 0.8)
    }, el)
    return () => ctx.revert()
  }, [ready])

  // pinned scroll: push into the roof wing, title peels away, callouts pin to the real features
  useLayoutEffect(() => {
    const el = root.current!
    if (motionOff) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: '+=56%', scrub: 0.8, pin: true, anticipatePin: 1 },
      })
      tl.to('.hero-zoom', { scale: 1.75, '--s': 1.75, ease: 'power2.inOut', duration: 1 }, 0)
        .to('.hero-title .ci', { yPercent: -140, opacity: 0, rotate: () => gsap.utils.random(-25, 25), ease: 'power2.in', stagger: 0.012, duration: 0.45 }, 0)
        .to(['.hero-ask', '.hero-sub', '.hero-cta', '.hero-foot'], { y: -60, opacity: 0, ease: 'power2.in', duration: 0.35, stagger: 0.04 }, 0)
        .to('.hero-shade', { opacity: 0, duration: 0.4 }, 0.1)
        .fromTo('.callout-in', { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.25, ease: 'expo.out' }, 0.55)
        .fromTo('.hero-end', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.25 }, 0.8)
    }, el)
    return () => ctx.revert()
  }, [motionOff])

  // pointer parallax on the render
  useEffect(() => {
    const el = root.current!
    const frame = el.querySelector<HTMLElement>('.hero-frame')!
    const mv = (e: PointerEvent) => {
      if (!motionOn() || e.pointerType !== 'mouse') return
      const x = e.clientX / innerWidth - 0.5
      const y = e.clientY / innerHeight - 0.5
      gsap.to(frame, { x: x * -22, y: y * -14, duration: 1.4, ease: 'power3.out' })
      gsap.to(el.querySelector('.hero-title'), { x: x * 14, y: y * 8, duration: 1.4, ease: 'power3.out' })
    }
    el.addEventListener('pointermove', mv)
    return () => el.removeEventListener('pointermove', mv)
  }, [])

  return (
    <section className="hero" id="top" ref={root} aria-labelledby="hero-title" data-motion={motionOff ? 'off' : 'on'}>
      <div className="hero-frame">
        <div className="hero-zoom">
          <img
            src="img/hero-1672.webp"
            srcSet="img/hero-960.webp 960w, img/hero-1672.webp 1672w"
            sizes="(max-width: 900px) 200vw, 120vw"
            alt="Concept render of the planned SJI International campus front: a long white façade with two tiers of round arches and a silver chapel dome with a cross. On the right-hand wing roof, elevated solar panels shade low planting, with raised planter beds beside them."
            fetchPriority="high"
          />
          {CALLOUTS.map((c) => (
            <span key={c.label} className={`callout tone-${c.tone}`} style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%` }}>
              <span className="callout-in">
                <b>{c.label}</b>
                <i aria-hidden="true" />
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-copy">
        <p className="hero-ask">What if one roof could give back four times?</p>
        <h1 className="hero-title" id="hero-title" aria-label="The Giving Roof">
          {TITLE.map((w, i) => (
            <span key={w}>
              <span className="w" aria-hidden="true">
                <span className="wi">
                  {w.split('').map((c, j) => (
                    <span className="ci" key={j}>
                      {c}
                    </span>
                  ))}
                </span>
              </span>
              {i < TITLE.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>
        <p className="hero-sub">One school roof. Four measurable returns.</p>
        <div className="hero-cta">
          <a className="btn btn-solid" href="#explorer" onClick={(e) => { e.preventDefault(); scrollToId('explorer') }}>
            Explore the roof <Arrow dir="down" />
          </a>
          <a className="btn-link" href="#research" onClick={(e) => { e.preventDefault(); scrollToId('research') }}>
            View the research
          </a>
        </div>
      </div>
      <p className="hero-end" aria-hidden="true">
        One wing. <em>Four returns.</em>
      </p>
      <div className="hero-foot">
        <span className="rule" aria-hidden="true" />
        <p className="hero-label">
          <strong>Proposed concept for the future Serangoon campus</strong>
          <span>Student concept. Not an approved design.</span>
        </p>
      </div>
    </section>
  )
}
