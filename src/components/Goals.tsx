import { useLayoutEffect, useRef } from 'react'
import { SDGS } from '../data/sdgs'
import { sourceById } from '../data/sources'
import { gsap, hold } from '../motion/motion'
import { useStore } from '../state/store'
import { Ext } from './Icons'

const ICON: Record<number, string> = { 4: '04', 6: '06', 7: '07', 12: '12' }

/** Sideways run through the four UN Global Goals, using the official UN icons unaltered. */
export function Goals() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const motionOff = useStore((s) => s.motionOff)

  useLayoutEffect(() => {
    const el = root.current!
    const tr = track.current!
    if (motionOff) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 901px)', () => {
      const dist = () => tr.scrollWidth - window.innerWidth
      const pin = hold(wrap.current!, el, dist)
      const tw = gsap.to(tr, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: pin.vars,
      })
      gsap.utils.toArray<HTMLElement>('.gp').forEach((p) => {
        gsap.fromTo(p.querySelector('.gp-icon'), { rotateY: -70, scale: 0.6 }, { rotateY: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tw, start: 'left right', end: 'left 30%', scrub: true } })
        gsap.fromTo(p.querySelector('.gp-num'), { xPercent: 40 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } })
      })
      return pin.release
    })
    mm.add('(max-width: 900px)', () => {
      gsap.utils.toArray<HTMLElement>('.gp-icon').forEach((ic) => {
        gsap.from(ic, { rotateY: -80, scale: 0.7, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: ic, start: 'top 85%', once: true } })
      })
    })
    return () => mm.revert()
  }, [motionOff])

  return (
    <div className="pinw" ref={wrap}>
    <section className="goals2" id="goals" ref={root} aria-labelledby="goals-title">
      <div className="gp-track" ref={track}>
        <div className="gp-intro">
          <h2 id="goals-title">One roof. Four Global Goals.</h2>
          <p>Primary: SDG 12. Supporting: 7, 6 and 4.</p>
        </div>
        {SDGS.map((g) => {
          const src = sourceById(g.source)
          return (
            <article key={g.goal} className={`gp${g.primary ? ' primary' : ''}`} style={{ ['--sdg' as string]: g.colour }}>
              <span className="gp-num" aria-hidden="true">
                {g.target}
              </span>
              <img className="gp-icon" src={`img/sdg/E_SDG_Icons-${ICON[g.goal]}.jpg`} alt={`UN Sustainable Development Goal ${g.goal}: ${g.name}`} width={466} height={466} loading="lazy" />
              <div className="gp-text">
                <p className="gp-tag">{g.primary ? 'Primary goal' : 'Supporting goal'} · Target {g.target}</p>
                <h3>{g.how}</h3>
                <a href={src.url} target="_blank" rel="noopener noreferrer">
                  Read target {g.target} <Ext />
                </a>
              </div>
            </article>
          )
        })}
      </div>
      <p className="gp-credit">SDG icons: United Nations. Used for information only; this project is not endorsed by the UN.</p>
    </section>
    </div>
  )
}
