export type Mode = 'overview' | 'solar' | 'rain' | 'roots' | 'reach'
export type ReturnId = Exclude<Mode, 'overview'>

export interface ReturnInfo {
  id: ReturnId
  name: string
  word: string // the poster word
  colour: string
  outcome: string
  headline: string
  story: string[]
  panel: { title: string; points: string[]; warning?: string }
}

export const RETURNS: ReturnInfo[] = [
  {
    id: 'solar',
    name: 'Sunlight',
    word: 'Sun',
    colour: 'var(--gold)',
    outcome: 'Solar panels make renewable electricity on site.',
    headline: 'Power above. Life below.',
    story: [
      'Elevated panels and shade-tolerant roof plants share the same rooftop zone. The PV generates electricity while the plants below provide greenery and keep the roof surface cooler.',
      'The real arrangement would need structural and electrical review before anything is built.',
    ],
    panel: {
      title: 'Sunlight',
      points: [
        'Sunlight reaches elevated PV panels on steel frames.',
        'A separate cable (gold line) runs to an inverter and switchboard with its own meter.',
        'Low, shade-tolerant planting grows in the partial shade beneath.',
        'The PV adds electricity to the building. It does not power the whole school.',
      ],
    },
  },
  {
    id: 'rain',
    name: 'Rain',
    word: 'Rain',
    colour: 'var(--water)',
    outcome: 'Rainwater flushes toilets. Only water actually delivered counts.',
    headline: 'A downpour can do more.',
    story: [
      'Rain follows a screened gutter and downpipe into a sealed, maintained tank at ground level. A separate, labelled non-potable pipe then supplies toilet flushing only.',
      'When the tank is full, an engineered overflow sends the surplus to a planted rain garden. There is no drinking-water claim.',
    ],
    panel: {
      title: 'Rain',
      points: [
        'Gutter and leaf screen at the roof edge, then a downpipe with a first-flush filter.',
        'Sealed, mosquito-proof ground-level tank.',
        'Pump and a separate, labelled non-potable pipe to flush cisterns only.',
        'Overflow follows a second, separate route to a rain garden.',
      ],
      warning: 'Not for drinking or handwashing.',
    },
  },
  {
    id: 'roots',
    name: 'Roots',
    word: 'Roots',
    colour: 'var(--leaf)',
    outcome: 'Shade plants under the panels. Food beds in the sun, for the canteen if food-safety approved.',
    headline: 'Grow something we can share.',
    story: [
      'A few sunny raised beds, not a farm, could grow herbs and leafy greens for a modest canteen trial if the operator and school approve.',
      'Students can measure growth, survival and harvest weight, and see how a school uses its space, water and sun.',
    ],
    panel: {
      title: 'Roots',
      points: [
        'Under the panels: low, shade-tolerant planting on a lightweight green-roof build-up.',
        'In open sun: a few raised edible beds, separated from the PV zone by a path.',
        'The drainage layer under the planting carries water away. It does not feed the food beds.',
        'Harvest use depends on canteen and food-safety approval.',
      ],
    },
  },
  {
    id: 'reach',
    name: 'Reach',
    word: 'Reach',
    colour: 'var(--green)',
    outcome: 'If the school approves, 20% of verified net savings could fund bursaries. No amount is promised.',
    headline: 'When the roof saves, students could benefit.',
    story: [
      'Meters log solar generation and the water delivered to flushing. Running, maintenance and contract costs are logged too.',
      'If the school adopts the proposal, 20% of verified annual net savings could go to the Scholarships and Bursaries Fund. There is no guaranteed amount.',
    ],
    panel: {
      title: 'Reach',
      points: [
        'PV meter: kWh generated.',
        'Water meter: m³ delivered to flushing.',
        'Costs: operation, maintenance, financing or PPA.',
        'Only a verified, positive net saving could be shared, and only if the school approves.',
      ],
    },
  },
]

export const OVERVIEW_PANEL = {
  title: 'Overview',
  points: [
    'One candidate side wing. The dome, entrance and front of the building stay as designed.',
    'Gold: PV electricity. Blue: non-potable rainwater. Slate: overflow to the rain garden.',
    'Drag to orbit, pinch or use the zoom buttons, and tap a marker to inspect a part.',
  ],
}

export const MODE_LABEL: Record<Mode, string> = {
  overview: 'Overview',
  solar: 'Sunlight',
  rain: 'Rain',
  roots: 'Roots',
  reach: 'Reach',
}

export const returnById = (id: ReturnId) => RETURNS.find((r) => r.id === id)!
