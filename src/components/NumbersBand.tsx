import { useRef } from 'react'
import { useReveal } from '../motion/useReveal'
import { scrollToId } from '../motion/motion'
import { Odometer } from './Odometer'

const NUMS = [
  { v: '220–250', unit: 'MWh/yr', label: 'potential solar, 200 kWp scenario', kind: 'ass' },
  { v: '1,480', unit: 'm³/yr', label: 'theoretical rain catch, 1,000 m² scenario', kind: 'ass' },
  { v: '2,113.3', unit: 'mm', label: 'Singapore mean annual rain, 1991–2020 (MSS)', kind: 'pub' },
  { v: '20', unit: '%', label: 'of verified net savings to bursaries, if approved', kind: 'ass' },
] as const

export function NumbersBand() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)
  return (
    <section className="numbers" ref={root} aria-label="Key numbers">
      <ul className="num-grid" data-reveal="pop">
        {NUMS.map((n) => (
          <li key={n.label}>
            <p className="num-big">
              {n.label.startsWith('theoretical') && <span className="approx">≈</span>}
              <Odometer value={n.v} />
              <small>{n.unit}</small>
            </p>
            <p className="num-label">{n.label}</p>
            <p className="num-kind">
              <span className={`sw sw-${n.kind}`} aria-hidden="true" />
              {n.kind === 'pub' ? 'Published data' : 'Scenario assumption'}
            </p>
          </li>
        ))}
      </ul>
      <a className="btn-link" href="#research" onClick={(e) => { e.preventDefault(); scrollToId('research') }}>
        How we got these
      </a>
    </section>
  )
}
