import { useRef, useState, type PointerEvent } from 'react'
import { useLoop } from '../scenes/util'
import { useStore } from '../../state/store'
import { COLS, ROWS } from './data'
import { fitCanvas, inRender } from './util'
import { StageText } from './StageText'

const W = 1672
const H = 941
type Pt = [number, number]
const at = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

interface Cell {
  q: Pt[]
  cx: number
  cy: number
  v: number
  flash: number
}
const makeCells = (): Cell[] => {
  const out: Cell[] = []
  for (let c = 0; c < COLS.length - 1; c++)
    for (let r = 0; r < ROWS.length - 1; r++) {
      const q = [at(...COLS[c], ROWS[r]), at(...COLS[c + 1], ROWS[r]), at(...COLS[c + 1], ROWS[r + 1]), at(...COLS[c], ROWS[r + 1])] as Pt[]
      out.push({ q, cx: q.reduce((s, p) => s + p[0], 0) / 4, cy: q.reduce((s, p) => s + p[1], 0) / 4, v: 0, flash: 0 })
    }
  return out
}
// along the front frame, down the corner post, then the drain line to the building edge
const CABLE: Pt[] = [[951, 466], [905, 500], [905, 690], [880, 706], [790, 772], [700, 812]]
const SEG = CABLE.slice(1).map((p, i) => Math.hypot(p[0] - CABLE[i][0], p[1] - CABLE[i][1]))
const LEN = SEG.reduce((a, b) => a + b, 0)
const onCable = (d: number): Pt => {
  for (let i = 0; i < SEG.length; i++) {
    if (d <= SEG[i]) return at(CABLE[i], CABLE[i + 1], d / SEG[i])
    d -= SEG[i]
  }
  return CABLE[CABLE.length - 1]
}

