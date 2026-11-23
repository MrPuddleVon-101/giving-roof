import type { Mode } from '../data/returns'

export type Vec3 = [number, number, number]
export interface CamTarget {
  pos: Vec3
  look: Vec3
}

// Named camera states. Desktop values; mobile pulls the camera back (see scale below).
export const CAMS = {
  facade: { pos: [-4, 8, 66], look: [4, 7, 0] },
  roofCorner: { pos: [58, 30, 46], look: [20, 10, 0] },
  overview: { pos: [70, 46, 66], look: [14, 6, 0] },
  solar: { pos: [6, 18.5, 30], look: [19, 12.6, -1] },
  rain: { pos: [52, 7.5, 22], look: [32, 3.4, 3] },
  roots: { pos: [44, 24, 22], look: [25, 11, -1] },
  reach: { pos: [52, 15, 14], look: [29, 5.8, 2.5] },
  top: { pos: [34, 82, 52], look: [14, 6, -2] },
  exploded: { pos: [58, 24, 46], look: [22, 14, 0] },
} satisfies Record<string, CamTarget>

export type CamName = keyof typeof CAMS

export const MODE_CAM: Record<Mode, CamName> = {
  overview: 'overview',
  solar: 'solar',
  rain: 'rain',
  roots: 'roots',
  reach: 'reach',
}

export const BOUNDS = {
  minDistance: 9,
  maxDistance: 140,
  minPolarAngle: 0.12,
  maxPolarAngle: 1.48,
  minAzimuthAngle: -1.35,
  maxAzimuthAngle: 2.2,
}

/** Narrow screens need the camera further away to keep the subject in frame. */
export function scaled(t: CamTarget, narrow: boolean): CamTarget {
  if (!narrow) return t
  const k = 1.75
  const [px, py, pz] = t.pos
  const [lx, ly, lz] = t.look
  return { pos: [lx + (px - lx) * k, ly + (py - ly) * k, lz + (pz - lz) * k], look: t.look }
}
