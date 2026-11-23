import type { SourceId } from './sources'

export interface SdgLink {
  goal: number
  target: string
  name: string
  colour: string // official UN SDG goal colour
  primary?: boolean
  targetText: string
  how: string
  source: SourceId
}

export const SDGS: SdgLink[] = [
  {
    goal: 12,
    target: '12.2',
    name: 'Responsible consumption and production',
    colour: '#BF8B2E',
    primary: true,
    targetText: 'By 2030, achieve the sustainable management and efficient use of natural resources.',
    how: 'One roof, many jobs: power, water, plants and data.',
    source: 'sdg12',
  },
  {
    goal: 7,
    target: '7.2',
    name: 'Affordable and clean energy',
    colour: '#FCC30B',
    targetText: 'By 2030, increase substantially the share of renewable energy in the global energy mix.',
    how: 'Rooftop solar adds renewable electricity on site.',
    source: 'sdg7',
  },
  {
    goal: 6,
    target: '6.4',
    name: 'Clean water and sanitation',
    colour: '#26BDE2',
    targetText: 'By 2030, substantially increase water-use efficiency across all sectors.',
    how: 'Rainwater, not tap water, for flushing, if the plumbing is approved.',
    source: 'sdg6',
  },
  {
    goal: 4,
    target: '4.7',
    name: 'Quality education',
    colour: '#C5192D',
    targetText: 'By 2030, ensure that all learners acquire the knowledge and skills needed to promote sustainable development.',
    how: 'Students measure a real system and publish what they find.',
    source: 'sdg4',
  },
]
