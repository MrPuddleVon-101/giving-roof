import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useReveal } from '../motion/useReveal'
import { gsap, motionOn } from '../motion/motion'
import { Split } from './Split'
import { Ext } from './Icons'

const VALUES = [
  { name: 'Faith', link: 'Care for creation', how: 'Sun, rain and soil treated as gifts, not waste.', ret: 'All four' },
  { name: 'Service', link: 'Reach', how: 'Verified savings could fund bursaries, if approved.', ret: 'Reach' },
  { name: 'Community', link: 'Reach and Roots', how: 'Students, facilities and canteen run it together.', ret: 'Reach, Roots' },
  { name: 'Excellence', link: 'Learning by measuring', how: 'Real meters, honest reports, even the misses.', ret: 'Sunlight, Rain' },
  { name: 'Respect', link: 'Shared resources', how: 'Every litre and kWh used with care.', ret: 'Rain, Roots' },
]

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/** Departures-board letters that settle into the word when scrolled into view. */
function Flap({ word }: { word: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [text, setText] = useState(word)
  useEffect(() => {
    const el = ref.current
    if (!el || !motionOn()) return
    let raf = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const run = () => {
          const t = (performance.now() - start) / 900
          const out = word
            .split('')
            .map((ch, i) => (t > (i + 1) / word.length ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
            .join('')
          setText(out)
          if (t < 1) raf = requestAnimationFrame(run)
          else setText(word)
        }
        raf = requestAnimationFrame(run)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [word])
  return (
    <span ref={ref} className="flap" aria-label={word}>
      {text.split('').map((c, i) => (
        <span key={i} aria-hidden="true">
          {c}
        </span>
      ))}
    </span>
  )
}

export function Values() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)
  useLayoutEffect(() => {
    const el = root.current!
    if (!motionOn()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.arches', { scaleY: 0.05 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 55%', scrub: true } })
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <section className="values" id="values" ref={root} aria-labelledby="values-title">
      <svg className="arches" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 120 V70 A50 50 0 0 1 100 70 A50 50 0 0 1 200 70 A50 50 0 0 1 300 70 A50 50 0 0 1 400 70 A50 50 0 0 1 500 70 A50 50 0 0 1 600 70 A50 50 0 0 1 700 70 A50 50 0 0 1 800 70 A50 50 0 0 1 900 70 A50 50 0 0 1 1000 70 A50 50 0 0 1 1100 70 A50 50 0 0 1 1200 70 V120 Z" />
      </svg>
      <div className="values-head">
        <p className="values-vision">The school&rsquo;s vision</p>
        <Split as="h2" id="values-title" className="display-1" text="To Learn, Inspire and Serve." />
        <div className="values-lede" data-reveal="rise">
          <p>A Lasallian roof: built to teach, and to serve people beyond it.</p>
          <p className="fine">
            <i>Ora et Labora</i>, pray and work, from the crest. Resilience is a design benefit, not one of the five listed values.
          </p>
        </div>
      </div>
      <div className="board" data-reveal="rise" role="table" aria-label="How the roof connects to the school's five values">
        {VALUES.map((v) => (
          <div className="board-row" role="row" key={v.name} tabIndex={0}>
            <span role="cell" className="board-value">
              <Flap word={v.name.toUpperCase()} />
            </span>
            <span role="cell" className="board-how">
              <strong>{v.link}.</strong> {v.how}
            </span>
            <span role="cell" className="board-ret">
              {v.ret}
            </span>
          </div>
        ))}
      </div>
      <p className="values-src">
        Vision and values as listed by the school.{' '}
        <a href="https://www.sji-international.com.sg/about/vision-mission-values" target="_blank" rel="noopener noreferrer">
          SJI International: Vision, Mission and Values <Ext />
        </a>
      </p>
    </section>
  )
}
