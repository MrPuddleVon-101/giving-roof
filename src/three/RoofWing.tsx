import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { M, G, rng } from './materials'
import { Inst, boxItem, type InstItem } from './Inst'
import { H, PV, PATH, BEDS, WING_X, FRONT_Z, BACK_Z } from './layout'
import { useStore } from '../state/store'

// The candidate roof wing: waterproofing, drainage, planting, PV canopy,
// sunny raised beds, path and rail. Exploded view lifts each layer.

const X0 = 10.5
const X1 = WING_X - 0.35
const Z0 = BACK_Z + 0.35
const Z1 = FRONT_Z - 0.7
const PLANT_Z0 = PV.z0 - 0.5
const PLANT_Z1 = PV.z1 + 0.4

export const PV_TILT = Math.atan((PV.highY - PV.lowY) / (PV.z1 - PV.z0))
const PV_ZC = (PV.z0 + PV.z1) / 2
const PV_YC = (PV.lowY + PV.highY) / 2
/** Height of the PV plane above a given z */
export const pvYAt = (z: number) => PV_YC - (z - PV_ZC) * Math.tan(PV_TILT)

function useLift(k: number) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const { explode, motionOff } = useStore.getState()
    const target = explode * k
    g.position.y = motionOff ? target : THREE.MathUtils.damp(g.position.y, target, 6, dt)
  })
  return ref
}

const pick = (id: string) => (e: ThreeEvent<MouseEvent>) => {
  e.stopPropagation()
  useStore.getState().setHotspot(id)
}

function Canopy() {
  const ref = useLift(6)
  const { panels, rafters, columns, beams } = useMemo(() => {
    const panels: InstItem[] = []
    const rafters: InstItem[] = []
    const pw = 1.12
    const pl = 1.78
    const nx = Math.floor((PV.x1 - PV.x0) / pw)
    const nz = Math.floor((PV.z1 - PV.z0) / pl)
    const len = (PV.z1 - PV.z0) / Math.cos(PV_TILT)
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < nz; j++) {
        const x = PV.x0 + pw * (i + 0.5)
        const zl = -len / 2 + (len / nz) * (j + 0.5)
        panels.push({ p: [x, 0, zl], s: [pw - 0.05, 0.05, pl - 0.05] })
      }
    const colXs = [PV.x0 + 0.6, PV.x0 + 4.6, PV.x0 + 8.4, PV.x1 - 0.6]
    colXs.forEach((x) => rafters.push({ p: [x, -0.14, 0], s: [0.16, 0.18, len + 0.2] }))
    const beams: InstItem[] = []
    const colZs = [PV.z0 + 0.8, -2.0, 2.6, PV.z1 - 0.6]
    const columns: InstItem[] = []
    colXs.forEach((x) =>
      colZs.forEach((z) => {
        const top = pvYAt(z) - 0.2
        const base = H + 0.45
        columns.push({ p: [x, (top + base) / 2, z], s: [0.2, top - base, 0.2] })
      }),
    )
    colZs.forEach((z) => beams.push({ p: [(PV.x0 + PV.x1) / 2, pvYAt(z) - 0.3, z], s: [PV.x1 - PV.x0, 0.16, 0.16] }))
    return { panels, rafters, columns, beams }
  }, [])
  return (
    <group ref={ref}>
      <group position={[0, PV_YC, PV_ZC]} rotation={[PV_TILT, 0, 0]} onClick={pick('pv')}>
        <Inst geometry={G.box} material={M.pv} items={panels} name="pv" />
        <Inst geometry={G.box} material={M.pvFrame} items={rafters} />
      </group>
      <Inst geometry={G.box} material={M.steel} items={columns} onClick={pick('pv')} />
      <Inst geometry={G.box} material={M.steel} items={beams} />
    </group>
  )
}

