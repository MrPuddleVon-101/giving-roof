import { useState, useId } from 'react'

// Diagram, no money figures: meters feed a verified net saving; only if the
// school approves does a 20% share move to the Scholarships and Bursaries Fund.

const GAUGES = [
  { x: 110, label: 'PV meter', unit: 'kWh', speed: 6 },
  { x: 320, label: 'Flushing water', unit: 'm³', speed: 9 },
  { x: 530, label: 'Running costs', unit: 'logged', speed: 13 },
]

export function ReachScene() {
  const [approved, setApproved] = useState(false)
  const [net, setNet] = useState(0.6)
  const bw = 300 * net
  const id = useId()
  return (
    <div className="scene reach-scene" data-approved={approved}>
      <svg viewBox="0 0 640 440" className="scene-svg" role="img" aria-label={`Diagram: three meters feed a verified net saving. ${approved ? 'With school approval, 20 percent of the verified net saving moves to the Scholarships and Bursaries Fund.' : 'Without school approval, nothing is allocated.'}`}>
        <rect width="640" height="440" fill="#0b4b2c" />
        {GAUGES.map((g) => (
          <g key={g.label} transform={`translate(${g.x} 96)`}>
            <circle r="54" fill="#0f5e37" stroke="#a9dcbc" strokeWidth="2" />
            {Array.from({ length: 12 }, (_, k) => (
              <line key={k} x1="0" y1="-46" x2="0" y2="-38" stroke="#a9dcbc" strokeWidth="2" transform={`rotate(${k * 30})`} />
            ))}
            <g className="needle" style={{ animationDuration: `${g.speed}s` }}>
              <line x1="0" y1="0" x2="0" y2="-40" stroke="#ffc21a" strokeWidth="4" strokeLinecap="round" />
            </g>
            <circle r="6" fill="#ffc21a" />
            <text y="78" textAnchor="middle" className="svg-label light">
              {g.label}
            </text>
            <text y="96" textAnchor="middle" className="svg-small light">
              {g.unit}
            </text>
          </g>
        ))}
        {/* logs converge */}
        {GAUGES.map((g) => (
          <path key={g.x} d={`M${g.x} 200 C${g.x} 230 320 220 320 246`} fill="none" stroke="#a9dcbc" strokeWidth="2" strokeDasharray="4 8" className="march" />
        ))}
        <rect x="170" y="246" width="300" height="50" fill="#f3eee3" />
        <text x="320" y="268" textAnchor="middle" className="svg-label">
          Verified net saving
        </text>
        <text x="320" y="286" textAnchor="middle" className="svg-small">
          bill reduction minus running and contract costs
        </text>
        {/* the net saving bar and its 20% share, sized by the slider (no units) */}
        <rect x="170" y="300" width="300" height="16" fill="rgba(243,238,227,.08)" />
        <rect x="170" y="300" width={bw * 0.8} height="16" fill="#f3eee3" style={{ transition: 'width .3s' }} />
        <rect x={170 + bw * 0.8} y="300" width={bw * 0.2} height="16" fill={approved ? '#ffc21a' : 'none'} stroke={approved ? 'none' : '#a9dcbc'} strokeDasharray={approved ? undefined : '4 4'} style={{ transition: 'all .3s' }} />
        <text x={170 + bw * 0.9} y="312" textAnchor="middle" className="svg-small" fill={approved ? '#14213d' : '#a9dcbc'}>
          20%
        </text>
        <path d={`M${170 + bw * 0.9} 318 C${170 + bw * 0.9} 360 320 340 320 372`} fill="none" stroke={approved ? '#ffc21a' : 'rgba(169,220,188,.35)'} strokeWidth="3" strokeDasharray="6 8" className={approved ? 'march' : ''} />
        <rect x="150" y="372" width="340" height="50" fill={approved ? '#ffc21a' : 'transparent'} fillOpacity={approved ? 0.35 + net * 0.65 : 1} stroke={approved ? 'none' : '#a9dcbc'} strokeWidth="2" style={{ transition: 'fill .6s' }} />
        <text x="320" y="394" textAnchor="middle" className="svg-label" fill={approved ? '#14213d' : '#f3eee3'}>
          Scholarships and Bursaries Fund
        </text>
        <text x="320" y="412" textAnchor="middle" className="svg-small" fill={approved ? '#14213d' : '#a9dcbc'}>
          {approved ? '20% of verified net savings, after approval' : 'no allocation without school approval'}
        </text>
      </svg>
      <label className="switch" htmlFor={id}>
        <input id={id} type="checkbox" role="switch" checked={approved} onChange={(e) => setApproved(e.target.checked)} />
        <span className="switch-track" aria-hidden="true">
          <i />
        </span>
        <span>School approves the 20% rule</span>
      </label>
      <label className="net-range">
        <span>Drag the verified saving (illustration)</span>
        <input type="range" min={0.1} max={1} step={0.01} value={net} onChange={(e) => setNet(Number(e.target.value))} style={{ ['--p' as string]: `${((net - 0.1) / 0.9) * 100}%` }} />
      </label>
      <p className="scene-cap light">Proposal only. No amount is promised.</p>
    </div>
  )
}
