import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { hold, scrollToY, setAnchor, ScrollTrigger } from '../../motion/motion'
import { useStore } from '../../state/store'
import { PUBLISHED, MONTHLY_RAIN_MM, ANNUAL_RAIN_MM } from '../../data/research'
import { sourceById, type SourceId } from '../../data/sources'
import { useInView } from '../scenes/util'
import { Ext } from '../Icons'

// 1,198 dots that rearrange into every published figure, to scale.
// A dot always has a stated worth, so a small effect looks small.
const N = 1198
const [PR, COVER, ROOF, CEIL] = PUBLISHED

const CREAM = [246, 239, 222]
const GREEN = [104, 205, 110]
const GOLD = [255, 198, 41]
const HOT = [255, 122, 72]
const BLUE = [92, 190, 246]

interface T { x: number; y: number; r: number; c: number[]; a: number }
interface Box { x: number; y: number; w: number; h: number }
interface Label { x: number; y: number; s: string; al?: CanvasTextAlign; big?: boolean }

const STEPS: { num: string; unit: string; pre?: string; title: string; cmp: string; dot: string; src: SourceId }[] = [
  { num: '4.7', unit: '°C', pre: 'up to', title: 'cooler roof surface', cmp: `${ROOF.comparison}. ${ROOF.caveat}`, dot: 'One dot is 0.01 °C', src: ROOF.source },
  { num: '3', unit: '°C', pre: 'up to', title: 'cooler ceiling surface indoors', cmp: `${CEIL.comparison}. ${CEIL.caveat}`, dot: 'One dot is 0.01 °C', src: CEIL.source },
  { num: '19.8', unit: '%', title: 'more plant coverage', cmp: `${COVER.comparison}. ${COVER.caveat}`, dot: 'One dot is 0.1%', src: COVER.source },
  { num: '1.3', unit: '%', title: 'higher PV performance ratio', cmp: `${PR.comparison}. ${PR.caveat}`, dot: 'One dot is 0.1%. Small, and measured.', src: PR.source },
  { num: ANNUAL_RAIN_MM.toLocaleString('en-SG', { minimumFractionDigits: 1 }), unit: 'mm', title: 'of rain in an average year', cmp: 'Changi Climate Station, 1991 to 2020 mean', dot: 'One dot is 2 mm', src: 'mss' as SourceId },
]

/** month index for each rain dot, and its slot in the column */
const RAIN: { m: number; k: number }[] = []
MONTHLY_RAIN_MM.forEach((d, m) => {
  for (let k = 0; k < Math.round(d.mm / 2); k++) RAIN.push({ m, k })
})

const hide = (b: Box, i: number): T => ({ x: b.x + ((i * 97) % 100) / 100 * b.w, y: b.y + b.h + 60, r: 0, c: CREAM, a: 0 })

function gap(b: Box, i: number, dots: number): T {
  // two roof strips, and between them exactly `dots` dots: ten to a row, a row is 0.1 °C
  const rows = Math.ceil(dots / 10)
  const step = Math.min(b.h / 72, b.w / 34)
  const strip = N - dots
  const per = Math.ceil(strip / 2)
  const cols = Math.floor(b.w / (step * 1.02))
  const gh = rows * step
  const stripRows = Math.ceil(per / cols)
  const top = b.y + (b.h - gh) / 2
  if (i < dots) return { x: b.x + b.w * 0.5 + ((i % 10) - 4.5) * step, y: top + Math.floor(i / 10) * step, r: step * 0.4, c: GOLD, a: 1 }
  const k = i - dots
  const up = k < per
  const j = up ? k : k - per
  const row = Math.floor(j / cols)
  return {
    x: b.x + (b.w - (cols - 1) * step * 1.02) / 2 + (j % cols) * step * 1.02,
    y: up ? top - step * 2 - (stripRows - 1 - row) * step : top + gh + step + row * step,
    r: step * 0.36,
    c: up ? HOT : GREEN,
    a: 0.95,
  }
}
function block(b: Box, i: number, extra: number, hot: number[]): T {
  const total = 1000 + extra
  if (i >= total) return hide(b, i)
  const rows = 25
  const step = Math.min(b.h / (rows + 4), b.w / (48 + 3.5))
  const x0 = b.x + (b.w - step * (48 + 2)) / 2
  const y0 = b.y + (b.h - rows * step) / 2
  if (i < 1000) return { x: x0 + Math.floor(i / rows) * step, y: y0 + (i % rows) * step, r: step * 0.36, c: CREAM, a: 0.5 }
  const k = i - 1000
  return { x: x0 + (40 + 1.6 + Math.floor(k / rows)) * step, y: y0 + (rows - 1 - (k % rows)) * step, r: step * 0.42, c: hot, a: 1 }
}
function rain(b: Box, i: number): T {
  if (i >= RAIN.length) return hide(b, i)
  const { m, k } = RAIN[i]
  const cw = b.w / 12
  const step = Math.min(cw / 5.6, (b.h - 70) / 34)
  return { x: b.x + cw * (m + 0.5) + ((k % 5) - 2) * step, y: b.y + b.h - 34 - Math.floor(k / 5) * step, r: step * 0.4, c: BLUE, a: 1 }
}
const layout = (s: number, b: Box, i: number): T => (s === 0 ? gap(b, i, 470) : s === 1 ? gap(b, i, 300) : s === 2 ? block(b, i, 198, GREEN) : s === 3 ? block(b, i, 13, GOLD) : rain(b, i))

