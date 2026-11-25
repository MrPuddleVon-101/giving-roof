import { useEffect, useLayoutEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { gsap, motionOn, scrollToId } from '../../motion/motion'
import { useStore } from '../../state/store'
import { Arrow } from '../Icons'
import { smooth } from './util'

const REST = 0.33 // mid-morning

/**
 * The campus render split into sky, lettering and building, so the title stands
 * behind the dome. Dragging anywhere moves the sun and relights the building.
 */
export function HeroStage({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const time = useRef({ t: REST })
  const drag = useRef<{ x: number; t: number } | null>(null)
  const sun = useRef<HTMLButtonElement>(null)
  const motionOff = useStore((s) => s.motionOff)

  const paint = useRef(() => {})
  paint.current = () => {
    const el = root.current
    if (!el) return
    const t = time.current.t
    const e = Math.sin(Math.PI * t)
    const day = smooth(0.08, 0.5, e)
    const low = smooth(0.02, 0.3, e) * (1 - smooth(0.35, 0.85, e))
    const s = el.style
    s.setProperty('--day', day.toFixed(3))
    s.setProperty('--noon', smooth(0.45, 0.95, e).toFixed(3))
    s.setProperty('--low', low.toFixed(3))
    s.setProperty('--night', (1 - smooth(0.02, 0.42, e)).toFixed(3))
    s.setProperty('--lit', (1 - smooth(0.05, 0.62, e)).toFixed(3))
    s.setProperty('--sx', `${(6 + t * 88).toFixed(2)}%`)
    s.setProperty('--sy', `${(innerWidth <= 900 ? 42 - e * 31 : 52 - e * 41).toFixed(2)}%`)
    const h = 5.5 + t * 14.5
    const label = `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.floor((h % 1) * 60)).padStart(2, '0')}`
    sun.current?.setAttribute('aria-valuenow', String(Math.round(t * 100)))
    sun.current?.setAttribute('aria-valuetext', label)
    const c = el.querySelector('.hero-clock')
    if (c) c.textContent = label
  }

  // opening: a short time-lapse from before dawn to morning while the title rises behind the dome
  useLayoutEffect(() => {
    const el = root.current!
    if (!ready || !motionOn()) {
      time.current.t = REST
      paint.current()
      return
    }
    const ctx = gsap.context(() => {
      time.current.t = 0.015
      paint.current()
      gsap
        .timeline()
        .to(time.current, { t: REST, duration: 3.4, ease: 'power2.inOut', onUpdate: () => paint.current() }, 0)
        .fromTo('.hs-title span', { yPercent: 112 }, { yPercent: 0, duration: 2, ease: 'expo.out', stagger: 0.14 }, 0.5)
        .fromTo('.hs-fg', { scale: 1.07 }, { scale: 1, duration: 3.2, ease: 'power3.out' }, 0)
        .fromTo('.hs-foot', { opacity: 0 }, { opacity: 1, duration: 0.9 }, 2.1)
    }, el)
    return () => ctx.revert()
  }, [ready])

  // depth: sky, sun, lettering and building each move by a different amount
  useEffect(() => {
    const el = root.current!
    const mv = (e: globalThis.PointerEvent) => {
      if (!motionOn() || e.pointerType !== 'mouse') return
      const x = e.clientX / innerWidth - 0.5
      const y = e.clientY / innerHeight - 0.5
      gsap.to('.hs-title', { x: x * 26, y: y * 12, duration: 1.6, ease: 'power3.out', overwrite: 'auto' })
      gsap.to('.hs-fgwrap', { x: x * -14, y: y * -7, duration: 1.6, ease: 'power3.out', overwrite: 'auto' })
      gsap.to('.hs-clouds', { x: x * 44, duration: 2.2, ease: 'power3.out', overwrite: 'auto' })
    }
    el.addEventListener('pointermove', mv)
    return () => el.removeEventListener('pointermove', mv)
  }, [])

  const set = (t: number) => {
    gsap.killTweensOf(time.current)
    const v = Math.min(0.985, Math.max(0.015, t))
    if (motionOff) {
      time.current.t = v
      paint.current()
    } else gsap.to(time.current, { t: v, duration: 0.5, ease: 'power2.out', onUpdate: () => paint.current() })
  }
  const down = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('a')) return
    drag.current = { x: e.clientX, t: time.current.t }
    root.current!.dataset.touched = ''
  }
  const move = (e: PointerEvent) => {
    if (!drag.current) return
    set(drag.current.t + ((e.clientX - drag.current.x) / innerWidth) * 1.15)
  }
  const up = () => (drag.current = null)
  const key = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 0.05 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -0.05 : 0
    if (!d) return
    e.preventDefault()
    set(time.current.t + d)
  }

  return (
    <section className="dstage st-hero" id="top" ref={root} aria-labelledby="hero-title" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up}>
      <div className="stage-in" data-cursor="drag">
        <div className="hs-sky" aria-hidden="true">
          <i className="sk-night" />
          <i className="sk-low" />
          <i className="sk-day" />
          <i className="sk-noon" />
        </div>
        <div className="hs-stars" aria-hidden="true" />
        <div className="cover hs-cloudwrap" aria-hidden="true">
          <img className="hs-clouds" src="img/day/hero-sky.webp" alt="" draggable={false} />
        </div>
        <div className="hs-sun" aria-hidden="true" />
        <div className="hs-titlewrap">
          <h1 className="hs-title" id="hero-title" aria-label="The Giving Roof">
            <i aria-hidden="true"><span>The Giving</span></i>
            <i aria-hidden="true"><span>Roof</span></i>
          </h1>
        </div>
        <div className="cover hs-fgwrap">
          <div className="hs-fg">
            <img className="hs-night" src="img/day/hero-night.webp" alt="" draggable={false} />
            <img className="hs-lit" src="img/day/hero-lit.webp" alt="" draggable={false} />
            <img
              className="hs-day"
              src="img/day/hero-day.webp"
              alt="Concept render of the planned SJI International campus front: a long white façade with two tiers of round arches and a silver chapel dome with a cross. On the right-hand wing roof, elevated solar panels shade low planting, with raised planter beds beside them."
              fetchPriority="high"
              draggable={false}
            />
          </div>
        </div>
        <div className="hs-fade" aria-hidden="true" />
        <button ref={sun} type="button" className="hs-handle" role="slider" aria-label="Time of day" aria-valuemin={0} aria-valuemax={100} aria-valuenow={33} onKeyDown={key}>
          <span className="hs-hint">Drag the sun</span>
        </button>
        <div className="hs-foot">
          <p className="hs-line">One school roof.<br />Four measurable returns.</p>
          <div className="hs-links">
            <a href="#explorer" onClick={(e) => { e.preventDefault(); scrollToId('explorer') }}>Explore the roof <Arrow dir="down" /></a>
            <a href="#research" onClick={(e) => { e.preventDefault(); scrollToId('research') }}>View the research</a>
          </div>
          <p className="hs-note">
            <span className="hero-clock" aria-hidden="true">10:17</span>
            Proposed concept for the future Serangoon campus. Student concept, not an approved design.
          </p>
        </div>
      </div>
    </section>
  )
}