/** Sweep sunlight over the real canopy. Panels charge, the cable carries it away, clouds steal it back. */
export function SunStage({ active }: { active: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const beam = useRef<HTMLDivElement>(null)
  const cloudEl = useRef<HTMLDivElement>(null)
  const cells = useRef(makeCells())
  const ptr = useRef({ x: 1000, y: 380, tx: 1000, ty: 380, idle: 9 })
  const pulses = useRef<number[]>([])
  const cloud = useRef(-500)
  const [lit, setLit] = useState(0)
  const motionOff = useStore((s) => s.motionOff)
  const total = cells.current.length

  useLoop(active && !motionOff, (dt, t) => {
    if (!cv.current || !box.current) return
    const p = ptr.current
    p.idle += dt
    if (p.idle > 2.2) {
      p.tx = 930 + Math.sin(t * 0.55) * 430
      p.ty = 372 - Math.sin(t * 0.55) * 60 + Math.sin(t * 1.3) * 26
    }
    p.x += (p.tx - p.x) * Math.min(1, dt * 7)
    p.y += (p.ty - p.y) * Math.min(1, dt * 7)
    cloud.current += dt * 95
    if (cloud.current > W + 900) cloud.current = -700
    if (beam.current) beam.current.style.transform = `translate(${((p.x / W) * box.current.clientWidth).toFixed(1)}px, ${((p.y / H) * box.current.clientHeight).toFixed(1)}px)`
    if (cloudEl.current) cloudEl.current.style.transform = `translateX(${((cloud.current / W) * box.current.clientWidth).toFixed(1)}px)`

    const g = fitCanvas(cv.current, W, H)
    g.clearRect(0, 0, W, H)
    g.globalCompositeOperation = 'lighter'
    let n = 0
    for (const c of cells.current) {
      const d = Math.hypot((c.cx - p.x) * 0.8, (c.cy - p.y) * 1.9)
      const shade = Math.abs(c.cx - cloud.current) < 230 ? 1 : 0
      const was = c.v
      if (d < 150 && !shade) c.v = Math.min(1, c.v + dt * 3.4)
      c.v = Math.max(0, c.v - dt * (shade ? 1.3 : 0.085))
      if (was < 0.6 && c.v >= 0.6) {
        c.flash = 1
        if (pulses.current.length < 26) pulses.current.push(-Math.random() * 60)
      }
      c.flash = Math.max(0, c.flash - dt * 2.2)
      if (c.v > 0.5) n++
      if (c.v < 0.02) continue
      g.beginPath()
      c.q.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])))
      g.closePath()
      g.fillStyle = `rgba(255,${176 + c.flash * 60},${48 + c.flash * 120},${0.1 + c.v * 0.5 + c.flash * 0.35})`
      g.fill()
      g.lineWidth = 1.2 + c.flash * 3
      g.strokeStyle = `rgba(255,228,150,${c.v * 0.65})`
      g.stroke()
    }
    // current: steady trickle in proportion to lit panels, plus a burst per newly charged panel
    if (n && Math.random() < dt * n * 0.5 && pulses.current.length < 40) pulses.current.push(0)
    g.globalCompositeOperation = 'source-over'
    g.lineJoin = 'round'
    g.lineCap = 'round'
    const path = () => {
      g.beginPath()
      CABLE.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])))
    }
    path()
    g.strokeStyle = 'rgba(70,44,0,.55)'
    g.lineWidth = 9
    g.stroke()
    path()
    g.strokeStyle = `rgba(255,190,40,${0.35 + (n / total) * 0.65})`
    g.lineWidth = 4.5
    g.stroke()
    g.globalCompositeOperation = 'lighter'
    pulses.current = pulses.current.filter((d) => d < LEN)
    for (let i = 0; i < pulses.current.length; i++) {
      pulses.current[i] += dt * 330
      if (pulses.current[i] < 0) continue
      const [x, y] = onCable(pulses.current[i])
      const gr = g.createRadialGradient(x, y, 0, x, y, 20)
      gr.addColorStop(0, 'rgba(255,246,200,.95)')
      gr.addColorStop(0.3, 'rgba(255,200,60,.6)')
      gr.addColorStop(1, 'rgba(255,180,20,0)')
      g.fillStyle = gr
      g.fillRect(x - 20, y - 20, 40, 40)
    }
    g.globalCompositeOperation = 'source-over'
    setLit(n)
  })

  const move = (e: PointerEvent) => {
    const q = inRender(box.current!, e, W, H)
    ptr.current.tx = q.x
    ptr.current.ty = q.y
    ptr.current.idle = 0
  }

  return (
    <section className="dstage st-sun" id="rp-solar" aria-labelledby="h-solar" onPointerMove={move} onPointerDown={move}>
      <div className="stage-in">
        <div className="cover" style={{ ['--fx' as string]: 0.6, ['--fy' as string]: 0.5 }}>
          <img src="img/roof-1672.webp" alt="Concept render of the roof wing: elevated solar panels on steel posts above dense low planting, with timber raised beds in full sun beside the path." loading="lazy" draggable={false} />
        </div>
        <p className="stage-word sw-sun" aria-hidden="true">Sunlight</p>
        <div className="cover" ref={box} style={{ ['--fx' as string]: 0.6, ['--fy' as string]: 0.5 }}>
          <img src="img/day/roof-fg.webp" alt="" loading="lazy" draggable={false} />
          <div className="cloud-band" ref={cloudEl} aria-hidden="true" />
          <canvas ref={cv} aria-hidden="true" />
          <div className="beam" ref={beam} aria-hidden="true" />
        </div>
        <StageText id="solar" hint="Sweep the sun across the panels before the cloud takes it back." />
        <div className="tally" aria-hidden="true">
          <div className="tally-cells">
            {Array.from({ length: total }, (_, i) => (
              <i key={i} data-on={i < lit} />
            ))}
          </div>
          <span>{lit === total ? 'Every panel lit' : `${lit} of ${total} panels lit`}</span>
        </div>
      </div>
    </section>
  )
}
