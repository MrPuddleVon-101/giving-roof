import type { Mode } from './returns'
import type { CamTarget, Vec3 } from '../three/cameraTargets'
import { H, PV, BEDS, TANK, GARDEN, DOWNPIPE, SWITCHBOARD, DOME, CUT } from '../three/layout'

export interface Hotspot {
  id: string
  label: string
  modes: Mode[] // which modes show this marker
  at: Vec3 // anchor in world space
  cam: CamTarget
  title: string
  body: string
  tag?: string
}

export const HOTSPOTS: Hotspot[] = [
  {
    id: 'pv',
    label: 'PV canopy',
    modes: ['overview', 'solar'],
    at: [(PV.x0 + PV.x1) / 2, PV.highY + 0.6, -1],
    cam: { pos: [10, 26, 26], look: [17, 13, -1] },
    title: 'Elevated PV canopy',
    body: 'Individual panels on steel frames, high enough for maintenance access and air flow. Panel count and tilt here are illustrative; a roof survey would set the real layout.',
  },
  {
    id: 'shade',
    label: 'Shade planting',
    modes: ['solar', 'roots'],
    at: [15, H + 0.9, 4.5],
    cam: { pos: [6, 13.4, 16], look: [16, 11.8, 0] },
    title: 'Low planting beneath the panels',
    body: 'Shade-tolerant groundcover on a lightweight green-roof build-up. In the Alexandra Primary study, plants under PV reached 19.8% higher horizontal coverage than a green roof without PV.',
  },
  {
    id: 'beds',
    label: 'Edible beds',
    modes: ['overview', 'roots'],
    at: [(BEDS.x0 + BEDS.x1) / 2, H + 1.6, -1.5],
    cam: { pos: [40, 19, 12], look: [28.4, 11.2, -1.5] },
    title: 'Sunny raised beds',
    body: 'Four raised beds in open sun, apart from the PV zone. A modest herb and leafy-green trial, with harvest weight logged. Canteen use only with food-safety permission.',
  },
  {
    id: 'drain',
    label: 'Drainage layer',
    modes: ['roots'],
    at: [12, H + 0.35, 7.6],
    cam: { pos: [6, 13.5, 20], look: [13, 11, 5] },
    title: 'Drainage layer, not a supply pipe',
    body: 'Beneath the planting, a drainage and filter layer carries excess water to roof outlets. It does not feed the edible beds, which are watered and managed separately.',
  },
  {
    id: 'gutter',
    label: 'Gutter and screen',
    modes: ['overview', 'rain'],
    at: [DOWNPIPE.x, H + 0.6, DOWNPIPE.z],
    cam: { pos: [46, 18, 24], look: [32, 9, 6] },
    title: 'Screened gutter and downpipe',
    body: 'A leaf screen and a first-flush filter keep debris and the dirtiest early runoff out of the tank.',
  },
  {
    id: 'tank',
    label: 'Sealed tank',
    modes: ['overview', 'rain', 'reach'],
    at: [TANK.x, TANK.y + 1.7, TANK.z],
    cam: { pos: [50, 7, 16], look: [35, 1.8, 4.5] },
    title: 'Sealed ground-level tank',
    body: 'Closed, mosquito-proof and maintained. Stored rainwater is non-potable and supplies toilet flushing only.',
    tag: 'Not for drinking or handwashing.',
  },
  {
    id: 'flush',
    label: 'Flush cisterns',
    modes: ['rain', 'reach'],
    at: [28.6, 3.2, 1.4],
    cam: { pos: [44, 5.6, 4], look: [28.5, 2.6, 1.6] },
    title: 'Separate flushing supply',
    body: 'A dedicated, labelled non-potable pipe runs from the tank pump to the flush cisterns. This cutaway location is indicative only; no real washroom has been chosen.',
    tag: 'Not for drinking or handwashing.',
  },
  {
    id: 'overflow',
    label: 'Overflow to rain garden',
    modes: ['overview', 'rain'],
    at: [GARDEN.x, 1.4, GARDEN.z],
    cam: { pos: [54, 12, 26], look: [41, 1, 7] },
    title: 'Overflow route',
    body: 'A second, separate route. When the tank is full, surplus flows to a planted rain garden at ground level, never back into the flushing supply.',
  },
  {
    id: 'switch',
    label: 'Switchboard and meters',
    modes: ['solar', 'reach'],
    at: [SWITCHBOARD[0] + 0.8, SWITCHBOARD[1] + 1.4, SWITCHBOARD[2] + 1],
    cam: { pos: [44, 9.5, 6], look: [28.5, 7.4, 2.4] },
    title: 'Switchboard and PV meter',
    body: 'PV output passes through an inverter and its own meter, so generation can be logged separately from the school’s total use.',
  },
  {
    id: 'dome',
    label: 'Chapel dome (unchanged)',
    modes: ['overview'],
    at: [DOME.x, H + 9.6, DOME.z],
    cam: { pos: [-6, 22, 40], look: [0, 13, -1] },
    title: 'Chapel dome and cross',
    body: 'Part of the school’s planned campus design. The Giving Roof stays on a side wing and leaves the dome, cross, entrance and front inscription untouched.',
  },
]

export const CUTAWAY_NOTE = `Cutaway location is indicative (x ${CUT.x0}–${CUT.x1} m in the model).`
