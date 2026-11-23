import { useEffect } from 'react'
import { gsap, motionOn, ScrollTrigger } from './motion'

/**
 * Page-wide effects: magnetic buttons, a scroll progress line,
 * and pointer tilt on anything marked data-tilt.
 */
export function useGlobalFx() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const onMove = (e: PointerEvent) => {
      if (!fine || !motionOn()) return
      const t = e.target as HTMLElement
      const mag = t.closest<HTMLElement>('.btn, .magnetic')
      document.querySelectorAll<HTMLElement>('[data-mag-on]').forEach((m) => {
        if (m !== mag) {
          m.removeAttribute('data-mag-on')
          gsap.to(m, { x: 0, y: 0, duration: 0.7, ease: 'power3.out' })
        }
      })
      if (mag) {
        const r = mag.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        mag.setAttribute('data-mag-on', '')
        gsap.to(mag, { x: dx * 0.28, y: dy * 0.4, duration: 0.5, ease: 'power3.out' })
      }
      const tilt = t.closest<HTMLElement>('[data-tilt]')
      document.querySelectorAll<HTMLElement>('[data-tilt-on]').forEach((m) => {
        if (m !== tilt) {
          m.removeAttribute('data-tilt-on')
          gsap.to(m, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'power3.out' })
        }
      })
      if (tilt) {
        const r = tilt.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        tilt.setAttribute('data-tilt-on', '')
        gsap.to(tilt, { rotateY: px * 7, rotateX: -py * 6, transformPerspective: 1100, duration: 0.6, ease: 'power3.out' })
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const bar = document.querySelector<HTMLElement>('.progress i')
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (bar) bar.style.transform = `scaleX(${self.progress})`
      },
    })
    return () => {
      window.removeEventListener('pointermove', onMove)
      st.kill()
    }
  }, [])
}
