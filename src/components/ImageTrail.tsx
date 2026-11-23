import { useEffect, useRef } from 'react'
import { gsap, motionOn } from '../motion/motion'

const IMGS = ['canopy', 'beds', 'rainwall', 'sunset', 'golden', 'v-sun', 'v-rain', 'v-roots', 'v-reach', 'poster-power', 'poster-rain', 'poster-gives']

/** Images spill out behind the cursor (or drift on their own on touch screens). */
export function ImageTrail({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const layer = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = target.current
    const lay = layer.current
    if (!host || !lay) return
    const pool = Array.from(lay.children) as HTMLElement[]
    let k = 0
    let last = { x: -999, y: -999 }
    let z = 1
    const spawn = (x: number, y: number) => {
      if (!motionOn()) return
      const el = pool[k % pool.length]
      k++
      z++
      gsap.killTweensOf(el)
      gsap.set(el, { x, y, xPercent: -50, yPercent: -50, zIndex: z, opacity: 1, scale: 0.3, rotate: gsap.utils.random(-14, 14) })
      gsap.timeline()
        .to(el, { scale: 1, duration: 0.6, ease: 'expo.out' })
        .to(el, { opacity: 0, scale: 0.7, y: y + 60, duration: 0.8, ease: 'power3.in' }, 0.55)
    }
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      if (Math.hypot(x - last.x, y - last.y) > 110) {
        last = { x, y }
        spawn(x, y)
      }
    }
    host.addEventListener('pointermove', move)
    // touch screens: a slow automatic loop while the section is on screen
    let timer = 0
    let t = 0
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(timer)
      if (e.isIntersecting && coarse) {
        timer = window.setInterval(() => {
          t += 0.7
          const r = host.getBoundingClientRect()
          spawn(r.width * (0.5 + Math.sin(t) * 0.35), r.height * (0.5 + Math.cos(t * 1.3) * 0.3))
        }, 650)
      }
    })
    io.observe(host)
    return () => {
      host.removeEventListener('pointermove', move)
      io.disconnect()
      window.clearInterval(timer)
    }
  }, [target])
  return (
    <div className="trail" ref={layer} aria-hidden="true">
      {IMGS.map((s) => (
        <img key={s} src={`img/x/${s}.webp`} alt="" loading="lazy" />
      ))}
    </div>
  )
}
