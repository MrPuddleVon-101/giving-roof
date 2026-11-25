import { useRef, useState, type PointerEvent } from 'react'
import { useLoop, clamp } from '../scenes/util'
import { useStore } from '../../state/store'
import { fitCanvas } from './util'
import { StageText } from './StageText'

const W = 1672
const H = 941
type Pt = [number, number]
// traced on the render
const DOWN: Pt[] = [[950, 250], [915, 268], [905, 290], [905, 470], [917, 560], [912, 640], [914, 672], [928, 690], [950, 694]]
const FLUSH: Pt[] = [[1142, 690], [1142, 604], [1256, 600], [1260, 450], [1505, 440]]
const OVER: Pt[] = [[1136, 748], [1270, 754], [1298, 770], [1318, 806], [1332, 836]]
const TANK = { x: 944, y: 684, w: 206, h: 120 }
const WCS = [{ x: 1327, t: 0.62 }, { x: 1410, t: 0.8 }, { x: 1501, t: 1 }]

const mk = (pts: Pt[]) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
  const len = seg.reduce((a, b) => a + b, 0)
  return {
    pts,
    len,
    at: (d: number): Pt => {
      for (let i = 0; i < seg.length; i++) {
        if (d <= seg[i] || i === seg.length - 1) {
          const t = Math.min(1, d / seg[i])
          return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]
        }
        d -= seg[i]
      }
      return pts[pts.length - 1]
    },
  }
}
const pDown = mk(DOWN)
const pFlush = mk(FLUSH)
const pOver = mk(OVER)
const rnd = (a: number, b: number) => a + Math.random() * (b - a)

interface Drop { x: number; y: number; z: number; v: number }
interface Splash { x: number; y: number; a: number; s: number }
interface Pulse { d: number; end: number; wc: number }

