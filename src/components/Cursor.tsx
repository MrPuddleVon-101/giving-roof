import { useEffect, useRef } from 'react'
import { useStore } from '../state/store'

/** Solid green circle that trails the pointer and grows over anything interactive. Fine pointers only. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    document.documentElement.classList.add('has-cursor')
    const p = { x: innerWidth / 2, y: innerHeight / 2 }
    const r = { x: p.x, y: p.y, s: 1 }
    let target = 1
    let raf = 0
    let shown = false
    const move = (e: PointerEvent) => {
      p.x = e.clientX
      p.y = e.clientY
      if (!shown) {
        shown = true
        r.x = p.x
        r.y = p.y
        document.documentElement.classList.add('cursor-in')
      }
      const t = e.target as HTMLElement
      const drag = t.closest('[data-cursor="drag"]')
      const hit = t.closest('a, button, [role="tab"], summary, label, input, select, [data-cursor="hover"]')
      const lens = t.closest('[data-cursor="lens"]')
      target = lens ? 0 : drag && !hit ? 2.6 : hit ? 2.4 : 1
      ring.current!.dataset.mode = lens ? 'lens' : drag && !hit ? 'drag' : hit ? 'hover' : ''
      if (label.current) label.current.textContent = drag && !hit ? 'Drag' : ''
    }
    const leave = () => document.documentElement.classList.remove('cursor-in')
    const enter = () => document.documentElement.classList.add('cursor-in')
    const down = () => ring.current?.classList.add('down')
    const up = () => ring.current?.classList.remove('down')
    const loop = () => {
      const k = useStore.getState().motionOff ? 1 : 0.18
      r.x += (p.x - r.x) * k
      r.y += (p.y - r.y) * k
      r.s += (target - r.s) * (useStore.getState().motionOff ? 1 : 0.2)
      if (dot.current) dot.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
      if (ring.current) ring.current.style.transform = `translate3d(${r.x}px, ${r.y}px, 0) scale(${r.s})`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.addEventListener('pointerleave', leave)
    document.addEventListener('pointerenter', enter)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.removeEventListener('pointerleave', leave)
      document.removeEventListener('pointerenter', enter)
      document.documentElement.classList.remove('has-cursor', 'cursor-in')
    }
  }, [])
  return (
    <>
      <div className="cursor-ring" ref={ring} aria-hidden="true">
        <span ref={label} />
      </div>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
    </>
  )
}
