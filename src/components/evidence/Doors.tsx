import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, motionOn } from '../../motion/motion'

/** Eight arched doors, one for each thing nobody can know before a study on site. */
export function Doors({ items, onSources }: { items: { title: string; body: string }[]; onSources: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  useLayoutEffect(() => {
    if (!motionOn()) return
    const ctx = gsap.context(() => {
      // a knock: every door swings ajar and shuts again, left to right
      gsap.fromTo(
        '.door-leaf',
        { '--knock': 0 },
        { '--knock': -34, duration: 0.55, stagger: 0.09, yoyo: true, repeat: 1, ease: 'power2.inOut', scrollTrigger: { trigger: root.current!, start: 'top 55%', once: true } },
      )
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <div className="doors" ref={root}>
      <div className="doors-head">
        <h3>Eight doors still closed.</h3>
        <p>Unknown until someone studies the real roof.</p>
      </div>
      <ul className="doors-row">
        {items.map((u, i) => (
          <li key={u.title}>
            <button type="button" className="door" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(i)} onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(null)} onFocus={(e) => e.currentTarget.matches(':focus-visible') && setOpen(i)}>
              <span className="door-in">{u.body}</span>
              <span className="door-leaf" aria-hidden="true">
                <i />
              </span>
            </button>
            <p className="door-name">{u.title}</p>
          </li>
        ))}
      </ul>
      <button type="button" className="btn-link" onClick={onSources}>
        Open all sources
      </button>
    </div>
  )
}