/** Press and hold to bring the storm. The water goes exactly where the render's pipes go. */
export function RainStage({ active }: { active: boolean }) {
  const cv = useRef<HTMLCanvasElement>(null)
  const dark = useRef<HTMLDivElement>(null)
  const [hold, setHold] = useState(false)
  const [level, setLevel] = useState(34)
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState(-1)
  const motionOff = useStore((s) => s.motionOff)
  const sim = useRef({
    power: 0.3,
    lvl: 0.34,
    first: 0.25,
    drops: Array.from({ length: 620 }, (): Drop => ({ x: rnd(-200, W + 100), y: rnd(-H, H), z: rnd(0.25, 1), v: rnd(0.8, 1.2) })),
    splash: [] as Splash[],
    run: Array.from({ length: 46 }, () => ({ u: Math.random(), v: Math.random(), s: rnd(0.4, 1) })),
    pipe: 0,
    pulses: [] as Pulse[],
    flash: [0, 0, 0],
    spill: 0,
  })

  useLoop(active && !motionOff, (dt, t) => {
    if (!cv.current) return
    const s = sim.current
    const goal = hold ? 1 : 0.28 + Math.sin(t * 0.4) * 0.06
    s.power += (goal - s.power) * Math.min(1, dt * (hold ? 1.6 : 1.1))
    s.first = clamp(s.first + dt * (s.power > 0.4 ? 0.5 : -0.12), 0.2, 1)
    s.lvl = clamp(s.lvl + dt * s.power * s.power * 0.16)
    const full = s.lvl > 0.985
    s.spill += ((full && s.power > 0.15 ? 1 : 0) - s.spill) * Math.min(1, dt * 2)
    if (dark.current) dark.current.style.opacity = (0.04 + s.power * 0.42).toFixed(3)

    const g = fitCanvas(cv.current, W, H)
    g.clearRect(0, 0, W, H)

    // sheet running down the canopy into the gutter
    g.lineCap = 'round'
    for (const r of s.run) {
      r.u += dt * (0.25 + s.power * 0.75) * r.s
      if (r.u > 1) {
        r.u = 0
        r.v = Math.random()
      }
      const bx = 1672, by = 34 + r.v * 34, ex = 860 + r.v * 190, ey = 212 + r.v * 22
      const x = bx + (ex - bx) * r.u, y = by + (ey - by) * r.u
      const k = 26 + s.power * 40
      g.strokeStyle = `rgba(230,246,255,${0.1 + s.power * 0.4})`
      g.lineWidth = 1.5
      g.beginPath()
      g.moveTo(x, y)
      g.lineTo(x + k, y - k * 0.2)
      g.stroke()
    }
    // gutter drips
    if (Math.random() < s.power * 0.9) s.splash.push({ x: rnd(870, 1058), y: rnd(218, 232), a: 1, s: 0.5 })

    // water in the sealed tank
    g.save()
    g.beginPath()
    g.roundRect(TANK.x, TANK.y, TANK.w, TANK.h, 30)
    g.clip()
    const wy = TANK.y + TANK.h * (1 - s.lvl)
    g.beginPath()
    g.moveTo(TANK.x, H)
    for (let x = TANK.x; x <= TANK.x + TANK.w; x += 8) g.lineTo(x, wy + Math.sin(x * 0.06 + t * 4) * (1.5 + s.power * 4))
    g.lineTo(TANK.x + TANK.w, H)
    g.closePath()
    g.fillStyle = 'rgba(40,190,255,.62)'
    g.fill()
    g.restore()
    // first-flush chamber
    g.fillStyle = 'rgba(90,190,235,.55)'
    g.fillRect(896, 570 - 84 * s.first, 43, 84 * s.first)

    const bead = (x: number, y: number, r: number, a: number) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, r)
      gr.addColorStop(0, `rgba(255,255,255,${a})`)
      gr.addColorStop(0.45, `rgba(150,225,255,${a * 0.7})`)
      gr.addColorStop(1, 'rgba(80,190,255,0)')
      g.fillStyle = gr
      g.fillRect(x - r, y - r, r * 2, r * 2)
    }
    s.pipe += dt * (120 + s.power * 380)
    const n = Math.round(5 + s.power * 17)
    for (let i = 0; i < n; i++) {
      const [x, y] = pDown.at((s.pipe + (i * pDown.len) / n) % pDown.len)
      bead(x, y, 13, 0.35 + s.power * 0.6)
    }
    if (s.spill > 0.04) {
      for (let i = 0; i < 16; i++) {
        const [x, y] = pOver.at((s.pipe * 0.8 + (i * pOver.len) / 16) % pOver.len)
        bead(x, y, 15, 0.9 * s.spill)
      }
      for (let k = 0; k < 3; k++) {
        const q = (t * 0.9 + k / 3) % 1
        g.strokeStyle = `rgba(255,255,255,${(1 - q) * 0.75 * s.spill})`
        g.lineWidth = 2.5
        g.beginPath()
        g.ellipse(1336, 842, 10 + q * 74, 4 + q * 17, 0, 0, 7)
        g.stroke()
      }
    }
    // flushing supply
    s.pulses = s.pulses.filter((p) => p.d < p.end)
    for (const p of s.pulses) {
      p.d += dt * 620
      for (let i = 0; i < 9; i++) {
        const d = p.d - i * 22
        if (d > 0 && d < p.end) {
          const [x, y] = pFlush.at(d)
          bead(x, y, 15, 1 - i / 10)
        }
      }
      if (p.d >= p.end) s.flash[p.wc] = 1
    }
    WCS.forEach((wc, i) => {
      if (s.flash[i] <= 0) return
      s.flash[i] = Math.max(0, s.flash[i] - dt * 0.8)
      const q = 1 - s.flash[i]
      for (let k = 0; k < 2; k++) {
        g.strokeStyle = `rgba(90,205,255,${s.flash[i]})`
        g.lineWidth = 3
        g.beginPath()
        g.ellipse(wc.x - 4, 514, 6 + ((q + k * 0.3) % 1) * 24, 2 + ((q + k * 0.3) % 1) * 8, 0, 0, 7)
        g.stroke()
      }
    })

    // falling rain, three depths
    const shown = Math.round(s.drops.length * (0.16 + s.power * 0.84))
    for (const b of [0.45, 0.72, 1.01]) {
      g.strokeStyle = `rgba(226,240,250,${0.12 + b * 0.34})`
      g.lineWidth = 0.6 + b * 1.1
      g.beginPath()
      for (let i = 0; i < shown; i++) {
        const d = s.drops[i]
        if (d.z > b || d.z <= b - 0.29) continue
        d.y += dt * (700 + 1100 * d.z) * d.v
        d.x -= dt * (120 + 190 * s.power) * d.z
        if (d.y > H * (0.62 + d.z * 0.4)) {
          if (s.splash.length < 130 && d.z > 0.4) s.splash.push({ x: d.x, y: d.y, a: 1, s: d.z })
          d.y = rnd(-260, -20)
          d.x = rnd(-60, W + 380)
        }
        const l = (12 + 30 * d.z) * (0.7 + s.power * 0.6)
        g.moveTo(d.x, d.y)
        g.lineTo(d.x + l * 0.16, d.y - l)
      }
      g.stroke()
    }
    s.splash = s.splash.filter((p) => p.a > 0)
    for (const p of s.splash) {
      p.a -= dt * 3.2
      g.strokeStyle = `rgba(240,248,255,${Math.max(0, p.a) * 0.7})`
      g.lineWidth = 1.2
      g.beginPath()
      g.ellipse(p.x, p.y, (1 - p.a) * 13 * p.s + 1, (1 - p.a) * 4 * p.s + 0.5, 0, 0, 7)
      g.stroke()
    }
    setLevel(Math.round(s.lvl * 100))
    setOver(full)
  })

  const flush = (i: number) => {
    const s = sim.current
    if (s.lvl < 0.1) return
    s.lvl = clamp(s.lvl - 0.13)
    s.pulses.push({ d: 0, end: pFlush.len * WCS[i].t, wc: i })
    setBusy(i)
    window.setTimeout(() => setBusy(-1), 1500)
    if (motionOff) {
      setLevel(Math.round(s.lvl * 100))
      setOver(false)
    }
  }
  const down = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return
    setHold(true)
  }
  const up = () => setHold(false)

  return (
    <section className="dstage st-rain" id="rp-rain" aria-labelledby="h-rain" onPointerDown={down} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} data-hold={hold}>
      <div className="stage-in">
        <div className="cover" style={{ ['--fx' as string]: 0.78, ['--fy' as string]: 0.4 }}>
          <img src="img/rain-1672.webp" alt="Concept render in the rain: a gutter and screened downpipe feed a sealed blue tank at ground level; a separate blue pipe rises to three toilets; a grey overflow pipe empties into a planted rain garden." loading="lazy" draggable={false} />
        </div>
        <p className="stage-word sw-rain" aria-hidden="true">Rain</p>
        <div className="cover" style={{ ['--fx' as string]: 0.78, ['--fy' as string]: 0.4 }}>
          <img src="img/day/rain-fg.webp" alt="" loading="lazy" draggable={false} />
          <div className="rain-dark" ref={dark} aria-hidden="true" />
          <canvas ref={cv} aria-hidden="true" />
          <span className="tag" style={{ left: '51%', top: '39%' }}>Leaf screen</span>
          <span className="tag" style={{ left: '50.8%', top: '55.5%' }}>First flush</span>
          <span className="tag tank" style={{ left: '62.6%', top: '80.5%' }}>
            Sealed tank <b>{level}%</b>
          </span>
          <span className="tag" data-show={over} style={{ left: '86%', top: '78%' }}>Overflow to the rain garden</span>
          {WCS.map((w, i) => (
            <button
              key={w.x}
              type="button"
              className="wc"
              aria-label={`Flush toilet ${i + 1}`}
              data-busy={busy === i}
              disabled={level < 10}
              onClick={() => flush(i)}
              style={{ left: `${(w.x / W) * 100}%`, top: `${(505 / H) * 100}%` }}
            >
              <span>Flush</span>
            </button>
          ))}
        </div>
        <StageText id="rain" light hint="Press and hold for a storm. Tap a toilet to use the water." />
        <p className="stage-warn">Not for drinking or handwashing.</p>
      </div>
    </section>
  )
}
