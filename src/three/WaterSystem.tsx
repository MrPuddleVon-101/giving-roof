import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { M, G, rng } from './materials'
import { Inst, boxItem, type InstItem } from './Inst'
import { H, CUT, TANK, GARDEN, DOWNPIPE, SWITCHBOARD, PV_METER, WATER_METER, TOILET_ZS, WING_X, FRONT_Z, BACK_Z } from './layout'
import { downpipe, supply, drops, overflow, cable, rainRoofRun } from './routes'
import { FlowDots } from './Flows'
import { useStore } from '../state/store'

const pick = (id: string) => (e: ThreeEvent<MouseEvent>) => {
  e.stopPropagation()
  useStore.getState().setHotspot(id)
}

function Pipe({ curve, r, mat, segs = 120 }: { curve: THREE.Curve<THREE.Vector3>; r: number; mat: THREE.Material; segs?: number }) {
  const geo = useMemo(() => new THREE.TubeGeometry(curve, segs, r, 10, false), [curve, r, segs])
  return <mesh geometry={geo} material={mat} castShadow />
}

/** Indicative service cutaway at the end of the wing: washroom below, plant room above. */
function Cutaway() {
  const { shell, partitions, lights, cut } = useMemo(() => {
    const shell: InstItem[] = [
      boxItem(CUT.x0, 0, CUT.z0, WING_X, CUT.y0, CUT.z1), // floor
      boxItem(CUT.x0, CUT.mid - 0.2, CUT.z0, WING_X, CUT.mid + 0.2, CUT.z1), // mid slab
    ]
    const partitions: InstItem[] = [
      boxItem(CUT.x0, CUT.y0, -0.1, CUT.x0 + 2.2, 2.6, 0.0),
      boxItem(CUT.x0, CUT.y0, 2.9, CUT.x0 + 2.2, 2.6, 3.0),
    ]
    const lights: InstItem[] = [
      boxItem(CUT.x0 + 0.8, CUT.mid - 0.24, CUT.z0 + 1, CUT.x0 + 3.2, CUT.mid - 0.2, CUT.z1 - 1),
      boxItem(CUT.x0 + 0.8, CUT.y1 - 0.06, CUT.z0 + 1, CUT.x0 + 3.2, CUT.y1 - 0.02, CUT.z1 - 1),
    ]
    // section-cut frame in ink so the opening reads as a cutaway, not a doorway
    const t = 0.12
    const cut: InstItem[] = [
      boxItem(WING_X - 0.02, CUT.y0, CUT.z0 - t, WING_X + 0.03, CUT.y1, CUT.z0),
      boxItem(WING_X - 0.02, CUT.y0, CUT.z1, WING_X + 0.03, CUT.y1, CUT.z1 + t),
      boxItem(WING_X - 0.02, CUT.y1, CUT.z0 - t, WING_X + 0.03, CUT.y1 + t, CUT.z1 + t),
      boxItem(WING_X - 0.02, CUT.mid - 0.2, CUT.z0, WING_X + 0.03, CUT.mid + 0.2, CUT.z1),
      boxItem(WING_X - 0.02, 0, CUT.z0 - t, WING_X + 0.03, CUT.y0, CUT.z1 + t),
    ]
    return { shell, partitions, lights, cut }
  }, [])
  return (
    <group>
      <Inst geometry={G.box} material={M.tile} items={shell} />
      <mesh position={[CUT.x0 + 0.03, (CUT.y0 + CUT.y1) / 2, (CUT.z0 + CUT.z1) / 2]} scale={[0.06, CUT.y1 - CUT.y0, CUT.z1 - CUT.z0]} geometry={G.box} material={M.interior} />
      <Inst geometry={G.box} material={M.interior} items={partitions} />
      <Inst geometry={G.box} material={M.ceilingLight} items={lights} cast={false} />
      <Inst geometry={G.box} material={M.cut} items={cut} cast={false} />
      {/* WCs with cisterns, facing out of the cut */}
      <group onClick={pick('flush')}>
        {TOILET_ZS.map((z) => (
          <group key={z} position={[0, 0, z]}>
            <mesh position={[CUT.x0 + 0.3, 1.8, 0]} scale={[0.4, 0.85, 0.85]} geometry={G.box} material={M.porcelain} castShadow />
            <mesh position={[CUT.x0 + 0.9, 0.7, 0]} scale={[1.1, 0.8, 0.62]} geometry={G.box} material={M.porcelain} castShadow />
            <mesh position={[CUT.x0 + 1.0, 1.14, 0]} scale={[1.2, 0.1, 0.7]} geometry={G.box} material={M.porcelain} />
          </group>
        ))}
      </group>
      {/* plant room: inverter, switchboard and PV meter */}
      <group onClick={pick('switch')}>
        <mesh position={[CUT.x0 + 0.2, 7.3, -1.2]} scale={[0.32, 0.9, 0.7]} geometry={G.box} material={M.board} castShadow />
        <mesh position={SWITCHBOARD} scale={[0.3, 1.5, 1.1]} geometry={G.box} material={M.board} castShadow />
        <mesh position={[SWITCHBOARD[0] + 0.16, SWITCHBOARD[1] + 0.3, SWITCHBOARD[2]]} scale={[0.02, 0.5, 0.8]} geometry={G.box} material={M.louvre} />
        <mesh position={PV_METER} scale={[0.24, 0.55, 0.45]} geometry={G.box} material={M.meter} castShadow />
        <mesh position={[PV_METER[0] + 0.13, PV_METER[1] + 0.1, PV_METER[2]]} scale={[0.02, 0.18, 0.32]} geometry={G.box} material={M.screen} />
      </group>
    </group>
  )
}