function labels(s: number, b: Box): Label[] {
  const step = Math.min(b.h / 72, b.w / 34)
  if (s < 2) {
    const dots = s === 0 ? 470 : 300
    const gh = Math.ceil(dots / 10) * step
    const top = b.y + (b.h - gh) / 2
    const x = b.x + b.w * 0.5 + step * 8
    return [
      { x, y: top + step * 2.6, s: s === 0 ? 'Bare concrete roof' : 'PV over concrete' },
      { x, y: top + gh - step * 1.6, s: 'PV over greenery' },
    ]
  }
  if (s < 4) {
    const st = Math.min(b.h / 29, b.w / 51.5)
    const x0 = b.x + (b.w - st * 50) / 2
    const y = b.y + (b.h + 25 * st) / 2 + 22
    return [
      { x: x0, y, s: s === 2 ? 'Green roof without PV' : 'PV over concrete' },
      { x: x0 + st * 50, y, s: s === 2 ? 'with PV' : 'over greenery', al: 'right' },
    ]
  }
  return MONTHLY_RAIN_MM.map((d, m) => ({ x: b.x + (b.w / 12) * (m + 0.5), y: b.y + b.h - 6, s: b.w < 420 ? d.m[0] : d.m, al: 'center' as const }))
}

export function DotField() {
  const root = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [month, setMonth] = useState<number | null>(null)
  const stepRef = useRef(0)
  const monthRef = useRef<number | null>(null)
  const st = useRef<{ start: number; end: number } | null>(null)
  const inView = useInView(root, 0.02)
  const motionOff = useStore((s) => s.motionOff)
  stepRef.current = step
  monthRef.current = month

  useLayoutEffect(() => {
    if (motionOff) return
    const pin = hold(wrap.current!, root.current!, () => innerHeight * 2.2)
    const tr = ScrollTrigger.create({ ...pin.vars, scrub: undefined, onUpdate: (s) => setStep(Math.min(4, Math.floor(s.progress * 5))) })
    st.current = tr
    setAnchor('research', () => st.current?.start ?? null)
    return () => {
      tr.kill()
      pin.release()
      st.current = null
      setAnchor('research', null)
    }
  }, [motionOff])

  useEffect(() => {
    const c = cv.current!
    const g = c.getContext('2d')!
    const X = new Float32Array(N), Y = new Float32Array(N), VX = new Float32Array(N), VY = new Float32Array(N), R = new Float32Array(N), A = new Float32Array(N)
    const C = new Float32Array(N * 3)
    let W = 0, H = 0, raf = 0, last = performance.now(), cur = -1, since = 0, la = 0
    let tg: T[] = []
    let box: Box = { x: 0, y: 0, w: 1, h: 1 }
    const ptr = { x: -999, y: -999 }
    const size = () => {
      const r = c.getBoundingClientRect()
      const k = Math.min(devicePixelRatio || 1, 1.5)
      W = r.width
      H = r.height
      c.width = W * k
      c.height = H * k
      g.setTransform(k, 0, 0, k, 0, 0)
      box = W > 900 ? { x: W * 0.4, y: H * 0.13, w: W * 0.555, h: H * 0.76 } : { x: 20, y: H * 0.1, w: W - 40, h: H * 0.48 }
      cur = -1
    }
    size()
    for (let i = 0; i < N; i++) {
      X[i] = Math.random() * W
      Y[i] = -Math.random() * H
      C.set(CREAM, i * 3)
    }
    let still = 0
    const bucket = new Map<number, number[]>()
    let lastHm: number | null = -1
    const paint = (dt: number, snap: boolean) => {
      const s = stepRef.current
      if (s !== cur) {
        tg = Array.from({ length: N }, (_, i) => layout(s, box, i))
        cur = s
        still = 0
        since = 0
        la = 0
      }
      since += dt
      // settled and untouched: keep the last picture
      if (cur !== -1 && !snap && still > 20 && since > 2 && ptr.x < -900 && monthRef.current === lastHm) return
      lastHm = monthRef.current
      let move = 0
      la = Math.min(1, snap ? 1 : since > 0.7 ? la + dt * 2 : 0)
      g.clearRect(0, 0, W, H)
      const hm = s === 4 ? monthRef.current : null
      for (let i = 0; i < N; i++) {
        const t = tg[i]
        if (snap) {
          X[i] = t.x
          Y[i] = t.y
          R[i] = t.r
          A[i] = t.a
          C.set(t.c, i * 3)
        } else if (since > (i % 61) * 0.007) {
          const stiff = 46 + (i % 7) * 4
          VX[i] += (t.x - X[i]) * stiff * dt - VX[i] * 9.2 * dt
          VY[i] += (t.y - Y[i]) * stiff * dt - VY[i] * 9.2 * dt
          const dx = X[i] - ptr.x, dy = Y[i] - ptr.y, d2 = dx * dx + dy * dy
          if (d2 < 6400 && d2 > 1) {
            const d = Math.sqrt(d2), f = ((80 - d) / 80) * 2600 * dt
            VX[i] += (dx / d) * f
            VY[i] += (dy / d) * f
          }
          move = Math.max(move, Math.abs(VX[i]) + Math.abs(VY[i]))
          X[i] += VX[i] * dt
          Y[i] += VY[i] * dt
          const e = Math.min(1, dt * 5)
          R[i] += (t.r - R[i]) * e
          A[i] += (t.a - A[i]) * e
          for (let k = 0; k < 3; k++) C[i * 3 + k] += (t.c[k] - C[i * 3 + k]) * e
        }
        if (A[i] < 0.02 || R[i] < 0.15) continue
        const dim = hm != null && i < RAIN.length && RAIN[i].m !== hm ? 0.28 : 1
        // dots of the same shade are drawn in one go
        const key = ((C[i * 3] >> 3) << 14) | ((C[i * 3 + 1] >> 3) << 9) | ((C[i * 3 + 2] >> 3) << 4) | Math.round(A[i] * dim * 15)
        let list = bucket.get(key)
        if (!list) bucket.set(key, (list = []))
        list.push(i)
      }
      bucket.forEach((list, key) => {
        if (!list.length) return
        const i0 = list[0]
        g.fillStyle = `rgba(${C[i0 * 3] | 0},${C[i0 * 3 + 1] | 0},${C[i0 * 3 + 2] | 0},${(key & 15) / 15})`
        g.beginPath()
        for (const i of list) {
          g.moveTo(X[i] + R[i], Y[i])
          g.arc(X[i], Y[i], R[i], 0, 6.2832)
        }
        g.fill()
        list.length = 0
      })
      if (bucket.size > 400) bucket.clear()
      still = move < 1.5 && !snap ? still + 1 : 0
      g.globalAlpha = la
      g.fillStyle = '#f6efde'
      g.font = `650 ${W > 900 ? 16 : 13}px "Schibsted Grotesk Variable", sans-serif`
      labels(s, box).forEach((l) => {
        g.textAlign = l.al ?? 'left'
        g.fillText(l.s, l.x, l.y)
      })
      if (hm != null) {
        const d = MONTHLY_RAIN_MM[hm]
        const cw = box.w / 12
        const sp = Math.min(cw / 5.6, (box.h - 70) / 34)
        g.textAlign = 'center'
        g.font = '800 24px "Archivo Variable", sans-serif'
        g.fillText(`${d.mm}`, box.x + cw * (hm + 0.5), box.y + box.h - 34 - Math.ceil(Math.round(d.mm / 2) / 5) * sp - 8)
      }
      g.globalAlpha = 1
    }
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000)
      last = now
      paint(dt, false)
      raf = requestAnimationFrame(loop)
    }
    if (motionOff) {
      paint(0.016, true)
      document.fonts.ready.then(() => paint(0.016, true))
    } else if (inView) raf = requestAnimationFrame(loop)
    const mv = (e: PointerEvent) => {
      const r = c.getBoundingClientRect()
      ptr.x = e.clientX - r.left
      ptr.y = e.clientY - r.top
      if (stepRef.current === 4) {
        const m = Math.floor(((ptr.x - box.x) / box.w) * 12)
        setMonth(m >= 0 && m < 12 && ptr.y > box.y && ptr.y < box.y + box.h ? m : null)
        ptr.x = -999
      }
    }
    const lv = () => {
      ptr.x = -999
      setMonth(null)
    }
    const host = root.current!
    host.addEventListener('pointermove', mv)
    host.addEventListener('pointerleave', lv)
    const ro = new ResizeObserver(() => {
      size()
      if (motionOff) paint(0.016, true)
    })
    ro.observe(c)
    return () => {
      cancelAnimationFrame(raf)
      if (!motionOff) c.width = c.height = 1 // hand the memory back; it is resized on return
      ro.disconnect()
      host.removeEventListener('pointermove', mv)
      host.removeEventListener('pointerleave', lv)
    }
  }, [inView, motionOff, motionOff ? step : 0, motionOff ? month : 0])

  const go = (i: number) => {
    if (!st.current) return setStep(i)
    scrollToY(st.current.start + (st.current.end - st.current.start) * ((i + 0.5) / 5))
  }
  const s = STEPS[step]
  const src = sourceById(s.src)
  return (
    <div className="pinw" ref={wrap}>
    <div className="dots" ref={root}>
      <canvas ref={cv} aria-hidden="true" />
      <div className="dots-text">
        <p className="dots-kind">{step < 4 ? 'Measured at Alexandra Primary School, not here' : 'Published rainfall record'}</p>
        <div className="dots-fig" key={step}>
          <p className="dots-num" data-long={s.num.length > 5}>
            {s.pre && <small>{s.pre}</small>}
            <span>{s.num}</span>
            <em>{s.unit}</em>
          </p>
          <p className="dots-title">{s.title}</p>
        </div>
        <p className="dots-cmp">{s.cmp}</p>
        <p className="dots-dot">{s.dot}</p>
        {src.url && (
          <a className="dots-src" href={src.url} target="_blank" rel="noopener noreferrer">
            {src.publisher.split(',')[0]} <Ext />
          </a>
        )}
      </div>
      <div className="dots-rail" role="group" aria-label="Choose a figure">
        {STEPS.map((x, i) => (
          <button key={x.title} type="button" aria-pressed={i === step} onClick={() => go(i)} aria-label={`${x.num} ${x.unit} ${x.title}`}>
            {x.num}
            {x.unit}
          </button>
        ))}
      </div>
      <ul className="sr-only">
        {PUBLISHED.map((p) => (
          <li key={p.label}>{`${p.prefix ?? ''}${p.value}${p.unit} ${p.label}. ${p.comparison}. ${p.caveat} Measured at Alexandra Primary School, not a promise for SJI International.`}</li>
        ))}
        {MONTHLY_RAIN_MM.map((d) => (
          <li key={d.m}>{`${d.m}: ${d.mm} mm mean rainfall, Changi, 1991 to 2020`}</li>
        ))}
      </ul>
    </div>
    </div>
  )
}
