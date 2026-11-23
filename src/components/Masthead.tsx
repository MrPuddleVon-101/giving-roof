import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useStore } from '../state/store'
import { gsap, motionOn, scrollToId, ScrollTrigger } from '../motion/motion'
import { Ext } from './Icons'

const NAV = [
  { id: 'returns', label: 'Returns', img: 'img/x/canopy.webp' },
  { id: 'walk', label: 'Walk the roof', img: 'img/hero-960.webp' },
  { id: 'explorer', label: '3D', img: 'img/axo-960.webp' },
  { id: 'goals', label: 'Global Goals', img: 'img/x/sunset.webp' },
  { id: 'research', label: 'Evidence', img: 'img/x/rainwall.webp' },
]

/**
 * Floating rounded nav. Scrolling down folds every item back into the round
 * SJI International crest; tap or hover the crest to unfold it. A ring around
 * the crest fills with scroll progress.
 */
export function Masthead() {
  const pill = useRef<HTMLDivElement>(null)
  const ring = useRef<SVGCircleElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [preview, setPreview] = useState(0)
  const [ind, setInd] = useState({ x: 0, w: 0, on: false })
  const motionOff = useStore((s) => s.motionOff)
  const setMotionOff = useStore((s) => s.setMotionOff)
  const setSourcesOpen = useStore((s) => s.setSourcesOpen)

  // fold: items slide into the crest, the bar shrinks to a circle
  useLayoutEffect(() => {
    const el = pill.current!
    const ctx = gsap.context(() => {
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
        .to('.pill-item', { x: -40, opacity: 0, scale: 0.6, stagger: { each: 0.03, from: 'end' }, duration: 0.4, ease: 'power3.in' })
        .to('.pill-body', { width: 0, duration: 0.6 }, 0.15)
        .to(el, { paddingRight: 0, duration: 0.6 }, 0.15)
        .to('.crest-orb', { scale: 1.12, duration: 0.6 }, 0.2)
    }, el)
    return () => ctx.revert()
  }, [])

  // scroll direction + progress ring
  useEffect(() => {
    let last = window.scrollY
    const on = () => {
      const y = window.scrollY
      if (y < 140) setCollapsed(false)
      else if (y > last + 6) {
        setCollapsed(true)
        setPinned(false)
      }
      else if (y < last - 10) setCollapsed(false)
      last = y
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    const C = 2 * Math.PI * 27
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => {
        if (ring.current) ring.current.style.strokeDashoffset = `${C * (1 - s.progress)}`
      },
    })
    return () => {
      window.removeEventListener('scroll', on)
      st.kill()
    }
  }, [])

  useEffect(() => {
    const t = tl.current
    if (!t) return
    const fold = collapsed && !hover && !pinned && !open
    if (!motionOn()) t.progress(fold ? 1 : 0)
    else if (fold) t.timeScale(1).play()
    else t.timeScale(1.3).reverse()
  }, [collapsed, hover, pinned, open])

  // which section is on screen
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    NAV.forEach((n) => {
      const el = document.getElementById(n.id)
      if (el) io.observe(el)
    })
    const top = document.getElementById('top')
    if (top) io.observe(top)
    return () => io.disconnect()
  }, [])

  // sliding highlight under the active link
  useLayoutEffect(() => {
    const box = linksRef.current
    const a = box?.querySelector<HTMLElement>(`[data-id="${active}"]`)
    if (!box || !a) return setInd((i) => ({ ...i, on: false }))
    setInd({ x: a.offsetLeft, w: a.offsetWidth, on: true })
  }, [active, collapsed])

  // full-screen menu
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (!open || !motionOn()) return
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo('.menu-sheet', { clipPath: 'circle(0% at 50% 40px)' }, { clipPath: 'circle(150% at 50% 40px)', duration: 0.9, ease: 'expo.inOut' })
        .from('.menu-links .ml-in', { yPercent: 110, duration: 0.9, stagger: 0.06, ease: 'expo.out' }, 0.35)
        .from('.menu-preview', { clipPath: 'circle(0% at 50% 50%)', duration: 1, ease: 'expo.inOut' }, 0.3)
        .from('.menu-foot > *', { y: 20, opacity: 0, stagger: 0.05, duration: 0.6, ease: 'power3.out' }, 0.6)
    })
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', key)
    return () => {
      ctx.revert()
      window.removeEventListener('keydown', key)
    }
  }, [open])

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setOpen(false)
    setPinned(false)
    scrollToId(id)
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <header className="masthead2">
      <div
        ref={pill}
        className={`pill${collapsed ? ' is-folded' : ''}`}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <button
          type="button"
          className="crest-orb"
          aria-label={collapsed && !pinned ? 'Open navigation' : 'Back to top'}
          onClick={(e) => {
            if (collapsed && !pinned && !hover) {
              setPinned(true)
              return
            }
            go(e, 'top')
          }}
        >
          <svg className="orb-ring" viewBox="0 0 60 60" aria-hidden="true">
            <circle cx="30" cy="30" r="27" className="ring-bg" />
            <circle ref={ring} cx="30" cy="30" r="27" className="ring-fg" strokeDasharray={2 * Math.PI * 27} />
          </svg>
          <img src="img/sji-crest.png" alt="" width={170} height={237} />
        </button>
        <div className="pill-body">
          <span className="pill-item pill-title">The Giving Roof</span>
          <div className="pill-links" ref={linksRef}>
            <span className="pill-ind" aria-hidden="true" style={{ transform: `translateX(${ind.x}px)`, width: ind.w, opacity: ind.on ? 1 : 0 }} />
            {NAV.map((n) => (
              <a key={n.id} data-id={n.id} className="pill-item" href={`#${n.id}`} onClick={(e) => go(e, n.id)} aria-current={active === n.id ? 'true' : undefined}>
                {n.label}
              </a>
            ))}
          </div>
          <button type="button" className="pill-item pill-ico" aria-pressed={motionOff} onClick={() => setMotionOff(!motionOff)} aria-label={motionOff ? 'Resume motion' : 'Pause motion'} title={motionOff ? 'Resume motion' : 'Pause motion'}>
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              {motionOff ? <path d="M3 1.5v9l7-4.5z" fill="currentColor" /> : <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" fill="currentColor" />}
            </svg>
          </button>
          <button type="button" className={`pill-item pill-menu${open ? ' x' : ''}`} aria-expanded={open} aria-controls="menu-sheet" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            <i />
            <i />
          </button>
        </div>
      </div>

      {open && (
        <div className="menu-sheet" id="menu-sheet" role="dialog" aria-modal="true" aria-label="Site menu" data-lenis-prevent>
          <ul className="menu-links">
            {NAV.map((n, i) => (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={(e) => go(e, n.id)} onPointerEnter={() => setPreview(i)} onFocus={() => setPreview(i)}>
                  <span className="ml-in">{n.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <figure className="menu-preview" aria-hidden="true">
            {NAV.map((n, i) => (
              <img key={n.id} src={n.img} alt="" data-on={preview === i} />
            ))}
          </figure>
          <div className="menu-foot">
            <button type="button" className="ctl" onClick={() => { setOpen(false); setSourcesOpen(true) }}>
              Sources
            </button>
            <button type="button" className="ctl" aria-pressed={motionOff} onClick={() => setMotionOff(!motionOff)}>
              {motionOff ? 'Resume motion' : 'Pause motion'}
            </button>
            <a className="ctl" href="https://www.sji-international.com.sg/giving/building-futures" target="_blank" rel="noopener noreferrer">
              School&rsquo;s planned campus <Ext />
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
