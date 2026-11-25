import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { SOLAR_DEFAULTS, RAIN_DEFAULTS, solarGeneration, rainPotential, fmt } from '../../data/calculations'
import { useInView } from '../scenes/util'
import { useStore } from '../../state/store'

// Two things you can physically resize. Every number is our scenario, not a result.

function useCanvasLoop(cv: React.RefObject<HTMLCanvasElement | null>, deps: unknown[], draw: (g: CanvasRenderingContext2D, w: number, h: number, dt: number, t: number) => void) {
  const inView = useInView(cv, 0.1)
  const motionOff = useStore((s) => s.motionOff)
  const fn = useRef(draw)
  fn.current = draw
  useEffect(() => {
    const c = cv.current!
    const g = c.getContext('2d')!
    let w = 0, h = 0, raf = 0, last = performance.now()
    const size = () => {
      const r = c.getBoundingClientRect()
      const k = Math.min(devicePixelRatio || 1, 2)
      w = r.width
      h = r.height
      c.width = w * k
      c.height = h * k
      g.setTransform(k, 0, 0, k, 0, 0)
    }
    const frame = (dt: number, t: number) => {
      g.clearRect(0, 0, w, h)
      fn.current(g, w, h, dt, t)
    }
    size()
    const ro = new ResizeObserver(() => {
      size()
      frame(10, 0)
    })
    ro.observe(c)
    if (motionOff) frame(10, 0)
    else if (inView) {
      const loop = (now: number) => {
        frame(Math.min(0.04, (now - last) / 1000), now / 1000)
        last = now
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, motionOff, ...(motionOff ? deps : [])])
}

const face = (g: CanvasRenderingContext2D, pts: number[][], fill: string, stroke?: string) => {
  g.beginPath()
  pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])))
  g.closePath()
  g.fillStyle = fill
  g.fill()
  if (stroke) {
    g.strokeStyle = stroke
    g.stroke()
  }
}

/** 20 x 20 isometric roof. Each tile is 1 kWp, laid as you drag. */
function SolarRoof({ kwp, onKwp }: { kwp: number; onKwp: (v: number) => void }) {
  const cv = useRef<HTMLCanvasElement>(null)
  const z = useRef(new Float32Array(400))
  const ptr = useRef({ x: -1e3, y: -1e3 })
  const geo = useRef({ cx: 0, top: 0, tw: 1 })
  const held = useRef(false)
  useCanvasLoop(cv, [kwp], (g, w, h, dt, t) => {
    const tw = Math.min((w * 0.94) / 20, (h * 0.8) / 10.6)
    const th = tw / 2
    const cx = w / 2
    const top = (h - th * 20) / 2 - th
    geo.current = { cx, top, tw }
    const P = (i: number, j: number, k = 0): number[] => [cx + ((i - j) * tw) / 2, top + ((i + j) * th) / 2 - k]
    // slab
    face(g, [P(0, 20), P(20, 20), [P(20, 20)[0], P(20, 20)[1] + 34], [P(0, 20)[0], P(0, 20)[1] + 34]], '#e6d9ae')
    face(g, [P(20, 20), P(20, 0), [P(20, 0)[0], P(20, 0)[1] + 34], [P(20, 20)[0], P(20, 20)[1] + 34]], '#cfbd83')
    face(g, [P(0, 0), P(20, 0), P(20, 20), P(0, 20)], '#fff8e0')
    g.lineWidth = 1
    for (let j = 0; j < 20; j++)
      for (let i = 0; i < 20; i++) {
        const n = j * 20 + i
        const goal = n < kwp ? 1 : 0
        z.current[n] += (goal - z.current[n]) * Math.min(1, dt * (5 + (n % 5)))
        const v = z.current[n]
        if (v < 0.02) continue
        const c = P(i + 0.5, j + 0.5)
        const near = Math.max(0, 1 - Math.hypot(c[0] - ptr.current.x, (c[1] - ptr.current.y) * 1.7) / 95)
        const lift = (1 - v) * 60 + near * 22 + 5
        const p = 0.07
        g.globalAlpha = Math.min(1, v * 1.4)
        const a = P(i + p, j + p, lift), b = P(i + 1 - p, j + p, lift), d = P(i + 1 - p, j + 1 - p, lift), e = P(i + p, j + 1 - p, lift)
        const down = (q: number[]) => [q[0], q[1] + 3]
        face(g, [e, d, down(d), down(e)], '#0d1830')
        face(g, [b, d, down(d), down(b)], '#0a1226')
        const sh = 0.5 + 0.5 * Math.sin(t * 1.1 - (i + j) * 0.22)
        face(g, [a, b, d, e], `rgb(${24 + near * 190 + sh * 14},${48 + near * 130 + sh * 26},${110 - near * 60 + sh * 40})`, 'rgba(255,255,255,.28)')
        g.globalAlpha = 1
      }
  })
  const hit = (e: PointerEvent) => {
    const r = cv.current!.getBoundingClientRect()
    ptr.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    if (!held.current) return
    const { cx, top, tw } = geo.current
    const dx = (ptr.current.x - cx) / (tw / 2)
    const dy = (ptr.current.y - top) / (tw / 4)
    const j = Math.max(0, Math.min(19.99, (dy - dx) / 2))
    const i = Math.max(0, Math.min(19.99, (dy + dx) / 2))
    onKwp(Math.max(20, Math.min(400, Math.round((Math.floor(j) * 20 + i + 1) / 10) * 10)))
  }
  const key = (e: KeyboardEvent) => {
    const d = ['ArrowRight', 'ArrowUp'].includes(e.key) ? 10 : ['ArrowLeft', 'ArrowDown'].includes(e.key) ? -10 : 0
    if (!d) return
    e.preventDefault()
    onKwp(Math.max(20, Math.min(400, kwp + d)))
  }
  return (
    <canvas
      ref={cv}
      className="sz-canvas"
      role="slider"
      tabIndex={0}
      aria-label="Roof-safe PV capacity"
      aria-valuemin={20}
      aria-valuemax={400}
      aria-valuenow={kwp}
      aria-valuetext={`${kwp} kilowatt peak`}
      data-cursor="drag"
      onKeyDown={key}
      onPointerDown={(e) => {
        held.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        hit(e)
      }}
      onPointerMove={hit}
      onPointerUp={() => (held.current = false)}
      onPointerCancel={() => (held.current = false)}
      onPointerLeave={() => (ptr.current = { x: -1e3, y: -1e3 })}
    />
  )
}

