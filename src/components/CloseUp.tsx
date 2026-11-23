import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, motionOn } from '../motion/motion'
import { useReveal } from '../motion/useReveal'
import { Split } from './Split'

interface Pin {
  x: number
  y: number
  label: string
  body: string
}
interface Card {
  id: string
  img: string
  alt: string
  title: string
  text: string
  tone: string
  pins: Pin[]
}

const CARDS: Card[] = [
  {
    id: 'roof',
    img: 'roof',
    alt: 'Concept render on the roof wing: an elevated solar canopy on steel posts shades dense low planting, while timber raised beds with herbs and vegetables sit in full sun beside a paved path and rail. The chapel dome is behind.',
    title: 'Shade below. Sun beside.',
    text: 'Shade plants under the panels. Food only in the open, sunny beds.',
    tone: 'var(--leaf)',
    pins: [
      { x: 50, y: 33, label: 'Elevated PV', body: 'Panels high enough for access, maintenance and airflow.' },
      { x: 40, y: 66, label: 'Shade planting', body: 'Low, shade-tolerant greenery beneath the panels.' },
      { x: 82, y: 70, label: 'Sunny beds', body: 'Raised edible beds in open sun, separate from the PV zone.' },
    ],
  },
  {
    id: 'rain',
    img: 'rain',
    alt: 'Concept render in the rain: water runs off the panels into a gutter, down a pipe with a leaf screen and filter, into a sealed blue tank at ground level. A separate blue pipe rises to three toilets, and a grey overflow pipe discharges into a planted rain garden.',
    title: 'A downpour, routed with care.',
    text: 'Flushing supply and overflow are two separate routes. Nothing touches drinking water.',
    tone: 'var(--water)',
    pins: [
      { x: 54, y: 38, label: 'Screen and first flush', body: 'Debris and the dirtiest early runoff are kept out.' },
      { x: 62, y: 76, label: 'Sealed tank', body: 'Closed and mosquito-proof, at ground level.' },
      { x: 80, y: 50, label: 'Flushing only', body: 'A separate labelled non-potable pipe. Not for drinking or handwashing.' },
      { x: 84, y: 88, label: 'Overflow', body: 'Surplus goes to a rain garden, never into the flushing supply.' },
    ],
  },
  {
    id: 'axo',
    img: 'axo',
    alt: 'Isometric cutaway concept of the building: arched façade and dome on the left, the PV canopy and planting on the side wing roof, raised beds at the corner, a switchboard inside, toilets below, a ground tank and a rain garden.',
    title: 'The whole system, cut open.',
    text: 'Every route is its own metered system. That is what makes it measurable.',
    tone: 'var(--blue)',
    pins: [
      { x: 47, y: 25, label: 'PV canopy', body: 'Electricity runs to a separately metered switchboard.' },
      { x: 76, y: 60, label: 'Switchboard', body: 'Where PV generation would be logged.' },
      { x: 64, y: 76, label: 'Tank to cisterns', body: 'Stored rainwater supplies flushing only.' },
    ],
  },
]

export function CloseUp() {
  const root = useRef<HTMLElement>(null)
  const [openPin, setOpenPin] = useState<string | null>(null)
  useReveal(root)
  useLayoutEffect(() => {
    const el = root.current!
    if (!motionOn()) return
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.stack-card')
      cards.forEach((c, i) => {
        if (i === cards.length - 1) return
        gsap.to(c.querySelector('.stack-inner'), {
          scale: 0.92,
          opacity: 0.55,
          ease: 'none',
          scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 15%', scrub: true },
        })
      })
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <section className="closeup" id="closeup" ref={root} aria-labelledby="closeup-title">
      <div className="closeup-head">
        <Split as="h2" id="closeup-title" className="display-2" text="Up close." />
      </div>
      <div className="stack">
        {CARDS.map((c, ci) => (
          <article className="stack-card" key={c.id} style={{ ['--tone' as string]: c.tone, zIndex: ci + 1 }}>
            <div className="stack-inner">
              <figure className="stack-fig" data-tilt>
                <img
                  data-parallax="6"
                  src={`img/${c.img}-${c.img === 'axo' ? 1536 : 1672}.webp`}
                  srcSet={`img/${c.img}-960.webp 960w, img/${c.img}-${c.img === 'axo' ? 1536 : 1672}.webp ${c.img === 'axo' ? 1536 : 1672}w`}
                  sizes="(max-width: 900px) 100vw, 64vw"
                  alt={c.alt}
                  loading="lazy"
                />
                {c.pins.map((p) => {
                  const key = `${c.id}-${p.label}`
                  return (
                    <button
                      key={key}
                      type="button"
                      className="pin"
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      aria-expanded={openPin === key}
                      onClick={() => setOpenPin(openPin === key ? null : key)}
                      data-right={p.x > 66}
                    >
                      <span className="pin-dot" aria-hidden="true" />
                      <span className="pin-label">{p.label}</span>
                      <span className="pin-body">{p.body}</span>
                    </button>
                  )
                })}
                <figcaption>Concept image generated for Group 11A. Not an engineering drawing.</figcaption>
              </figure>
              <div className="stack-copy">
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
