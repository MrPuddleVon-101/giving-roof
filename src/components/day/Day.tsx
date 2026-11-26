import type { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, hold, scrollToY, setAnchor } from '../../motion/motion'
import { useStore } from '../../state/store'
import { useInView } from '../scenes/util'
import { RETURNS } from '../../data/returns'
import { HeroStage } from './HeroStage'
import { SunStage } from './SunStage'
import { RainStage } from './RainStage'
import { RootsStage } from './RootsStage'
import { ReachStage } from './ReachStage'

// One pinned day on the roof. Each scene opens through an arch like the ones on the façade.
const IN = 0.75 // length of an arch opening
const STAY = 0.95 // time to play with a scene
const FIRST = 0.12
const TOTAL = FIRST + 4 * (IN + STAY)
const CLOSED = { '--t': 100, '--s': 42, '--r': 8 }
const DOOR = { '--t': 30, '--s': 38, '--r': 12 }
const OPEN = { '--t': 0, '--s': 0, '--r': 0 }

export function Day({ ready }: { ready: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState(0)
  const st = useRef<ScrollTrigger | null>(null)
  const motionOff = useStore((s) => s.motionOff)
  const onScreen = useInView(root, 0.01)

  // decode every scene while the opening plays, so none of them stalls the scroll later
  useEffect(() => {
    if (!ready) return
    const imgs = [...root.current!.querySelectorAll('img')]
    let stop = false
    const run = async () => {
      for (const im of imgs) {
        if (stop) return
        await im.decode().catch(() => {})
      }
    }
    const id = window.setTimeout(run, 400)
    return () => {
      stop = true
      clearTimeout(id)
    }
  }, [ready])

  useLayoutEffect(() => {
    const el = root.current!
    if (motionOff) {
      const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setStage([...el.querySelectorAll('.dstage')].indexOf(e.target))), { threshold: 0.5 })
      el.querySelectorAll('.dstage').forEach((s) => io.observe(s))
      setAnchor('returns', () => (document.getElementById('rp-solar')?.getBoundingClientRect().top ?? 0) + scrollY)
      return () => {
        io.disconnect()
        setAnchor('returns', null)
      }
    }
    const pin = hold(wrap.current!, el, () => innerHeight * TOTAL * 0.62)
    const ctx = gsap.context(() => {
      const ss = gsap.utils.toArray<HTMLElement>('.dstage')
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          ...pin.vars,
          onUpdate: (self) => {
            const p = self.progress * TOTAL
            ss.forEach((s, i) => {
              // covered once the next scene has fully opened
              const off = i < 4 && p > FIRST + i * (IN + STAY) + IN + 0.06
              if ((s.dataset.off === 'true') !== off) s.dataset.off = String(off)
            })
            setStage(p < FIRST + IN * 0.6 ? 0 : Math.min(4, 1 + Math.floor((p - FIRST - IN * 0.6) / (IN + STAY))))
          },
        },
      })
      st.current = tl.scrollTrigger!
      ss.slice(1).forEach((s, i) => {
        const t = FIRST + i * (IN + STAY)
        const prev = ss[i].querySelector('.stage-in')
        tl.set(s, { visibility: 'visible' }, t)
          .fromTo(s, CLOSED, { ...DOOR, duration: IN * 0.5, ease: 'power2.out' }, t)
          .to(s, { ...OPEN, duration: IN * 0.5, ease: 'power2.inOut' }, t + IN * 0.5)
          .fromTo(s.querySelector('.stage-in'), { scale: 1.22 }, { scale: 1, duration: IN, ease: 'power1.out' }, t)
          .to(prev, { scale: 1.16, duration: IN, ease: 'power1.in' }, t)
          .fromTo(s.querySelectorAll('.stage-text, .tally, .approve, .stage-warn'), { opacity: 0 }, { opacity: 1, duration: IN * 0.25 }, t + IN * 0.85)
        const word = s.querySelector('.stage-word')
        if (word) tl.fromTo(word, { yPercent: 70 }, { yPercent: 0, duration: IN * 0.8, ease: 'power3.out' }, t + IN * 0.45)
      })
      // the title sinks behind the roof as you leave the first scene
      tl.to('.hs-titlewrap', { yPercent: 60, duration: IN, ease: 'power1.in' }, FIRST * 0.4)
      tl.to({}, { duration: 0.001 }, TOTAL)
    }, el)
    const y = (i: number) => {
      const s = st.current
      return s ? s.start + ((s.end - s.start) * (FIRST + IN + (i - 1) * (IN + STAY) + 0.12)) / TOTAL : null
    }
    setAnchor('returns', () => y(1))
    RETURNS.forEach((r, i) => setAnchor(`rp-${r.id}`, () => y(i + 1)))
    setAnchor('top', () => 0)
    return () => {
      ctx.revert()
      pin.release()
      st.current = null
      ;['returns', 'top', ...RETURNS.map((r) => `rp-${r.id}`)].forEach((k) => setAnchor(k, null))
    }
  }, [motionOff])

  const go = (i: number) => {
    const s = st.current
    if (!s) return document.querySelectorAll('.day .dstage')[i]?.scrollIntoView()
    scrollToY(i === 0 ? 0 : s.start + ((s.end - s.start) * (FIRST + IN + (i - 1) * (IN + STAY) + 0.12)) / TOTAL)
  }

  return (
    <div className="pinw" ref={wrap}>
    <div className="day" ref={root} data-flow={motionOff} data-stage={stage}>
      <HeroStage ready={ready} />
      <SunStage active={onScreen && stage === 1} near={onScreen && Math.abs(stage - 1) < 2} />
      <RainStage active={onScreen && stage === 2} near={onScreen && Math.abs(stage - 2) < 2} />
      <RootsStage active={onScreen && stage === 3} near={onScreen && Math.abs(stage - 3) < 2} />
      <ReachStage active={onScreen && stage === 4} near={onScreen && Math.abs(stage - 4) < 2} />
      <nav className="arch-nav" aria-label="Four returns" data-on={stage > 0}>
        {RETURNS.map((r, i) => (
          <button key={r.id} type="button" aria-label={r.name} aria-current={stage === i + 1 ? 'step' : undefined} onClick={() => go(i + 1)}>
            <i aria-hidden="true" />
            <span>{r.name}</span>
          </button>
        ))}
      </nav>
    </div>
    </div>
  )
}
