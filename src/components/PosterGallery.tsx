import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../motion/motion'
import { useStore } from '../state/store'

interface Frame {
  src: string
  alt: string
  kind: 'photo' | 'poster'
  cap: string
}

const FRAMES: Frame[] = [
  { src: 'img/x/golden.webp', kind: 'photo', cap: 'Golden hour', alt: 'Concept image: a planted school roof with solar panels and raised beds at sunset.' },
  { src: 'img/x/poster-giving.webp', kind: 'poster', cap: 'Poster 1', alt: 'Campaign poster: The Giving Roof. One school roof, four returns.' },
  { src: 'img/x/beds.webp', kind: 'photo', cap: 'Sunny beds', alt: 'Concept image: raised beds of leafy greens and baskets of herbs along a rooftop walkway.' },
  { src: 'img/x/poster-power.webp', kind: 'poster', cap: 'Poster 2', alt: 'Campaign poster: Power above, life below.' },
  { src: 'img/x/rainwall.webp', kind: 'photo', cap: 'Sealed tank', alt: 'Concept image: a downpipe and a dark green rainwater tank beside a planted bed in the rain.' },
  { src: 'img/x/poster-rain.webp', kind: 'poster', cap: 'Poster 3', alt: 'Campaign poster: Rain with purpose.' },
  { src: 'img/x/poster-gives.webp', kind: 'poster', cap: 'Poster 4', alt: 'Campaign poster: A roof that gives back.' },
]

/** Pinned sideways walk through renders and the four campaign posters. Tap any frame to open it. */
export function PosterGallery() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  const motionOff = useStore((s) => s.motionOff)

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
        scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
      })
      gsap.to('.walk-word', { xPercent: -40, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${dist()}`, scrub: true } })
      gsap.utils.toArray<HTMLElement>('.wf').forEach((f, i) => {
        gsap.fromTo(
          f,
          { scale: 0.78, rotate: i % 2 ? 5 : -5, y: i % 2 ? 60 : -40 },
          { scale: 1, rotate: 0, y: 0, ease: 'none', scrollTrigger: { trigger: f, containerAnimation: tw, start: 'left right', end: 'center center', scrub: true } },
        )
        if (f.classList.contains('wf-photo')) gsap.fromTo(f.querySelector('img'), { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: f, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } })
      })
    })
    return () => mm.revert()
  }, [motionOff])

  useLayoutEffect(() => {
    if (open == null || motionOff) return
    gsap.fromTo('.lightbox img', { scale: 0.6, opacity: 0, rotate: -3 }, { scale: 1, opacity: 1, rotate: 0, duration: 0.8, ease: 'expo.out' })
    gsap.fromTo('.lightbox', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(150% at 50% 50%)', duration: 0.8, ease: 'expo.inOut' })
  }, [open, motionOff])
  useEffect(() => {
    if (open == null) return
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((o) => ((o ?? 0) + 1) % FRAMES.length)
      if (e.key === 'ArrowLeft') setOpen((o) => ((o ?? 0) + FRAMES.length - 1) % FRAMES.length)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open])

  return (
    <section className="walk" id="walk" ref={root} aria-labelledby="walk-title">
      <p className="walk-word" aria-hidden="true">
        Walk the roof
      </p>
      <div className="walk-track" ref={track}>
        <div className="walk-intro">
          <h2 id="walk-title">Walk the roof.</h2>
          <p>Renders and our four campaign posters. Tap any frame.</p>
        </div>
        {FRAMES.map((f, i) => (
          <button key={f.src} type="button" className={`wf wf-${f.kind}`} onClick={() => setOpen(i)} aria-label={`Open: ${f.alt}`}>
            <span className="wf-img">
              <img src={f.src} alt={f.alt} loading="lazy" draggable={false} />
            </span>
            <span className="wf-cap">{f.cap}</span>
          </button>
        ))}
      </div>
      {open != null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={FRAMES[open].cap} onClick={() => setOpen(null)} data-lenis-prevent>
          <img src={FRAMES[open].src} alt={FRAMES[open].alt} onClick={(e) => e.stopPropagation()} />
          <div className="lb-ctrls" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ctl" onClick={() => setOpen((open + FRAMES.length - 1) % FRAMES.length)}>
              Previous
            </button>
            <button type="button" className="ctl" onClick={() => setOpen(null)} autoFocus>
              Close
            </button>
            <button type="button" className="ctl" onClick={() => setOpen((open + 1) % FRAMES.length)}>
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
