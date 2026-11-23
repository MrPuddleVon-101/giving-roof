import { useState, useId } from 'react'
import { SOLAR_DEFAULTS, RAIN_DEFAULTS, solarGeneration, rainPotential, fmt } from '../data/calculations'

function Slider({ label, value, min, max, step, unit, onChange, src }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void; src: string }) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>
        <span>{label}</span>
        <output htmlFor={id}>
          {fmt(value, step < 1 ? (step < 0.01 ? 4 : 2) : 0)} {unit}
        </output>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ ['--p' as string]: `${((value - min) / (max - min)) * 100}%` }} />
      <p className="field-src">{src}</p>
    </div>
  )
}

function Num({ label, value, onChange, unit, src, placeholder, step = 1 }: { label: string; value: number | null; onChange: (v: number | null) => void; unit: string; src?: string; placeholder?: string; step?: number }) {
  const id = useId()
  return (
    <div className="field num">
      <label htmlFor={id}>
        <span>{label}</span>
      </label>
      <div className="num-in">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min={0}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
        <span>{unit}</span>
      </div>
      {src && <p className="field-src">{src}</p>}
    </div>
  )
}

export function Calculator() {
  const [kwp, setKwp] = useState(SOLAR_DEFAULTS.capacityKwp)
  const [yLo, setYLo] = useState<number | null>(SOLAR_DEFAULTS.yieldLow)
  const [yHi, setYHi] = useState<number | null>(SOLAR_DEFAULTS.yieldHigh)
  const [area, setArea] = useState(RAIN_DEFAULTS.catchmentM2)
  const [rainM, setRainM] = useState(RAIN_DEFAULTS.rainfallM)
  const [cap, setCap] = useState(RAIN_DEFAULTS.captureFactor)
  const [tip, setTip] = useState(false)

  const solar = solarGeneration(kwp, yLo ?? 0, yHi ?? 0)
  const rain = rainPotential(area, rainM, cap)
  const isDefault =
    kwp === SOLAR_DEFAULTS.capacityKwp && yLo === SOLAR_DEFAULTS.yieldLow && yHi === SOLAR_DEFAULTS.yieldHigh && area === RAIN_DEFAULTS.catchmentM2 && rainM === RAIN_DEFAULTS.rainfallM && cap === RAIN_DEFAULTS.captureFactor

  const reset = () => {
    setKwp(SOLAR_DEFAULTS.capacityKwp)
    setYLo(SOLAR_DEFAULTS.yieldLow)
    setYHi(SOLAR_DEFAULTS.yieldHigh)
    setArea(RAIN_DEFAULTS.catchmentM2)
    setRainM(RAIN_DEFAULTS.rainfallM)
    setCap(RAIN_DEFAULTS.captureFactor)
  }

  return (
    <div className="ev-block ev-ass" id="calculator">
      <header className="ev-label">
        <span className="sw sw-ass" aria-hidden="true" />
        <h3>Scenario based on assumptions</h3>
        <button type="button" className="btn-link small" onClick={reset} disabled={isDefault}>
          Reset to poster defaults
        </button>
      </header>

      <div className="calc">
        <div className="calc-card">
          <h4>Sunlight: potential PV generation</h4>
          <Slider label="Roof-safe PV capacity" value={kwp} min={20} max={400} step={10} unit="kWp" onChange={setKwp} src="Assumed" />
          <div className="pair">
            <Num label="Specific yield, low" value={yLo} onChange={setYLo} unit="kWh/kWp/yr" src="BCA/EMA handbook [3]" />
            <Num label="Specific yield, high" value={yHi} onChange={setYHi} unit="kWh/kWp/yr" />
          </div>
          <div className="result" aria-live="polite">
            <p className="eq">
              {fmt(kwp)} kWp × {fmt(yLo ?? 0)}–{fmt(yHi ?? 0)} kWh/kWp/yr
            </p>
            <p className="big">
              {fmt(solar.lowKwh)}–{fmt(solar.highKwh)} <span>kWh/year</span>
            </p>
            <p className="eq">
              = {fmt(solar.lowKwh / 1000, 0)}–{fmt(solar.highKwh / 1000, 0)} MWh/year of potential generation
            </p>
          </div>
          <p className="fine">Not school bill savings. A power-purchase agreement may change who owns the panels or benefits from the output.</p>
        </div>

        <div className="calc-card">
          <h4>
            Rain: theoretical potential collection
            <button type="button" className="info" aria-expanded={tip} aria-controls="tip-delivered" onClick={() => setTip(!tip)} onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
              <span aria-hidden="true">i</span>
              <span className="sr-only">Potential collection versus water delivered</span>
            </button>
          </h4>
          <div id="tip-delivered" className="tip" role="note" hidden={!tip}>
            <strong>Potential collection</strong> is rain that could be caught in an average year. <strong>Water delivered</strong> is
            what actually reaches the flush cisterns, which is limited by toilet demand, first flush, tank size, overflow and downtime.
            Only delivered water counts as potable water displaced.
          </div>
          <Slider label="Connected roof catchment" value={area} min={100} max={3000} step={50} unit="m²" onChange={setArea} src="Assumed" />
          <Slider label="Mean annual rainfall" value={rainM} min={1.5} max={2.8} step={0.0001} unit="m/yr" onChange={setRainM} src="MSS 1991 to 2020 mean [2]" />
          <Slider label="Capture factor" value={cap} min={0.4} max={0.9} step={0.01} unit="" onChange={setCap} src="Assumed" />
          <div className="result" aria-live="polite">
            <p className="eq">
              {fmt(area)} m² × {fmt(rainM, 4)} m/yr × {fmt(cap, 2)}
            </p>
            <p className="big">
              {fmt(rain.m3, 2)} <span>m³/year</span>
            </p>
            <p className="eq">= {fmt(rain.litres)} litres/year (1 m³ = 1,000 L), theoretical potential only</p>
          </div>
        </div>

      </div>
    </div>
  )
}
