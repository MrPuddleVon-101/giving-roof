import { useLayoutEffect, useRef, useState } from 'react'
import { PHASES, METRICS } from '../data/timeline'
import { gsap, motionOn } from '../motion/motion'
import { useReveal } from '../motion/useReveal'
import { Split } from './Split'
import { Ext } from './Icons'

/** Global Goals, the proposed sequence and the empty evidence dashboard, in one screen. */
export function Next() {
  const root = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState(0)
  useReveal(root)
  useLayoutEffect(() => {
    const el = root.current!
    if (!motionOn()) return
    const axis = window.matchMedia('(max-width: 900px)').matches ? 'scaleY' : 'scaleX'
    const ctx = gsap.context(() => {
      gsap.fromTo('.tl-progress', { [axis]: 0 }, { [axis]: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 80%', end: 'bottom 50%', scrub: 0.6 } })
    }, el)
    return () => ctx.revert()
  }, [])
  const p = PHASES[phase]
  return (
    <section className="next2" id="next" ref={root} aria-labelledby="next-title">
      <Split as="h2" id="next-title" className="display-2" text="What comes next." />

      <div className="timeline">
        <div className="tl-track" aria-hidden="true">
          <span className="tl-progress" />
        </div>
        <ol className="tl-list">
          {PHASES.map((ph, i) => (
            <li key={ph.when} className="tl-item" data-active={phase === i}>
              <button type="button" className="tl-btn" aria-expanded={phase === i} onClick={() => setPhase(i)} onPointerEnter={() => setPhase(i)}>
                <span className="tl-node" aria-hidden="true" />
                <span className="tl-when">{ph.when}</span>
                <span className="tl-title">{ph.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="tl-detail" aria-live="polite" key={phase}>
          {p.body}
        </p>
        <p className="fine">Only after the school agrees. Not a construction schedule.</p>
      </div>

      <div className="dash2" aria-label="Evidence dashboard mock-up">
        {METRICS.map((m) => (
          <div key={m.key} className="d2">
            <span className="d2-unit">{m.unit}</span>
            <span className="d2-label">{m.label}</span>
            <i aria-hidden="true" />
          </div>
        ))}
        <p className="d2-status">Data collection begins after pilot approval</p>
      </div>

      <p className="campus-line">
        SJI International plans a new Serangoon campus for 2030, subject to final approvals. This roof is our idea, not part of that plan.{' '}
        <a href="https://www.sji-international.com.sg/giving/building-futures" target="_blank" rel="noopener noreferrer">
          Learn about the school&rsquo;s planned new campus <Ext />
        </a>
      </p>
    </section>
  )
}
