import { useEffect, useRef, useState } from 'react'
import { useInView, useLoop, clamp } from './util'
import { useStore } from '../../state/store'

// The real rainwater render with its own pipes traced and animated:
// downpipe into the sealed tank, a separate flushing supply, and overflow to the garden.
// Coordinates are in the render's own pixels (1672 x 941).

const DOWN = 'M950 245 H905 V685 Q905 700 925 700 H955'
const FLUSH = 'M1140 690 V605 H1255 V450 H1505'
const DROPS = [1335, 1420, 1505].map((x) => `M${x} 450 V468`).join(' ')
const OVER = 'M1140 745 H1280 Q1300 745 1305 770 L1318 835'
const TANK = { x: 948, y: 678, w: 200, h: 126 }

export function RainScene() {
  const box = useRef<HTMLDivElement>(null)
  const inView = useInView(box)
  const motionOff = useStore((s) => s.motionOff)
  const [raining, setRaining] = useState(false)
  const [level, setLevel] = useState(0.3)
  const [flushT, setFlushT] = useState(0)
  const [flow, setFlow] = useState(0)
  const [intensity, setIntensity] = useState(2) // 1 drizzle, 2 shower, 3 storm
  const auto = useRef(false)

  useEffect(() => {
    if (!inView || auto.current) return
    auto.current = true
    setRaining(true)
    const t = setTimeout(() => setRaining(false), 4500)
    return () => clearTimeout(t)
  }, [inView])

  useEffect(() => {
    if (motionOff && raining) {
      setLevel((l) => clamp(l + 0.45))
      setRaining(false)
    }
  }, [motionOff, raining])

  useLoop(inView, (dt) => {
    setFlow((f) => f + dt * 160)
    if (raining) setLevel((l) => clamp(l + dt * 0.06 * intensity))
    setFlushT((f) => Math.max(0, f - dt))
  })

  const full = level >= 0.98
  const flushing = flushT > 0
  const flush = () => {
    if (level < 0.08) return
    setLevel((l) => clamp(l - 0.16))
    setFlushT(1.4)
  }
  const waterY = TANK.y + TANK.h - level * TANK.h

  return (
    <div className="scene photo-scene">
      <div ref={box} className="ps-frame">
        <img src="img/rain-1672.webp" srcSet="img/rain-960.webp 960w, img/rain-1672.webp 1672w" sizes="(max-width: 900px) 100vw, 55vw" alt="Concept render in the rain: a gutter and screened downpipe feed a sealed blue tank at ground level; a separate blue pipe rises to three toilets; a grey overflow pipe empties into a planted rain garden." />
        {raining && <div className={`rain-fx i${intensity}`} aria-hidden="true" />}
        <div className="gauge" aria-hidden="true">
          <i style={{ transform: `scaleY(${level})` }} />
          <span>{Math.round(level * 100)}%</span>
        </div>
        <svg className="ps-over" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <clipPath id="tank-fill">
              <rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} rx="34" />
            </clipPath>
          </defs>
          <rect x={TANK.x} y={waterY} width={TANK.w} height={TANK.h} fill="#46b6ff" opacity="0.55" clipPath="url(#tank-fill)" style={{ transition: 'y .5s' }} />
          <path d={DOWN} className="flow" stroke="#d9f1ff" strokeDashoffset={-flow} opacity={raining ? 1 : 0} />
          <path d={FLUSH + ' ' + DROPS} className="flow" stroke="#d9f1ff" strokeDashoffset={-flow} opacity={flushing ? 1 : 0} />
          <path d={OVER} className="flow" stroke="#e6f0f1" strokeDashoffset={-flow} opacity={full ? 1 : 0} />
          <g className="ps-tags">
            <text x="925" y="230">gutter + screen</text>
            <text x="1048" y="660" textAnchor="middle">sealed tank</text>
            <text x="1380" y="425" textAnchor="middle">flushing only</text>
            <text x="1330" y="870">overflow</text>
          </g>
        </svg>
      </div>
      <div className="scene-ctrls">
        <button type="button" className="ctl" aria-pressed={raining} onClick={() => setRaining(!raining)}>
          {raining ? 'Stop rain' : 'Make it rain'}
        </button>
        <button type="button" className="ctl" onClick={flush} disabled={level < 0.08}>
          Flush
        </button>
        <label className="intensity">
          <span>{['', 'Drizzle', 'Shower', 'Storm'][intensity]}</span>
          <input type="range" min={1} max={3} step={1} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} aria-label="Rain intensity" style={{ ['--p' as string]: `${(intensity - 1) * 50}%` }} />
        </label>
        <span className="tank-read" aria-live="polite">
          {full ? 'Tank full: overflowing' : level < 0.08 ? 'Tank low' : 'Tank filling'}
        </span>
        <span className="warn">Not for drinking or handwashing.</span>
      </div>
    </div>
  )
}