function Planting() {
  const ref = useLift(3.4)
  const plants = useMemo(() => {
    const r = rng(42)
    const it: InstItem[] = []
    const greens = ['#4e7d3a', '#5b8a43', '#3f6e33', '#6a9a4e', '#58864a', '#7aa35c']
    for (let x = PV.x0 + 0.1; x < PV.x1 + 0.2; x += 0.62)
      for (let z = PLANT_Z0 + 0.3; z < PLANT_Z1; z += 0.62) {
        if (r() < 0.12) continue
        const s = 0.42 + r() * 0.42
        it.push({
          p: [x + (r() - 0.5) * 0.4, H + 0.45 + s * 0.22, z + (r() - 0.5) * 0.4],
          s: [s * 1.25, s * 0.6, s * 1.25],
          r: [0, r() * 6, 0],
          c: greens[Math.floor(r() * greens.length)],
        })
      }
    return it
  }, [])
  const layers = useMemo(
    () => ({
      drain: boxItem(PV.x0 - 0.3, H + 0.13, PLANT_Z0, PV.x1 + 0.3, H + 0.25, PLANT_Z1),
      soil: boxItem(PV.x0 - 0.2, H + 0.25, PLANT_Z0 + 0.05, PV.x1 + 0.2, H + 0.45, PLANT_Z1 - 0.05),
    }),
    [],
  )
  const beds = useMemo(() => {
    const r = rng(9)
    const boxes: InstItem[] = []
    const soil: InstItem[] = []
    const crops: InstItem[] = []
    const fruit: InstItem[] = []
    const cropCols = ['#79b04f', '#8cc25c', '#5f9a3e', '#a6c96a']
    BEDS.zs.forEach((z, bi) => {
      boxes.push(boxItem(BEDS.x0, H + 0.13, z - 0.7, BEDS.x1, H + 0.95, z + 0.7))
      soil.push(boxItem(BEDS.x0 + 0.1, H + 0.9, z - 0.6, BEDS.x1 - 0.1, H + 0.97, z + 0.6))
      for (let x = BEDS.x0 + 0.45; x < BEDS.x1 - 0.2; x += 0.62)
        for (const dz of [-0.3, 0.3]) {
          const s = 0.35 + r() * 0.2
          crops.push({ p: [x, H + 1.05 + s * 0.3, z + dz], s: [s, s * 0.8, s], r: [0, r() * 6, 0], c: cropCols[(bi + Math.floor(r() * 2)) % cropCols.length] })
          if (bi === 1 && r() > 0.5) fruit.push({ p: [x + 0.08, H + 1.3, z + dz + 0.1], s: 0.11, c: '#c7372f' })
        }
    })
    return { boxes, soil, crops, fruit }
  }, [])
  return (
    <group ref={ref}>
      <mesh position={layers.drain.p} scale={layers.drain.s as [number, number, number]} geometry={G.box} material={M.drain} receiveShadow onClick={pick('drain')} />
      <mesh position={layers.soil.p} scale={layers.soil.s as [number, number, number]} geometry={G.box} material={M.soil} receiveShadow />
      <Inst geometry={G.blob1} material={M.leafShade} items={plants} onClick={pick('shade')} />
      <group onClick={pick('beds')}>
        <Inst geometry={G.box} material={M.wood} items={beds.boxes} />
        <Inst geometry={G.box} material={M.soil} items={beds.soil} cast={false} />
        <Inst geometry={G.blob1} material={M.leafBed} items={beds.crops} />
        <Inst geometry={G.sphere} material={M.leaf} items={beds.fruit} cast={false} />
      </group>
    </group>
  )
}

function Deck() {
  const ref = useLift(1.6)
  const pavers = useMemo(
    () => [
      boxItem(PATH.x0, H + 0.13, Z0 + 0.2, PATH.x1, H + 0.2, Z1 - 0.2),
      boxItem(X0 + 0.2, H + 0.13, PLANT_Z1 + 0.15, X1 - 0.2, H + 0.2, Z1 - 0.15),
      boxItem(PATH.x1, H + 0.13, Z0 + 0.2, X1 - 0.2, H + 0.18, Z1 - 0.2),
    ],
    [],
  )
  return (
    <group ref={ref}>
      <mesh position={[(X0 + X1) / 2, H + 0.08, (Z0 + Z1) / 2]} scale={[X1 - X0, 0.1, Z1 - Z0]} geometry={G.box} material={M.membrane} receiveShadow />
      <Inst geometry={G.box} material={M.paver} items={pavers} cast={false} />
    </group>
  )
}

function Rail() {
  const { posts, rails } = useMemo(() => {
    const posts: InstItem[] = []
    const rails: InstItem[] = []
    const y0 = H + 0.9
    const y1 = H + 2.0
    for (let x = X0; x <= WING_X; x += 1.5) {
      posts.push({ p: [x, (y0 + y1) / 2, FRONT_Z - 0.35], s: [0.06, y1 - y0, 0.06] })
      posts.push({ p: [x, (y0 + y1) / 2, BACK_Z + 0.18], s: [0.06, y1 - y0, 0.06] })
    }
    for (let z = BACK_Z; z <= FRONT_Z - 0.7; z += 1.5) posts.push({ p: [WING_X - 0.18, (y0 + y1) / 2, z], s: [0.06, y1 - y0, 0.06] })
    const L = WING_X - X0
    ;[y1, (y0 + y1) / 2].forEach((y) => {
      rails.push({ p: [X0 + L / 2, y, FRONT_Z - 0.35], s: [L, 0.07, 0.07] })
      rails.push({ p: [X0 + L / 2, y, BACK_Z + 0.18], s: [L, 0.07, 0.07] })
      rails.push({ p: [WING_X - 0.18, y, (BACK_Z + FRONT_Z - 0.7) / 2], s: [0.07, 0.07, FRONT_Z - 0.7 - BACK_Z] })
    })
    return { posts, rails }
  }, [])
  return (
    <group>
      <Inst geometry={G.box} material={M.rail} items={posts} cast={false} />
      <Inst geometry={G.box} material={M.rail} items={rails} cast={false} />
    </group>
  )
}

export function RoofWing() {
  return (
    <group>
      <Deck />
      <Planting />
      <Canopy />
      <Rail />
    </group>
  )
}
