import { useEffect, useRef, useState } from 'react'
import { gsap } from '../motion/motion'
import { useStore } from '../state/store'

/** Short branded intro (about 1.5 s). Waits for the hero image, never longer than 3 s. */
export function Loader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)
  // failsafe on a plain timer: the intro can never block the page
  useEffect(() => {
    const t = setTimeout(() => {
      setGone(true)
      onDone()
    }, 4500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const off = useStore.getState().motionOff
    const img = new Image()
    img.src = 'img/day/hero-day.webp'
    const loaded = new Promise<void>((res) => {
      if (img.complete) res()
      img.onload = img.onerror = () => res()
      setTimeout(res, 3000)
    })
    if (off) {
      loaded.then(() => {
        setGone(true)
        onDone()
      })
      return
    }
    const tl = gsap.timeline()
    tl.from(el.querySelector('.ld-logo'), { y: 16, opacity: 0, duration: 0.7, ease: 'power3.out' })
      .from(el.querySelectorAll('.ld-word .wi'), { yPercent: 110, duration: 0.8, ease: 'expo.out', stagger: 0.06 }, 0.15)
      .fromTo(el.querySelector('.ld-bar i'), { scaleX: 0 }, { scaleX: 0.7, duration: 0.9, ease: 'power2.out' }, 0.1)
    Promise.all([loaded, new Promise((r) => setTimeout(r, 1150))]).then(() => {
      gsap
        .timeline({
          onComplete: () => {
            setGone(true)
          },
        })
        .to(el.querySelector('.ld-bar i'), { scaleX: 1, duration: 0.35, ease: 'power2.inOut' })
        .to(el.querySelectorAll('.ld-inner > *'), { y: -24, opacity: 0, duration: 0.45, ease: 'power2.in', stagger: 0.04 })
        .add(() => onDone(), '-=0.1')
        .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.95, ease: 'expo.inOut' }, '-=0.15')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (gone) return null
  return (
    <div className="loader" ref={ref} aria-hidden="true">
      <div className="ld-inner">
        <div className="ld-logo">
          <img src="img/sji-logo.png" alt="" width={738} height={237} />
        </div>
        <p className="ld-word">
          {'The Giving Roof'.split(' ').map((w) => (
            <span className="w" key={w}>
              <span className="wi">{w}</span>
            </span>
          ))}
        </p>
        <div className="ld-bar">
          <i />
        </div>
      </div>
    </div>
  )
}
