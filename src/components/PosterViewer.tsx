import { useRef, useState } from 'react'
import { useReveal } from '../motion/useReveal'
import { Split } from './Split'
import { Ext } from './Icons'

/** The academic poster with a magnifying lens (mouse) or tap-to-zoom (touch). */
export function PosterViewer() {
  const root = useRef<HTMLElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const [lens, setLens] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [zoomed, setZoomed] = useState(false)
  useReveal(root)
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const r = frame.current!.getBoundingClientRect()
    setLens({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height })
  }
  const Z = 3.2
  return (
    <section className="poster" id="poster" ref={root} aria-labelledby="poster-title">
      <div className="poster-head">
        <Split as="h2" id="poster-title" className="display-2" text="The academic poster." />
        <p className="lede">Where it all started. Hover to read through the lens.</p>
        <a className="btn-link" href="img/poster-3000.webp" target="_blank" rel="noopener noreferrer">
          Open full size <Ext />
        </a>
      </div>
      <div
        className={`poster-frame${zoomed ? ' zoomed' : ''}`}
        ref={frame}
        data-cursor="lens"
        data-reveal="clip"
        onPointerMove={move}
        onPointerLeave={() => setLens(null)}
        onClick={(e) => {
          if ((e.nativeEvent as PointerEvent).pointerType !== 'mouse') setZoomed(!zoomed)
        }}
      >
        <img
          src="img/poster-1400.webp"
          srcSet="img/poster-1400.webp 1400w, img/poster-3000.webp 3000w"
          sizes="(max-width: 900px) 100vw, 90vw"
          alt="Group 11A academic poster, The Giving Roof. Sections: what it is, why it matters, Singapore rainfall, the connected campus system, a labelled concept drawing, research at Alexandra Primary School, the implementation timeline, expected impact (220 to 250 MWh per year solar, about 1,480 cubic metres per year rain, both illustrative), water precedent and references."
          loading="lazy"
        />
        {lens && (
          <div
            className="lens"
            aria-hidden="true"
            style={{
              left: lens.x,
              top: lens.y,
              backgroundImage: 'url(img/poster-3000.webp)',
              backgroundSize: `${lens.w * Z}px ${lens.h * Z}px`,
              backgroundPosition: `${-lens.x * Z + 120}px ${-lens.y * Z + 120}px`,
            }}
          />
        )}
      </div>
    </section>
  )
}
