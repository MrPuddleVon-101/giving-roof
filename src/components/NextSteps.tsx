import { useLayoutEffect, useRef, useState } from 'react'
import { PHASES, METRICS } from '../data/timeline'
import { gsap, motionOn } from '../motion/motion'
import { useReveal } from '../motion/useReveal'
import { Split } from './Split'

export function NextSteps() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  useReveal(root)
  useLayoutEffect(() => {
    const el = root.current!
    if (!motionOn()) return
    const axis = window.matchMedia('(max-width: 900px)').matches ? 'scaleY' : 'scaleX'
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.tl-progress',
        { [axis]: 0 },
        {
          [axis]: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.timeline', start: 'top 75%', end: 'bottom 45%', scrub: 0.6 },
        },
      )
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <section className="next" id="next" ref={root} aria-labelledby="next-title">
      <div className="next-head">
        <Split as="h2" id="next-title" className="display-2" text="What happens next." />
        <p className="lede">Only after the school agrees. Not a construction schedule.</p>
      </div>
      <div className="timeline">
        <div className="tl-track" aria-hidden="true">
          <span className="tl-progress" />
        </div>
        <ol className="tl-list">
          {PHASES.map((p, i) => (
            <li key={p.when} className="tl-item" data-active={active === i} onMouseEnter={() => setActive(i)}>
              <button type="button" className="tl-btn" aria-expanded={active === i} onClick={() => setActive(i)} onFocus={() => setActive(i)}>
                <span className="tl-node" aria-hidden="true" />
                <span className="tl-when">{p.when}</span>
                <span className="tl-title">{p.title}</span>
              </button>
              <p className="tl-body">{p.body}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="dash" aria-labelledby="dash-title">
        <div className="dash-top">
          <h3 id="dash-title">Evidence dashboard</h3>
          <p>Mock-up. No readings yet.</p>
        </div>
        <div className="dash-grid">
          {METRICS.map((m) => (
            <div className="meter" key={m.key}>
              <p className="meter-label">{m.label}</p>
              <p className="meter-val">
                <span className="meter-empty">No data yet</span>
                <span className="meter-unit">{m.unit}</span>
              </p>
              <div className="meter-bar" aria-hidden="true">
                <i />
              </div>
              <p className="meter-note">{m.note}</p>
              <p className="meter-status">Data collection begins after pilot approval</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
