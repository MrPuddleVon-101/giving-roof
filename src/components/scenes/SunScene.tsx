import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { useInView, useLoop, clamp } from './util'

// Real render, live light. Scrub through a day (or drag the sun): the roof
// brightens, the cable carries more, and the day's output curve draws itself.
// A passing cloud dips it. Relative and illustrative only: no units, no data.

const HOURS = [7, 9, 11, 13, 15, 17, 19]
const t2clock = (t: number) => {
  const h = 6.5 + t * 13
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60 / 15) * 15
  return `${String(hh).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`
}

export function SunScene() {
  const box = useRef<HTMLDivElement>(null)
  const inView = useInView(box)
  const [t, setT] = useState(0.15)
  const [touched, setTouched] = useState(false)
  const drag = useRef(false)
  const [dash, setDash] = useState(0)
  const [cloud, setCloud] = useState(-1) // -1 idle, else 0..1 progress across the frame
  const hist = useRef<number[]>([])

  useLoop(inView, (dt) => {
    if (!touched && !drag.current) setT((v) => (v + dt * 0.07) % 1)
    setDash((d) => d - dt * 80 * out)
    setCloud((c) => (c < 0 ? c : c + dt * 0.28 > 1.25 ? -1 : c + dt * 0.28))
  })

  const sunE = Math.max(0, Math.sin(Math.PI * t))
  const shade = cloud >= 0 ? Math.max(0, 1 - Math.abs(cloud - 0.55) * 2.6) : 0
  const out = sunE * (1 - shade * 0.75)

  // record the curve as the day advances
  const bucket = Math.round(t * 60)
  hist.current[bucket] = out
  if (bucket === 0) hist.current = [out]
  const curve = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i <= bucket; i++) {
      const v = hist.current[i]
      if (v == null) continue
      pts.push(`${(i / 60) * 300},${70 - v * 60}`)
    }
    return pts.length > 1 ? `M${pts.join(' L')}` : ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket, out])

  const setFrom = (ev: PointerEvent) => {
    const r = box.current!.getBoundingClientRect()
    setT(clamp((ev.clientX - r.left) / r.width, 0.01, 0.99))
  }
  const onKey = (ev: KeyboardEvent) => {
    const d = ev.key === 'ArrowRight' ? 0.03 : ev.key === 'ArrowLeft' ? -0.03 : 0
    if (!d) return
    ev.preventDefault()
    setTouched(true)
    setT((v) => clamp(v + d, 0.01, 0.99))
  }

  return (
    <div className="scene photo-scene sun2">
      <div
        ref={box}
        className="ps-frame drag-x"
        style={{ aspectRatio: '1000 / 848' }}
        onPointerDown={(ev) => {
          drag.current = true
          setTouched(true)
          ;(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId)
          setFrom(ev)
        }}
        onPointerMove={(ev) => drag.current && setFrom(ev)}
        onPointerUp={() => (drag.current = false)}
        onPointerCancel={() => (drag.current = false)}
      >
        <img
          src="img/x/canopy.webp"
          alt="Concept image: looking up at an elevated solar canopy on steel posts, with dense planting beneath and raised beds in the sun beyond."
          style={{ filter: `brightness(${0.38 + out * 0.75}) saturate(${0.55 + out * 0.6}) hue-rotate(${(1 - sunE) * -12}deg)` }}
          draggable={false}
        />
        <div className="sky-tint" style={{ opacity: 1 - sunE }} />
        <div className="sun-light" style={{ left: `${t * 100}%`, top: `${66 - sunE * 58}%`, opacity: 0.2 + out * 0.8 }} />
        {cloud >= 0 && <div className="cloud-shadow" style={{ left: `${-40 + cloud * 140}%` }} />}
        <svg className="ps-over" viewBox="0 0 1000 690" preserveAspectRatio="none" aria-hidden="true">
          <path d="M610 330 V560 H880 V640" fill="none" stroke="#7a5a05" strokeWidth="9" strokeLinejoin="round" />
          <path d="M610 330 V560 H880 V640" fill="none" stroke="#ffcf3f" strokeWidth="5" strokeDasharray="14 14" strokeDashoffset={dash} strokeLinejoin="round" opacity={0.2 + out * 0.8} />
        </svg>
        <button
          type="button"
          className="sun-handle"
          role="slider"
          aria-label="Time of day"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(t * 100)}
          aria-valuetext={t2clock(t)}
          onKeyDown={onKey}
          style={{ left: `${t * 100}%`, top: `${66 - sunE * 58}%`, opacity: sunE > 0.02 ? 1 : 0.4 }}
        />
        <span className="clock" aria-hidden="true">{t2clock(t)}</span>
        {!touched && <span className="ps-hint">Drag the sun</span>}
      </div>
      <div className="sun-panel">
        <svg viewBox="0 0 300 80" className="curve" aria-label="Illustrative output across the day">
          {HOURS.map((h) => {
            const x = ((h - 6.5) / 13) * 300
            return (
              <g key={h}>
                <line x1={x} x2={x} y1="0" y2="70" className="cv-grid" />
                <text x={x} y="79" textAnchor="middle" className="cv-lbl">{h}:00</text>
              </g>
            )
          })}
          <path d={curve} className="cv-line" />
          <circle cx={t * 300} cy={70 - out * 60} r="4.5" className="cv-dot" />
        </svg>
        <div className="sun-ctrls">
          <button type="button" className="ctl" onClick={() => setCloud(0)} disabled={cloud >= 0}>
            Pass a cloud
          </button>
          <span className="sun-read">Relative output <b>{Math.round(out * 100)}%</b> of peak</span>
        </div>
      </div>
    </div>
  )
}
