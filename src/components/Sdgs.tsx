import { useRef, useState } from 'react'
import { SDGS } from '../data/sdgs'
import { sourceById } from '../data/sources'
import { useReveal } from '../motion/useReveal'
import { Split } from './Split'
import { Ext, Arrow } from './Icons'

export function Sdgs() {
  const root = useRef<HTMLElement>(null)
  const [open, setOpen] = useState<number | null>(12)
  useReveal(root)
  return (
    <section className="sdgs" id="sdgs" ref={root} aria-labelledby="sdg-title">
      <div className="sdg-head">
        <Split as="h2" id="sdg-title" className="display-2" text="Where it fits in the Global Goals." />
        <p className="lede">One primary goal, three supporting. Tap to open.</p>
      </div>
      <div className="sdg-list" data-reveal="pop">
        {SDGS.map((g) => {
          const isOpen = open === g.goal
          const src = sourceById(g.source)
          return (
            <div key={g.goal} className={`sdg${g.primary ? ' primary' : ''}`} data-open={isOpen} style={{ ['--sdg' as string]: g.colour }}>
              <button type="button" className="sdg-btn" aria-expanded={isOpen} aria-controls={`sdg-${g.goal}`} onClick={() => setOpen(isOpen ? null : g.goal)}>
                <span className="sdg-num" aria-hidden="true">
                  {g.goal}
                </span>
                <span className="sdg-name">
                  <span className="sdg-role">{g.primary ? 'Primary' : 'Supporting'} · SDG {g.goal}, target {g.target}</span>
                  <strong>{g.name}</strong>
                </span>
                <span className="sdg-plus" aria-hidden="true" />
              </button>
              <div className="sdg-body" id={`sdg-${g.goal}`} hidden={!isOpen}>
                <blockquote>
                  {g.targetText}
                  <cite>
                    UN target {g.target}.{' '}
                    <a href={src.url} target="_blank" rel="noopener noreferrer">
                      sdgs.un.org <Ext />
                    </a>
                  </cite>
                </blockquote>
                <p>{g.how}</p>
              </div>
            </div>
          )
        })}
      </div>
      <aside className="campus-context" aria-labelledby="ctx-title">
        <h3 id="ctx-title">The real campus, and our idea for it</h3>
        <p>New Serangoon campus planned for 2030. The school says plans are subject to final approvals.</p>
        <p>The Giving Roof is our own idea, not part of Building Futures, and not approved.</p>
        <a className="btn btn-line" href="https://www.sji-international.com.sg/giving/building-futures" target="_blank" rel="noopener noreferrer">
          Learn about the school&rsquo;s planned new campus <Arrow dir="up-right" />
        </a>
      </aside>
    </section>
  )
}
