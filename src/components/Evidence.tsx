import { useRef, useState } from 'react'
import { PUBLISHED, MONTHLY_RAIN_MM, ANNUAL_RAIN_MM, UNKNOWNS } from '../data/research'
import { sourceById } from '../data/sources'
import { useReveal } from '../motion/useReveal'
import { useStore } from '../state/store'
import { Split } from './Split'
import { Ext } from './Icons'
import { Calculator } from './Calculator'

function SourceLink({ id }: { id: Parameters<typeof sourceById>[0] }) {
  const s = sourceById(id)
  return s.url ? (
    <a href={s.url} target="_blank" rel="noopener noreferrer">
      [{s.n}] {s.publisher.split(',')[0]} <Ext />
    </a>
  ) : (
    <span>
      [{s.n}] {s.publisher}
    </span>
  )
}

function RainChart() {
  const [hover, setHover] = useState<number | null>(null)
  const max = 350
  const W = 1200
  const Hh = 300
  const pad = { l: 44, r: 8, t: 16, b: 30 }
  const bw = (W - pad.l - pad.r) / 12
  return (
    <figure className="rainchart">
      <figcaption>
        <strong>Mean monthly rainfall, Changi Climate Station, 1991 to 2020</strong>
        <span>Annual mean {ANNUAL_RAIN_MM.toLocaleString('en-SG', { minimumFractionDigits: 1 })} mm. Source: Meteorological Service Singapore [2].</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${Hh}`} role="img" aria-label="Bar chart of mean monthly rainfall in millimetres. Wettest month December, 331.9 mm; driest February, 105.1 mm." data-reveal="bars">
        {[0, 100, 200, 300].map((v) => {
          const y = pad.t + (1 - v / max) * (Hh - pad.t - pad.b)
          return (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} className="grid" />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" className="axis">
                {v}
              </text>
            </g>
          )
        })}
        <text x={10} y={pad.t + 4} className="axis unit">
          mm
        </text>
        {MONTHLY_RAIN_MM.map((d, i) => {
          const h = (d.mm / max) * (Hh - pad.t - pad.b)
          const x = pad.l + i * bw + bw * 0.18
          const y = Hh - pad.b - h
          return (
            <g key={d.m} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${d.m}: ${d.mm} mm`}>
              <rect x={pad.l + i * bw} y={pad.t} width={bw} height={Hh - pad.t - pad.b} fill="transparent" />
              <rect className="bar" data-on={hover === i} x={x} y={y} width={bw * 0.64} height={h} style={{ transformOrigin: `${x}px ${Hh - pad.b}px`, ['--d' as string]: `${i * 0.05}s` }} />
              <text x={x + bw * 0.32} y={Hh - 10} textAnchor="middle" className="axis">
                {d.m}
              </text>
              {hover === i && (
                <text x={x + bw * 0.32} y={y - 8} textAnchor="middle" className="barval">
                  {d.mm}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <table className="sr-only">
        <caption>Mean monthly rainfall (mm), Changi, 1991 to 2020</caption>
        <tbody>
          {MONTHLY_RAIN_MM.map((d) => (
            <tr key={d.m}>
              <th scope="row">{d.m}</th>
              <td>{d.mm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

export function Evidence() {
  const root = useRef<HTMLElement>(null)
  const setSourcesOpen = useStore((s) => s.setSourcesOpen)
  useReveal(root)
  return (
    <section className="evidence" id="research" ref={root} aria-labelledby="research-title">
      <div className="ev-head">
        <Split as="h2" id="research-title" className="display-2" text="Evidence that earns the ambition." />
        <ul className="legend" aria-label="Key">
          <li><span className="sw sw-pub" aria-hidden="true" />Published evidence, measured elsewhere</li>
          <li><span className="sw sw-ass" aria-hidden="true" />Our scenario assumptions</li>
          <li><span className="sw sw-unk" aria-hidden="true" />Unknown until an on-site study</li>
        </ul>
      </div>

      <div className="ev-block ev-pub">
        <header className="ev-label">
          <span className="sw sw-pub" aria-hidden="true" />
          <h3>Published evidence at another school</h3>
        </header>
        <p className="ev-meta">Alexandra Primary School, 12 months, NUS + BCA + NParks. Not a promise for SJI International.</p>
        <div className="figures" data-reveal="pop">
          {PUBLISHED.map((f) => (
            <div className="figure" key={f.label}>
              <p className="fig-num">
                {f.prefix && <small>{f.prefix}</small>}
                <span data-reveal="count" data-to={f.value} data-dec={f.decimals}>
                  {f.value.toFixed(f.decimals)}
                </span>
                <span className="fig-unit">{f.unit}</span>
              </p>
              <p className="fig-label">{f.label}</p>
              <p className="fig-cmp">{f.comparison}</p>
              <details className="prov">
                <summary>Provenance</summary>
                <p>{f.caveat}</p>
                <p>
                  <SourceLink id={f.source} />
                </p>
              </details>
            </div>
          ))}
        </div>
        <RainChart />
      </div>

      <Calculator />

      <div className="ev-block ev-unk">
        <header className="ev-label">
          <span className="sw sw-unk" aria-hidden="true" />
          <h3>Unknowns that need an on-site study</h3>
        </header>
        <p className="unk-line">
          {UNKNOWNS.map((u, i) => (
            <span key={u.title} title={u.body}>
              {u.title}
              {i < UNKNOWNS.length - 1 ? ' / ' : ''}
            </span>
          ))}
        </p>
        <button type="button" className="btn-link" onClick={() => setSourcesOpen(true)}>
          Open all sources
        </button>
      </div>
    </section>
  )
}