function Tank() {
  const body = useMemo(() => new THREE.CapsuleGeometry(TANK.r, TANK.len - TANK.r * 2, 8, 20), [])
  return (
    <group onClick={pick('tank')}>
      <mesh position={[TANK.x, 0.08, TANK.z]} scale={[3.4, 0.16, TANK.len + 1.6]} geometry={G.box} material={M.stone} receiveShadow />
      <mesh position={[TANK.x, TANK.y, TANK.z]} rotation={[Math.PI / 2, 0, 0]} geometry={body} material={M.tank} castShadow receiveShadow />
      {/* sealed hatch */}
      <mesh position={[TANK.x, TANK.y + TANK.r + 0.08, TANK.z - 0.4]} scale={[0.9, 0.16, 0.9]} geometry={G.cyl} material={M.louvre} castShadow />
      {/* saddles */}
      {[-1.4, 1.4].map((dz) => (
        <mesh key={dz} position={[TANK.x, 0.35, TANK.z + dz]} scale={[2.2, 0.4, 0.3]} geometry={G.box} material={M.steel} />
      ))}
      {/* louvred screen behind, as in the concept image */}
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={i} position={[TANK.x - 1.6 + i * 0.19, 1.5, TANK.z - TANK.len / 2 - 0.7]} scale={[0.06, 3, 0.2]} geometry={G.box} material={M.louvre} />
      ))}
      {/* pump */}
      <mesh position={[34.2, 0.55, TANK.z - 1.6]} scale={[0.8, 0.8, 0.8]} geometry={G.box} material={M.steel} castShadow />
    </group>
  )
}

