import type { SourceId } from './sources'

// Published evidence measured somewhere else. Never present as SJI International results.
export interface PublishedFinding {
  value: number
  decimals: number
  prefix?: string
  unit: string
  label: string
  comparison: string
  caveat: string
  source: SourceId
}

export const PUBLISHED: PublishedFinding[] = [
  {
    value: 1.3,
    decimals: 1,
    unit: '%',
    label: 'higher average PV performance ratio',
    comparison: 'PV over greenery vs PV over concrete, clear-sky conditions',
    caveat: 'A performance ratio, not extra electricity for SJI International.',
    source: 'nus',
  },
  {
    value: 19.8,
    decimals: 1,
    unit: '%',
    label: 'higher horizontal plant coverage',
    comparison: 'Green roof with PV vs green roof without PV',
    caveat: 'Partial shade from the panels helped plants cover more of the roof.',
    source: 'nus',
  },
  {
    value: 4.7,
    decimals: 1,
    prefix: 'up to ',
    unit: '°C',
    label: 'lower roof-surface temperature',
    comparison: 'PV over greenery vs bare concrete roof',
    caveat: 'A surface temperature, not an air temperature.',
    source: 'nus',
  },
  {
    value: 3,
    decimals: 0,
    prefix: 'up to ',
    unit: '°C',
    label: 'lower indoor ceiling-surface temperature',
    comparison: 'PV over greenery vs PV over concrete',
    caveat: 'Measured on the ceiling surface below, not room air.',
    source: 'nus',
  },
]

export const STUDY_META =
  'Alexandra Primary School, Singapore. A 12-month rooftop experiment by NUS, BCA and NParks (Nov 2021 to Oct 2022) comparing four roof types.'

// Meteorological Service Singapore, Changi Climate Station, 1991 to 2020 mean monthly rainfall (mm).
export const MONTHLY_RAIN_MM: { m: string; mm: number }[] = [
  { m: 'Jan', mm: 221.6 },
  { m: 'Feb', mm: 105.1 },
  { m: 'Mar', mm: 151.7 },
  { m: 'Apr', mm: 164.3 },
  { m: 'May', mm: 164.3 },
  { m: 'Jun', mm: 135.3 },
  { m: 'Jul', mm: 146.6 },
  { m: 'Aug', mm: 146.9 },
  { m: 'Sep', mm: 124.9 },
  { m: 'Oct', mm: 168.3 },
  { m: 'Nov', mm: 252.3 },
  { m: 'Dec', mm: 331.9 },
]
export const ANNUAL_RAIN_MM = 2113.3

// What we do not know yet. Each needs an on-site study.
export const UNKNOWNS: { title: string; body: string }[] = [
  { title: 'Roof area and loading', body: 'Which wing is suitable, its usable area, and the extra weight it can safely carry once wet soil, frames and people are added.' },
  { title: 'Shading and PV layout', body: 'Real sun hours, shading from the dome and plant rooms, and the panel spacing plants need.' },
  { title: 'Toilet flushing demand', body: 'Daily flushing volume on school days, holidays and exam periods. Delivered water can never exceed this.' },
  { title: 'Tank size and first flush', body: 'Storage that balances cost, space and the dry spells between storms.' },
  { title: 'Bills and contracts', body: 'Baseline electricity and water bills, tariffs, and whether a PPA or purchase would fund the panels.' },
  { title: 'Approvals', body: 'Structural sign-off, PUB rainwater approval for the non-potable system, and canteen food-safety rules.' },
  { title: 'Running costs', body: 'Cleaning, plant care, pump power, inspections and repairs, all subtracted before any saving counts.' },
  { title: 'Canteen interest', body: 'Which herbs or leafy greens the operator could actually use, and how harvests would be checked.' },
]
