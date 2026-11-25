import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { PHASES, METRICS } from '../data/timeline'
import { gsap, motionOn } from '../motion/motion'
import { useInView } from './scenes/util'
import { Ext } from './Icons'

// The proposed year as an arch. Month 0 stands at the left foot, month 12 at the right.
const SPANS: [number, number][] = [[0, 0.6], [0.6, 2], [2, 4], [4, 8], [8, 12]]
const CX = 600
const CY = 590
const R = 520
const pt = (m: number, r = R) => {
  const a = Math.PI * (1 - m / 12)
  return [CX + Math.cos(a) * r, CY - Math.sin(a) * r]
}
const arc = (a: number, b: number, r = R) => {
  const [x0, y0] = pt(a, r)
  const [x1, y1] = pt(b, r)
  return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`
}

export function Next() {
  const root = useRef<HTMLElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const [m, setM] = useState(0)
  const touched = useRef(false)
  const held = useRef(false)
  const inView = useInView(svg, 0.5)
  const phase = Math.max(0, SPANS.findIndex(([, b]) => m <= b + 0.001))
  const p = PHASES[phase]

  // the year runs once by itself, then waits for you
  useEffect(() => {
    if (!inView || touched.current || !motionOn()) return
    const o = { m: 0 }
    const tw = gsap.to(o, { m: 12, duration: 9, ease: 'none', onUpdate: () => (touched.current ? tw.kill() : setM(o.m)) })
    return () => void tw.kill()
  }, [inView])

  const from = (e: PointerEvent) => {
    const r = svg.current!.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 1200 - CX
    const y = CY - ((e.clientY - r.top) / r.height) * 660
    const a = Math.atan2(Math.max(0, y), x)
    setM(Math.max(0, Math.min(12, 12 * (1 - a / Math.PI))))
  }
  const key = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0
    if (!d) return
    e.preventDefault()
    touched.current = true
    setM((v) => Math.max(0, Math.min(12, Math.round(v) + d)))
  }
  const [hx, hy] = pt(m)
  return (
    <section className="year" id="next" ref={root} aria-labelledby="next-title">
      <h2 id="next-title">If the school says yes.</h2>
      <div className="year-arch">
        <svg
          ref={svg}
          viewBox="0 0 1200 660"
          onPointerDown={(e) => {
            touched.current = true
            held.current = true
            e.currentTarget.setPointerCapture(e.pointerId)
            from(e)
          }}
          onPointerMove={(e) => held.current && from(e)}
          onPointerUp={() => (held.current = false)}
          onPointerCancel={() => (held.current = false)}
          data-cursor="drag"
        >
          {SPANS.map(([a, b], i) => (
            <path key={i} d={arc(a + 0.04, b - 0.04)} className="ya-seg" data-on={i === phase} />
          ))}
          {m > 0.06 && <path d={arc(0.02, m)} className="ya-fill" />}
          {Array.from({ length: 13 }, (_, k) => {
            const [x, y] = pt(k, R - 58)
            return (
              <text key={k} x={x} y={y + 7} textAnchor="middle" className="ya-num" data-on={Math.round(m) === k}>
                {k}
              </text>
            )
          })}
          <g
            transform={`translate(${hx} ${hy})`}
            className="ya-sun"
            role="slider"
            tabIndex={0}
            aria-label="Month of the proposed year"
            aria-valuemin={0}
            aria-valuemax={12}
            aria-valuenow={Math.round(m)}
            aria-valuetext={`${p.when}: ${p.title}`}
            onKeyDown={key}
          >
            <circle r="60" className="ya-halo" />
            <circle r="36" />
          </g>
        </svg>
        <div className="year-text" aria-live="polite">
          <p className="yt-when">{p.when}</p>
          <p className="yt-title" key={phase}>{p.title}</p>
          <p className="yt-body">{p.body}</p>
        </div>
      </div>
      <p className="year-note">A proposed order of work, not a construction schedule. Drag the sun along the year.</p>

      <div className="logbook" aria-label="Evidence dashboard mock-up, empty">
        {METRICS.map((x) => (
          <div key={x.key}>
            <span className="lb-digits" aria-hidden="true">
              {[0, 1, 2, 3].map((k) => (
                <i key={k} />
              ))}
            </span>
            <b>{x.unit}</b>
            <span>{x.label}</span>
          </div>
        ))}
        <p>Data collection begins after pilot approval</p>
      </div>

      <p className="campus-line">
        SJI International plans a new Serangoon campus for 2030, subject to final approvals. This roof is our idea, not part of that plan.{' '}
        <a href="https://www.sji-international.com.sg/giving/building-futures" target="_blank" rel="noopener noreferrer">
          Learn about the school&rsquo;s planned new campus <Ext />
        </a>
      </p>
    </section>
  )
}