/** A stack of water, one cube for every 10 cubic metres. */
function WaterStack({ m3 }: { m3: number }) {
  const cv = useRef<HTMLCanvasElement>(null)
  const v = useRef(new Float32Array(800))
  const ptr = useRef({ x: -1e3, y: -1e3 })
  const n = Math.min(800, Math.round(m3 / 10))
  useCanvasLoop(cv, [n], (g, w, h, dt, t) => {
    const S = 8
    const layers = Math.max(1, Math.ceil(n / (S * S)))
    const tw = Math.min((w * 0.9) / S, (h * 0.94) / (S / 2 + Math.max(4, layers) * 0.52))
    const th = tw / 2
    const cubeH = th * 1.02
    const cx = w / 2
    const floor = h - th * S - Math.max(14, h * 0.04)
    const P = (i: number, j: number, k: number): number[] => [cx + ((i - j) * tw) / 2, floor + ((i + j) * th) / 2 - k]
    face(g, [P(-0.4, -0.4, 0), P(S + 0.4, -0.4, 0), P(S + 0.4, S + 0.4, 0), P(-0.4, S + 0.4, 0)], 'rgba(6,50,86,.34)')
    g.lineWidth = 1
    for (let q = 0; q < 800; q++) {
      const goal = q < n ? 1 : 0
      v.current[q] += (goal - v.current[q]) * Math.min(1, dt * (3 + (q % 9) * 0.7))
      const a = v.current[q]
      if (a < 0.03) continue
      const layer = Math.floor(q / (S * S))
      const r = q % (S * S)
      const j = Math.floor(r / S)
      const i = r % S
      const c = P(i + 0.5, j + 0.5, (layer + 0.5) * cubeH)
      const near = Math.max(0, 1 - Math.hypot(c[0] - ptr.current.x, c[1] - ptr.current.y) / 80)
      const k = layer * cubeH + (1 - a) * 150 + near * 14 + Math.sin(t * 1.6 + (i + j) * 0.5) * 1.4
      const p = 0.05
      const A = P(i + p, j + p, k + cubeH), B = P(i + 1 - p, j + p, k + cubeH), D = P(i + 1 - p, j + 1 - p, k + cubeH), E = P(i + p, j + 1 - p, k + cubeH)
      const lo = (o: number[]) => [o[0], o[1] + cubeH * 0.94]
      g.globalAlpha = Math.min(1, a * 1.3)
      face(g, [E, D, lo(D), lo(E)], '#9fdcff')
      face(g, [B, D, lo(D), lo(B)], '#6fc2f2')
      face(g, [A, B, D, E], near > 0.1 ? '#ffffff' : '#dff4ff')
      g.globalAlpha = 1
    }
  })
  return (
    <canvas
      ref={cv}
      className="sz-canvas"
      role="img"
      aria-label={`${fmt(n)} cubes, each 10 cubic metres`}
      onPointerMove={(e) => {
        const r = cv.current!.getBoundingClientRect()
        ptr.current = { x: e.clientX - r.left, y: e.clientY - r.top }
      }}
      onPointerLeave={() => (ptr.current = { x: -1e3, y: -1e3 })}
    />
  )
}

