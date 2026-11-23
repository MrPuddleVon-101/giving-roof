// Every external fact on the page points to one of these entries.
// Checked against the live pages on 23 Nov 2026.

export type SourceId =
  | 'nus'
  | 'mss'
  | 'sjiFutures'
  | 'sjiValues'
  | 'bca'
  | 'pub'
  | 'ema'
  | 'sdg12'
  | 'sdg7'
  | 'sdg6'
  | 'sdg4'

export interface Source {
  id: SourceId
  n: number
  title: string
  publisher: string
  note: string
  url?: string
}

export const SOURCES: Source[] = [
  {
    id: 'nus',
    n: 1,
    title: 'Green roofs and solar panels a winning combo for building owners',
    publisher: 'NUS News, 11 Sep 2025. Study by NUS, BCA and NParks; paper in Applied Energy 395 (2025) 126133',
    note: 'Alexandra Primary School rooftop, monitored Nov 2021 to Oct 2022. Four setups: bare concrete, bare green roof, PV on concrete, PV over green roof.',
    url: 'https://news.nus.edu.sg/green-roofs-solar-panels-winning-combo-for-building-owners/',
  },
  {
    id: 'mss',
    n: 2,
    title: 'Climate of Singapore',
    publisher: 'Meteorological Service Singapore',
    note: 'Climatological reference period 1991 to 2020, Changi Climate Station. Mean annual rainfall 2,113.3 mm.',
    url: 'https://www.weather.gov.sg/climate-climate-of-singapore/',
  },
  {
    id: 'bca',
    n: 3,
    title: 'Handbook for Solar Photovoltaic Systems, section 2.6',
    publisher: 'BCA and EMA',
    note: 'Typical crystalline PV yield in Singapore of about 1,100 to 1,250 kWh per kWp per year. Cited on the Group 11A academic poster.',
  },
  {
    id: 'pub',
    n: 4,
    title: 'Guidance Notes for Rainwater Harvesting Systems, Rev. 3 (Oct 2025)',
    publisher: 'PUB, Singapore’s National Water Agency',
    note: 'Approval process, permitted non-potable uses, separate labelled pipes and mosquito control. Cited on the Group 11A academic poster.',
  },
  {
    id: 'ema',
    n: 5,
    title: 'Solar leasing and power purchase agreements, FAQ',
    publisher: 'Energy Market Authority',
    note: 'A PPA can avoid upfront PV capital but changes who owns the system and how savings are shared.',
  },
  {
    id: 'sjiFutures',
    n: 6,
    title: 'Building Futures',
    publisher: 'SJI International',
    note: 'The school plans to move from Thomson Road to a new Serangoon campus in 2030; the page states that new campus plans are subject to final approvals.',
    url: 'https://www.sji-international.com.sg/giving/building-futures',
  },
  {
    id: 'sjiValues',
    n: 7,
    title: 'Vision, Mission and Values',
    publisher: 'SJI International',
    note: 'Vision: To Learn, Inspire and Serve. Values: Faith, Service, Community, Excellence, Respect.',
    url: 'https://www.sji-international.com.sg/about/vision-mission-values',
  },
  {
    id: 'sdg12',
    n: 8,
    title: 'Goal 12, target 12.2',
    publisher: 'United Nations, Department of Economic and Social Affairs',
    note: 'By 2030, achieve the sustainable management and efficient use of natural resources.',
    url: 'https://sdgs.un.org/goals/goal12',
  },
  {
    id: 'sdg7',
    n: 9,
    title: 'Goal 7, target 7.2',
    publisher: 'United Nations, Department of Economic and Social Affairs',
    note: 'By 2030, increase substantially the share of renewable energy in the global energy mix.',
    url: 'https://sdgs.un.org/goals/goal7',
  },
  {
    id: 'sdg6',
    n: 10,
    title: 'Goal 6, target 6.4',
    publisher: 'United Nations, Department of Economic and Social Affairs',
    note: 'By 2030, substantially increase water-use efficiency across all sectors.',
    url: 'https://sdgs.un.org/goals/goal6',
  },
  {
    id: 'sdg4',
    n: 11,
    title: 'Goal 4, target 4.7',
    publisher: 'United Nations, Department of Economic and Social Affairs',
    note: 'By 2030, ensure that all learners acquire the knowledge and skills needed to promote sustainable development.',
    url: 'https://sdgs.un.org/goals/goal4',
  },
]

export const sourceById = (id: SourceId) => SOURCES.find((s) => s.id === id)!
