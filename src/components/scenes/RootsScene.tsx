import { useEffect, useRef, useState } from 'react'
import { useInView } from './util'

// Spotlight zones on the real roof render (1672 x 941): pick a zone and the rest dims.

const ZONES = [
  { id: 'shade', label: 'Shade planting', note: 'Under the panels', d: 'M385 478 L1290 430 L1240 525 L960 700 L560 735 L380 560 Z', at: [760, 600] },
  { id: 'beds', label: 'Edible beds', note: 'In full sun, if approved', d: 'M1090 705 L1300 540 L1655 498 L1650 610 L1565 925 L1095 835 Z', at: [1400, 690] },
  { id: 'pv', label: 'Solar canopy', note: 'Above, on posts', d: 'M335 447 L900 318 L1378 280 L975 468 Z', at: [860, 380] },
] as const

type ZoneId = (typeof ZONES)[number]['id']

export function RootsScene() {
  const box = useRef<HTMLDivElement>(null)
  const inView = useInView(box)
  const [zone, setZone] = useState<ZoneId>('shade')
  const touched = useRef(false)
  const [lens, setLens] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  // cycles on its own until someone picks a zone
  useEffect(() => {
    if (!inView) return
    const id = window.setInterval(() => {
      if (touched.current) return
      setZone((z) => (z === 'shade' ? 'beds' : z === 'beds' ? 'pv' : 'shade'))
    }, 2600)
    return () => window.clearInterval(id)
  }, [inView])

  const z = ZONES.find((x) => x.id === zone)!
  return (
    <div className="scene photo-scene">
      <div
        ref={box}
        className="ps-frame"
        data-cursor="lens"
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse') return
          const r = box.current!.getBoundingClientRect()
          setLens({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height })
        }}
        onPointerLeave={() => setLens(null)}
      >
        <img src="img/roof-1672.webp" srcSet="img/roof-960.webp 960w, img/roof-1672.webp 1672w" sizes="(max-width: 900px) 100vw, 55vw" alt="Concept render of the roof wing: low shade-loving plants under an elevated solar canopy, with timber raised beds of herbs and vegetables in full sun beside the path." />
        <svg className="ps-over" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <mask id="spot">
              <rect width="1672" height="941" fill="white" />
              <path d={z.d} fill="black" className="spot-hole" />
            </mask>
          </defs>
          <rect width="1672" height="941" fill="rgba(12,22,40,0.62)" mask="url(#spot)" className="spot-dim" />
          <path key={zone} d={z.d} className="spot-line" pathLength={1} />
          <g className="spot-tag" key={`t-${zone}`} transform={`translate(${z.at[0]} ${z.at[1]})`}>
            <text className="t1" textAnchor="middle">{z.label}</text>
            <text className="t2" y="44" textAnchor="middle">{z.note}</text>
          </g>
        </svg>
        {lens && (
          <div
            className="loupe"
            aria-hidden="true"
            style={{
              left: lens.x,
              top: lens.y,
              backgroundSize: `${lens.w * 2.6}px ${lens.h * 2.6}px`,
              backgroundPosition: `${-lens.x * 2.6 + 90}px ${-lens.y * 2.6 + 90}px`,
            }}
          />
        )}
        {!lens && <span className="ps-hint">Hover to look closer</span>}
      </div>
      <div className="scene-ctrls" role="group" aria-label="Highlight a zone">
        {ZONES.map((x) => (
          <button
            key={x.id}
            type="button"
            className="ctl"
            aria-pressed={zone === x.id}
            onClick={() => {
              touched.current = true
              setZone(x.id)
            }}
          >
            {x.label}
          </button>
        ))}
      </div>
    </div>
  )
}