function Range({ label, value, min, max, step, unit, d = 0, src, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; d?: number; src: string; onChange: (v: number) => void }) {
  const id = useId()
  return (
    <div className="sz-range">
      <label htmlFor={id}>
        {label} <small>{src}</small>
      </label>
      <output htmlFor={id}>
        {fmt(value, d)} {unit}
      </output>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ ['--p' as string]: `${((value - min) / (max - min)) * 100}%` }} />
    </div>
  )
}

export function RoofSizer() {
  const [kwp, setKwp] = useState(SOLAR_DEFAULTS.capacityKwp)
  const [lo, setLo] = useState(SOLAR_DEFAULTS.yieldLow)
  const [hi, setHi] = useState(SOLAR_DEFAULTS.yieldHigh)
  const [area, setArea] = useState(RAIN_DEFAULTS.catchmentM2)
  const [mm, setMm] = useState(RAIN_DEFAULTS.rainfallM)
  const [cap, setCap] = useState(RAIN_DEFAULTS.captureFactor)
  const solar = solarGeneration(kwp, lo, hi)
  const rain = rainPotential(area, mm, cap)
  const moved = kwp !== SOLAR_DEFAULTS.capacityKwp || lo !== SOLAR_DEFAULTS.yieldLow || hi !== SOLAR_DEFAULTS.yieldHigh || area !== RAIN_DEFAULTS.catchmentM2 || mm !== RAIN_DEFAULTS.rainfallM || cap !== RAIN_DEFAULTS.captureFactor
  const reset = () => {
    setKwp(SOLAR_DEFAULTS.capacityKwp)
    setLo(SOLAR_DEFAULTS.yieldLow)
    setHi(SOLAR_DEFAULTS.yieldHigh)
    setArea(RAIN_DEFAULTS.catchmentM2)
    setMm(RAIN_DEFAULTS.rainfallM)
    setCap(RAIN_DEFAULTS.captureFactor)
  }
  return (
    <div className="sizer" id="calculator">
      <div className="sz sz-sun">
        <header>
          <h3>Lay the panels</h3>
          <p>Scenario based on assumptions. Drag across the roof: one tile is 1 kWp.</p>
        </header>
        <SolarRoof kwp={kwp} onKwp={setKwp} />
        <div className="sz-out" aria-live="polite">
          <p className="sz-big">
            {fmt(solar.lowKwh)} to {fmt(solar.highKwh)}
            <em>kWh a year, potential</em>
          </p>
          <p className="sz-eq">
            {fmt(kwp)} kWp ×{' '}
            <input type="number" aria-label="Specific yield, low" value={lo} min={0} onChange={(e) => setLo(Number(e.target.value))} /> to{' '}
            <input type="number" aria-label="Specific yield, high" value={hi} min={0} onChange={(e) => setHi(Number(e.target.value))} /> kWh/kWp/yr <small>BCA/EMA handbook [3]</small>
          </p>
          <p className="sz-fine">Not school bill savings. A power-purchase agreement may change who owns the panels or benefits.</p>
        </div>
      </div>
      <div className="sz sz-rain">
        <header>
          <h3>Stack the rain</h3>
          <p>Scenario based on assumptions. One cube is 10 m³.</p>
        </header>
        <WaterStack m3={rain.m3} />
        <div className="sz-out" aria-live="polite">
          <p className="sz-big">
            {fmt(rain.m3, 2)}
            <em>m³ a year, theoretical</em>
          </p>
          <div className="sz-ranges">
            <Range label="Roof catchment" src="assumed" value={area} min={100} max={3000} step={50} unit="m²" onChange={setArea} />
            <Range label="Rainfall" src="MSS [2]" value={mm} min={1.5} max={2.8} step={0.0001} d={4} unit="m/yr" onChange={setMm} />
            <Range label="Capture" src="assumed" value={cap} min={0.4} max={0.9} step={0.01} d={2} unit="" onChange={setCap} />
          </div>
          <p className="sz-fine">Only water actually delivered to the flush cisterns counts.</p>
        </div>
      </div>
      <button type="button" className="sz-reset" onClick={reset} data-on={moved} disabled={!moved}>
        Back to the poster numbers
      </button>
    </div>
  )
}
