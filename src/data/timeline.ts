export interface Phase {
  when: string
  title: string
  body: string
}

// Proposed sequence after school agreement. Not a scheduled construction plan.
export const PHASES: Phase[] = [
  {
    when: 'Month 0',
    title: 'Concept and consultation',
    body: 'Present the proposal. Seek leadership, facilities, canteen and student feedback, and identify a possible roof wing.',
  },
  {
    when: 'Months 1–2',
    title: 'Baseline and feasibility',
    body: 'Roof loading, safe access, shading, drainage, existing PV and power, water demand and canteen interest. Record baseline electricity and water use.',
  },
  {
    when: 'Months 3–4',
    title: 'Engineering and approvals',
    body: 'Validate structure, PV and roof safety. Qualified people assess the non-potable plumbing and any PUB approval. Compare financing options, crops and food-safety plans.',
  },
  {
    when: 'Months 5–8',
    title: 'Pilot and staged installation',
    body: 'A small edible-bed and metering pilot first. Larger components only after approvals and funding.',
  },
  {
    when: 'Months 9–12',
    title: 'Evaluation and decision',
    body: 'Compare meter records, bills and harvest logs against baselines. Calculate verified net savings, then decide whether to expand and whether the conditional bursary allocation proceeds.',
  },
]

export const METRICS = [
  { key: 'kwh', label: 'PV meter', unit: 'kWh', note: 'Generation recorded at the PV meter' },
  { key: 'm3', label: 'Water delivered to flushing', unit: 'm³', note: 'Metered on the non-potable supply' },
  { key: 'kg', label: 'Canteen-accepted harvest', unit: 'kg', note: 'Weighed and logged at handover' },
  { key: 'sgd', label: 'Verified net financial saving', unit: 'S$', note: 'After running and contract costs' },
] as const
