// Shared dimensions for the concept model (metres, approximate).
// The front façade faces +z. The candidate roof wing is the right-hand wing (+x).
// These are design-model numbers, not surveyed measurements.

export const H = 11 // roof deck height
export const FRONT_Z = 10 // outer face of the façade
export const BACK_Z = -10
export const WING_X = 32 // half width of the building

export const BAY = { x0: -4.4, x1: 4.4, depth: 1.6, h: 13.2 }

export const LEFT = { x0: -WING_X, x1: BAY.x0, arches: 5 }
export const RIGHT = { x0: BAY.x1, x1: WING_X, arches: 6 }

export const TIERS = [
  { y0: 1.2, h: 3.9, w: 3.1 },
  { y0: 6.1, h: 3.9, w: 3.1 },
]

export const DOME = { x: 0, z: -1.5, drumR: 4.1, drumH: 2.2, r: 4.3 }

// Roof intervention zones (right wing)
export const PV = { x0: 11, x1: 23.6, z0: -8.4, z1: 6.6, lowY: H + 3.0, highY: H + 3.8 }
export const PATH = { x0: 24.2, x1: 25.6 }
export const BEDS = { x0: 26.4, x1: 30.6, zs: [-6.6, -3.2, 0.2, 3.6] }

// Cutaway service zone at the +x end
export const CUT = { x0: 27, x1: WING_X, z0: -3, z1: 7.2, y0: 0.3, mid: 5.6, y1: 10.6 }

export const TANK = { x: 36.2, y: 1.25, z: 5, r: 1.1, len: 5 }
export const GARDEN = { x: 43.5, z: 8.5, r: 4.2 }
export const DOWNPIPE = { x: 32.35, z: 8.7 }

export const SWITCHBOARD: [number, number, number] = [27.35, 7.6, 1.4]
export const PV_METER: [number, number, number] = [27.35, 7.6, 3.6]
export const WATER_METER: [number, number, number] = [31.2, 1.9, 6.2]
export const TOILET_ZS = [-1.6, 1.4, 4.4]
