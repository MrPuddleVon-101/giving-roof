// Scenario model from the Group 11A academic poster.
// Pure functions so the numbers can be checked independently of the UI.

export const SOLAR_DEFAULTS = {
  capacityKwp: 200, // assumed roof-safe capacity
  yieldLow: 1100, // kWh per kWp per year, BCA/EMA handbook
  yieldHigh: 1250,
}

export const RAIN_DEFAULTS = {
  catchmentM2: 1000, // assumed connected catchment
  rainfallM: 2.1133, // MSS 1991-2020 mean annual rainfall, metres
  captureFactor: 0.7, // assumed
}

export const BURSARY_SHARE = 0.2

/** kWh per year, low and high */
export function solarGeneration(capacityKwp: number, yieldLow: number, yieldHigh: number) {
  const lo = Math.min(yieldLow, yieldHigh)
  const hi = Math.max(yieldLow, yieldHigh)
  return { lowKwh: capacityKwp * lo, highKwh: capacityKwp * hi }
}

/** cubic metres per year of theoretical potential collection */
export function rainPotential(catchmentM2: number, rainfallM: number, captureFactor: number) {
  const m3 = catchmentM2 * rainfallM * captureFactor
  return { m3, litres: m3 * 1000 }
}

/**
 * Water actually delivered to flush cisterns can never exceed demand.
 * Returns null when no demand has been entered (no baseline exists yet).
 */
export function deliveredCap(potentialM3: number, dailyDemandM3: number | null, schoolDays: number | null) {
  if (dailyDemandM3 == null || schoolDays == null || dailyDemandM3 <= 0 || schoolDays <= 0) return null
  const demand = dailyDemandM3 * schoolDays
  return { demandM3: demand, upperBoundM3: Math.min(potentialM3, demand) }
}

/** verified annual net saving and the conditional bursary share. Inputs are the user's own hypotheticals. */
export function netSavings(billReduction: number | null, operations: number | null, financing: number | null) {
  if (billReduction == null) return null
  const net = billReduction - (operations ?? 0) - (financing ?? 0)
  return { net, bursary: net > 0 ? net * BURSARY_SHARE : 0 }
}

export const fmt = (n: number, d = 0) =>
  n.toLocaleString('en-SG', { minimumFractionDigits: d, maximumFractionDigits: d })