function RainGarden() {
  const { rocks, plants, reeds } = useMemo(() => {
    const r = rng(3)
    const rocks: InstItem[] = []
    const plants: InstItem[] = []
    const reeds: InstItem[] = []
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2
      const rr = GARDEN.r * (0.9 + r() * 0.12)
      rocks.push({ p: [GARDEN.x + Math.cos(a) * rr, 0.15, GARDEN.z + Math.sin(a) * rr], s: [0.5 + r() * 0.5, 0.35 + r() * 0.3, 0.5 + r() * 0.5], r: [r(), r() * 6, r()] })
    }
    for (let i = 0; i < 12; i++) rocks.push({ p: [40.9 + r() * 1.6, 0.12, TANK.z + 2.6 + r() * 1.6], s: [0.3 + r() * 0.3, 0.2, 0.3 + r() * 0.3], r: [r(), r() * 6, 0] })
    for (let i = 0; i < 34; i++) {
      const a = r() * Math.PI * 2
      const d = Math.sqrt(r()) * (GARDEN.r - 0.8)
      const s = 0.7 + r() * 0.8
      plants.push({ p: [GARDEN.x + Math.cos(a) * d, s * 0.35, GARDEN.z + Math.sin(a) * d], s: [s, s * 0.8, s], r: [0, r() * 6, 0], c: ['#4f8a45', '#6aa05a', '#3d7240', '#8bb36a'][i % 4] })
    }
    for (let i = 0; i < 16; i++) {
      const a = r() * Math.PI * 2
      const d = Math.sqrt(r()) * (GARDEN.r - 1)
      reeds.push({ p: [GARDEN.x + Math.cos(a) * d, 0.9, GARDEN.z + Math.sin(a) * d], s: [0.06, 1.8, 0.06], r: [(r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3] })
    }
    return { rocks, plants, reeds }
  }, [])
  return (
    <group onClick={pick('overflow')}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GARDEN.x, 0.03, GARDEN.z]} material={M.mulch} receiveShadow>
        <circleGeometry args={[GARDEN.r, 32]} />
      </mesh>
      <Inst geometry={G.blob} material={M.rock} items={rocks} />
      <Inst geometry={G.blob1} material={M.leaf} items={plants} />
      <Inst geometry={G.cyl6} material={M.leafShade} items={reeds} cast={false} />
    </group>
  )
}

export function WaterSystem() {
  const route = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    const g = route.current
    if (!g) return
    const { explode, motionOff } = useStore.getState()
    const target = explode * 5
    g.position.x = motionOff ? target : THREE.MathUtils.damp(g.position.x, target, 6, dt)
  })
  return (
    <group>
      <Cutaway />
      {/* gutter with leaf screen along the end of the wing */}
      <group onClick={pick('gutter')}>
        <mesh position={[WING_X + 0.3, H + 0.62, (BACK_Z + FRONT_Z) / 2 - 0.2]} scale={[0.55, 0.38, FRONT_Z - BACK_Z - 0.8]} geometry={G.box} material={M.gutter} castShadow />
        <mesh position={[WING_X + 0.3, H + 0.83, (BACK_Z + FRONT_Z) / 2 - 0.2]} scale={[0.5, 0.03, FRONT_Z - BACK_Z - 0.8]} geometry={G.box} material={M.rail} />
      </group>
      <group ref={route}>
        <group onClick={pick('gutter')}>
          <Pipe curve={downpipe} r={0.2} mat={M.gutter} />
          {/* first-flush filter on the downpipe */}
          <mesh position={[DOWNPIPE.x, 5.2, DOWNPIPE.z]} scale={[0.7, 1.5, 0.7]} geometry={G.cyl} material={M.glassLit} />
          <mesh position={[DOWNPIPE.x, 4.9, DOWNPIPE.z]} scale={[0.5, 0.8, 0.5]} geometry={G.cyl} material={M.water} />
        </group>
        <Tank />
        <group onClick={pick('flush')}>
          <Pipe curve={supply} r={0.11} mat={M.water} />
          {drops.map((c, i) => (
            <Pipe key={i} curve={c} r={0.07} mat={M.water} segs={8} />
          ))}
          <mesh position={WATER_METER} scale={[0.36, 0.36, 0.36]} geometry={G.box} material={M.meter} />
        </group>
        <group onClick={pick('overflow')}>
          <Pipe curve={overflow} r={0.15} mat={M.overflow} />
        </group>
        <FlowDots curve={downpipe} kind="collect" count={16} size={0.3} />
        <FlowDots curve={supply} kind="supply" count={20} size={0.22} speed={0.09} />
        <FlowDots curve={overflow} kind="overflow" count={8} size={0.28} speed={0.07} />
      </group>
      <FlowDots curve={rainRoofRun} kind="collect" count={12} size={0.3} />
      <FlowDots curve={cable} kind="power" count={22} size={0.2} speed={0.1} />
      <RainGarden />
      <group onClick={pick('switch')}>
        <Pipe curve={cable} r={0.07} mat={M.power} />
      </group>
    </group>
  )
}
