import { useLayoutEffect, useRef, useState, type ComponentType } from 'react'
import { RETURNS, type ReturnId } from '../data/returns'
import { useStore } from '../state/store'
import { gsap, scrollToId, scrollToY } from '../motion/motion'
import { useReveal } from '../motion/useReveal'
import { ReturnGlyph, Arrow } from './Icons'
import { SunScene } from './scenes/SunScene'
import { RainScene } from './scenes/RainScene'
import { RootsScene } from './scenes/RootsScene'
import { ReachScene } from './scenes/ReachScene'

const SCENES: Record<ReturnId, ComponentType> = { solar: SunScene, rain: RainScene, roots: RootsScene, reach: ReachScene }


/** Four full-screen panels. On wide screens the section pins and scrolls sideways. */
export function Returns() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const motionOff = useStore((s) => s.motionOff)
  const setMode = useStore((s) => s.setMode)
  const [active, setActive] = useState(0)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  useReveal(root)

  useLayoutEffect(() => {
    const el = root.current!
    const tr = track.current!
    if (motionOff) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 901px)', () => {
      const dist = () => tr.scrollWidth - window.innerWidth
      const tw = gsap.to(tr, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.9,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => setActive(Math.min(3, Math.round(self.progress * 3))),
        },
      })
      tweenRef.current = tw
      // giant words slide against the scroll for depth
      gsap.utils.toArray<HTMLElement>('.rp-name').forEach((n) => {
        gsap.fromTo(n, { xPercent: 9 }, { xPercent: -9, ease: 'none', scrollTrigger: { trigger: n.closest('.rp'), containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } })
      })
      gsap.utils.toArray<HTMLElement>('.rp-scene').forEach((s) => {
        gsap.fromTo(s, { rotate: 4, y: 60, scale: 0.9 }, { rotate: 0, y: 0, scale: 1, ease: 'power2.out', scrollTrigger: { trigger: s.closest('.rp'), containerAnimation: tw, start: 'left 85%', end: 'left 25%', scrub: true } })
      })
      return () => {
        tweenRef.current = null
      }
    })
    return () => mm.revert()
  }, [motionOff])

  const jump = (i: number) => {
    const st = tweenRef.current?.scrollTrigger
    if (!st) return document.getElementById(`rp-${RETURNS[i].id}`)?.scrollIntoView()
    const y = st.start + (st.end - st.start) * (i / 3)
    scrollToY(y)
  }

  return (
    <section className="returns" id="returns" ref={root} aria-labelledby="returns-title">
      <h2 id="returns-title" className="sr-only">Four returns from one roof</h2>
      <div className="rp-track" ref={track}>
        {RETURNS.map((r) => {
          const Scene = SCENES[r.id]
          return (
            <article key={r.id} id={`rp-${r.id}`} className={`rp rp-${r.id}`} aria-labelledby={`rp-h-${r.id}`}>
              <div className="rp-text">
                <ReturnGlyph id={r.id} size={52} />
                <h3 id={`rp-h-${r.id}`} className="rp-name">
                  {r.name}
                </h3>
                <p className="rp-outcome">{r.outcome}</p>
                <button
                  type="button"
                  className="btn btn-solid"
                  onClick={() => {
                    setMode(r.id)
                    scrollToId(document.getElementById(`ch-${r.id}`) ? `ch-${r.id}` : 'explorer')
                  }}
                >
                  See it in 3D <Arrow />
                </button>
              </div>
              <div className="rp-scene">
                <Scene />
              </div>
            </article>
          )
        })}
      </div>
      <nav className="rp-nav" aria-label="Jump to a return">
        {RETURNS.map((r, i) => (
          <button key={r.id} type="button" data-on={active === i} style={{ ['--c' as string]: r.colour }} onClick={() => jump(i)} aria-label={r.name}>
            <ReturnGlyph id={r.id} size={26} />
          </button>
        ))}
      </nav>
    </section>
  )
}
