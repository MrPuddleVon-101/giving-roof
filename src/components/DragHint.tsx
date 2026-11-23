import { useEffect, useState } from 'react'

/** "Drag to orbit" cue over the model. Disappears for good on the first touch. */
export function DragHint({ active }: { active: boolean }) {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    if (gone) return
    const off = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('.canvas-wrap')) setGone(true)
    }
    window.addEventListener('pointerdown', off)
    return () => window.removeEventListener('pointerdown', off)
  }, [gone])
  if (gone) return null
  return (
    <div className={`draghint${active ? ' on' : ''}`} aria-hidden="true">
      <span className="dh-dot" />
      <span className="dh-label">Drag to orbit</span>
    </div>
  )
}
