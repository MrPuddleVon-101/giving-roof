import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useStore } from '../state/store'
import { anchorY, gsap, motionOn, scrollToId, scrollToY } from '../motion/motion'
import { Ext } from './Icons'

const NAV = [
  { id: 'returns', label: 'Returns', img: 'img/roof-960.webp' },
  { id: 'walk', label: 'Walk the roof', img: 'img/x/golden.webp' },
  { id: 'explorer', label: '3D model', img: 'img/axo-960.webp' },
  { id: 'goals', label: 'Global Goals', img: 'img/x/sunset.webp' },
  { id: 'research', label: 'Evidence', img: 'img/x/canopy.webp' },
  { id: 'next', label: 'The year', img: 'img/x/beds.webp' },
]
const LEFT = NAV.slice(0, 3)
const RIGHT = NAV.slice(3)
const TICKS = Array.from({ length: 60 }, (_, i) => i)
// clock angles for the dial menu: three down the left, three down the right
const ANG = [-58, -90, -122, 58, 90, 122]

/**
 * The crest is the centre of a sundial. Links open out of it to both sides and
 * fold back into it on the way down; the dial fills as you read. Pressing the
 * crest opens the full dial.
 */
export function Masthead() {
  const root = useRef<HTMLElement>(null)
  const dial = useRef<SVGSVGElement>(null)
  const [folded, setFolded] = useState(false)
  const [hover, setHover] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('top')
  const [pick, setPick] = useState(0)
  const motionOff = useStore((s) => s.motionOff)
  const setMotionOff = useStore((s) => s.setMotionOff)
  const setSourcesOpen = useStore((s) => s.setSourcesOpen)
  const shut = folded && !hover && !open
  const crest = useRef<HTMLButtonElement>(null)

  // scroll: direction folds the bar, progress fills the dial, position marks the section
  useEffect(() => {
    let last = window.scrollY
    let raf = 0
    const read = () => {
      raf = 0
      const y = window.scrollY
      if (y < 120) setFolded(false)
      else if (y > last + 4) setFolded(true)
      else if (y < last - 8) setFolded(false)
      last = y
      const p = y / Math.max(1, document.documentElement.scrollHeight - innerHeight)
      const d = dial.current
      if (d) {
        const n = Math.round(p * 60)
        d.querySelectorAll('line').forEach((l, i) => l.toggleAttribute('data-on', i < n))
        d.querySelector('g')!.setAttribute('transform', `rotate(${p * 360} 50 50)`)
      }
      let cur = 'top'
      for (const n of NAV) {
        const a = anchorY(n.id)
        if (a != null && a <= y + innerHeight * 0.4) cur = n.id
      }
      setActive(cur)
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', on, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
    }
  }, [])

  // dial menu: the disc opens from the crest, ticks run round, names swing out
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (!open) return
    const i = NAV.findIndex((n) => n.id === active)
    setPick(i < 0 ? 0 : i)
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        crest.current?.focus()
      }
    }
    window.addEventListener('keydown', key)
    const ctx = gsap.context(() => {
      if (!motionOn()) return
      gsap
        .timeline()
        .fromTo('.dial', { clipPath: 'circle(0px at 50% 52px)' }, { clipPath: 'circle(150vmax at 50% 52px)', duration: 1, ease: 'expo.inOut' })
        .fromTo('.dial-ring line', { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: { each: 0.012 } }, 0.4)
        .fromTo('.dial-disc', { scale: 0.2, rotate: -70 }, { scale: 1, rotate: 0, duration: 1.1, ease: 'expo.out' }, 0.35)
        .fromTo('.dial-item > *', { xPercent: (k: number) => (k < 3 ? 60 : -60), opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'expo.out' }, 0.55)
        .fromTo('.dial-foot', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.9)
    }, root)
    return () => {
      ctx.revert()
      window.removeEventListener('keydown', key)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setOpen(false)
    if (id === 'top') scrollToY(0)
    else scrollToId(id)
    history.replaceState(null, '', `#${id}`)
  }

  const link = (n: (typeof NAV)[number], k: number) => (
    <a key={n.id} href={`#${n.id}`} onClick={(e) => go(e, n.id)} aria-current={active === n.id ? 'true' : undefined} tabIndex={shut ? -1 : undefined} style={{ ['--k' as string]: k }}>
      <span data-t={n.label}>{n.label}</span>
    </a>
  )

  return (
    <header className="mast3" ref={root} data-shut={shut} data-open={open} onPointerLeave={() => setHover(false)}>
      <div className="mast-bar" onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}>
        <nav className="mast-side l" aria-label="Sections, first half">{LEFT.map((n, i) => link(n, 2 - i))}</nav>
        <nav className="mast-side r" aria-label="Sections, second half">
          {RIGHT.map((n, i) => link(n, i))}
          <button type="button" className="mast-pause" aria-pressed={motionOff} onClick={() => setMotionOff(!motionOff)} tabIndex={shut ? -1 : undefined} aria-label={motionOff ? 'Resume motion' : 'Pause motion'} title={motionOff ? 'Resume motion' : 'Pause motion'} style={{ ['--k' as string]: 3 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              {motionOff ? <path d="M3 1.5v9l7-4.5z" fill="currentColor" /> : <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" fill="currentColor" />}
            </svg>
          </button>
        </nav>
      </div>
      <button ref={crest} type="button" className="mast-crest" aria-expanded={open} aria-controls="dial" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)} onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}>
        <svg ref={dial} viewBox="0 0 100 100" aria-hidden="true">
          {TICKS.map((i) => (
            <line key={i} x1="50" y1="2.5" x2="50" y2={i % 5 ? 7 : 9.5} transform={`rotate(${i * 6} 50 50)`} />
          ))}
          <g>
            <circle cx="50" cy="6" r="4.6" />
          </g>
        </svg>
        <img src="img/sji-crest.png" alt="" width={170} height={237} />
        <i aria-hidden="true" />
      </button>

      {open && (
        <div className="dial" id="dial" role="dialog" aria-modal="true" aria-label="Site menu" data-lenis-prevent>
          <div className="dial-face">
            <svg className="dial-ring" viewBox="-100 -100 200 200" aria-hidden="true">
              {TICKS.map((i) => (
                <line key={i} x1="0" y1="-98" x2="0" y2={i % 5 ? -93 : -89} transform={`rotate(${i * 6})`} />
              ))}
              <g style={{ transform: `rotate(${ANG[pick]}deg)` }}>
                <circle cy="-94" r="5.5" />
                <path d="M0 -84 V-79" />
              </g>
            </svg>
            <div className="dial-disc" aria-hidden="true">
              {NAV.map((n, i) => (
                <img key={n.id} src={n.img} alt="" data-on={pick === i} />
              ))}
            </div>
            {NAV.map((n, i) => (
              <div key={n.id} className={`dial-item ${i < 3 ? 'l' : 'r'}`} style={{ ['--a' as string]: `${ANG[i]}deg` }}>
                <a href={`#${n.id}`} onClick={(e) => go(e, n.id)} onPointerEnter={() => setPick(i)} onFocus={() => setPick(i)} data-on={pick === i}>
                  {n.label}
                </a>
              </div>
            ))}
          </div>
          <div className="dial-foot">
            <button type="button" onClick={(e) => go(e, 'top')}>Back to the top</button>
            <button type="button" onClick={() => { setOpen(false); setSourcesOpen(true) }}>Sources</button>
            <button type="button" aria-pressed={motionOff} onClick={() => setMotionOff(!motionOff)}>{motionOff ? 'Resume motion' : 'Pause motion'}</button>
            <a href="https://www.sji-international.com.sg/giving/building-futures" target="_blank" rel="noopener noreferrer">
              Learn about the school&rsquo;s planned new campus <Ext />
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
