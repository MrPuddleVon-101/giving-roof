import { useMemo } from 'react'
import * as THREE from 'three'
import { M, G, archPath, rng } from './materials'
import { Inst, boxItem, type InstItem } from './Inst'
import { H, FRONT_Z, BACK_Z, WING_X, BAY, LEFT, RIGHT, TIERS, DOME, CUT } from './layout'

// Simplified campus context built from the front-façade reference:
// long white frontage, two tiers of round arches with dark louvres,
// a projecting central arched bay, and a silver chapel dome with a cross.

const FACADE_D = 0.7
const BODY_FRONT = FRONT_Z - 1.25

function archCentres(x0: number, x1: number, n: number) {
  const step = (x1 - x0) / n
  return Array.from({ length: n }, (_, i) => x0 + step * (i + 0.5))
}

function WingFacade({ x0, x1, n, louvreBoth }: { x0: number; x1: number; n: number; louvreBoth: boolean }) {
  const { geo, glass, louvres, awnings } = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(x0, 0)
    shape.lineTo(x1, 0)
    shape.lineTo(x1, H + 0.9)
    shape.lineTo(x0, H + 0.9)
    shape.lineTo(x0, 0)
    const cs = archCentres(x0, x1, n)
    const glass: InstItem[] = []
    const louvres: InstItem[] = []
    const awnings: InstItem[] = []
    TIERS.forEach((t, ti) => {
      cs.forEach((cx) => {
        shape.holes.push(archPath(new THREE.Path(), cx, t.y0, t.w, t.h))
        // dark glazing set back in the recess
        glass.push({ p: [cx, t.y0 + t.h / 2, BODY_FRONT + 0.02], s: [t.w, t.h, 0.04] })
        const louvred = ti === 1 || louvreBoth
        if (louvred) {
          const r = t.w / 2
          const spring = t.h - r
          for (let k = -4; k <= 4; k++) {
            const dx = (k / 4.6) * r
            const hh = spring + Math.sqrt(Math.max(r * r - dx * dx, 0)) - 0.12
            louvres.push({ p: [cx + dx, t.y0 + hh / 2, FRONT_Z - FACADE_D - 0.18], s: [0.07, hh, 0.22] })
          }
        }
        if (ti === 0) awnings.push({ p: [cx, t.y0 + 2.35, FRONT_Z - FACADE_D + 0.05], s: [t.w + 0.1, 0.12, 0.7] })
      })
    })
    const geo = new THREE.ExtrudeGeometry(shape, { depth: FACADE_D, bevelEnabled: false, curveSegments: 18 })
    geo.translate(0, 0, FRONT_Z - FACADE_D)
    return { geo, glass, louvres, awnings }
  }, [x0, x1, n, louvreBoth])

  return (
    <group>
      <mesh geometry={geo} material={M.wall} castShadow receiveShadow />
      <Inst geometry={G.box} material={M.glass} items={glass} cast={false} />
      <Inst geometry={G.box} material={M.louvre} items={louvres} />
      <Inst geometry={G.box} material={M.wall} items={awnings} />
    </group>
  )
}

function CentralBay() {
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(BAY.x0, 0)
    s.lineTo(BAY.x1, 0)
    s.lineTo(BAY.x1, BAY.h - 1.6)
    s.absarc(0, BAY.h - 1.6 - 0.001, BAY.x1, 0, Math.PI, false)
    s.lineTo(BAY.x0, 0)
    s.holes.push(archPath(new THREE.Path(), 0, 0.9, 5.4, 10.6))
    const g = new THREE.ExtrudeGeometry(s, { depth: BAY.depth, bevelEnabled: false, curveSegments: 28 })
    g.translate(0, 0, FRONT_Z - FACADE_D)
    return g
  }, [])
  const z = FRONT_Z - FACADE_D + 0.1
  return (
    <group>
      <mesh geometry={geo} material={M.wall} castShadow receiveShadow />
      {/* recessed back panel */}
      <mesh position={[0, 6, z - 0.05]} scale={[5.6, 11, 0.1]} geometry={G.box} material={M.stone} receiveShadow />
      {/* entrance glazing */}
      <mesh position={[0, 2.85, z + 0.02]} scale={[3.4, 3.9, 0.06]} geometry={G.box} material={M.glass} />
      <mesh position={[0, 4.95, z + 0.12]} scale={[3.8, 0.25, 0.4]} geometry={G.box} material={M.wall} />
      {/* sculptural group, abstracted */}
      {[-0.65, 0, 0.65].map((x, i) => (
        <group key={i} position={[x, 5.15, z + 0.35]}>
          <mesh position={[0, 1.05, 0]} scale={[0.5, 2.1 - Math.abs(x) * 0.5, 0.42]} geometry={G.cyl} material={M.stone} castShadow />
          <mesh position={[0, 2.35 - Math.abs(x) * 0.5, 0]} scale={0.42} geometry={G.sphere} material={M.stone} castShadow />
        </group>
      ))}
      <mesh position={[0, 5.15, z + 0.3]} scale={[2.3, 0.2, 0.7]} geometry={G.box} material={M.stone} />
      {/* upper glazing */}
      <mesh position={[0, 9.6, z + 0.02]} scale={[3.2, 2.2, 0.06]} geometry={G.box} material={M.glass} />
    </group>
  )
}

function Body() {
  const items = useMemo(() => {
    const it: InstItem[] = []
    // main volume, stopping where the service cutaway begins
    it.push(boxItem(-WING_X, 0, BACK_Z, CUT.x0, H, BODY_FRONT))
    // service end block around the cutaway (+x end)
    it.push(boxItem(CUT.x0, 0, BACK_Z, WING_X, H, CUT.z0))
    it.push(boxItem(CUT.x0, 0, CUT.z1, WING_X, H, BODY_FRONT))
    it.push(boxItem(CUT.x0, CUT.y1, CUT.z0, WING_X, H, CUT.z1))
    // close the arcade recess at both ends and over the top
    it.push(boxItem(-WING_X, 0, BODY_FRONT, -WING_X + 0.4, H, FRONT_Z - FACADE_D))
    it.push(boxItem(WING_X - 0.4, 0, BODY_FRONT, WING_X, H, FRONT_Z - FACADE_D))
    it.push(boxItem(-WING_X, H - 0.4, BODY_FRONT, WING_X, H, FRONT_Z - FACADE_D))
    it.push(boxItem(-WING_X, 5.35, BODY_FRONT, WING_X, 5.75, FRONT_Z - FACADE_D))
    // parapets (side and back)
    it.push(boxItem(-WING_X, H, BACK_Z, WING_X, H + 0.9, BACK_Z + 0.35))
    it.push(boxItem(-WING_X, H, BACK_Z, -WING_X + 0.35, H + 0.9, FRONT_Z - FACADE_D))
    it.push(boxItem(WING_X - 0.35, H, BACK_Z, WING_X, H + 0.9, FRONT_Z - FACADE_D))
    return it
  }, [])
  const end = useMemo(() => {
    // arched windows on the left end elevation (guessed, kept plain)
    const it: InstItem[] = []
    ;[-6, 0, 6].forEach((z) => TIERS.forEach((t) => it.push({ p: [-WING_X - 0.02, t.y0 + t.h / 2 - 0.3, z], s: [0.06, t.h - 0.6, 2.4] })))
    return it
  }, [])
  return (
    <group>
      <Inst geometry={G.box} material={M.wall} items={items} />
      <Inst geometry={G.box} material={M.glass} items={end} cast={false} />
      {/* roof deck finish */}
      <mesh position={[-WING_X / 2 - 2, H + 0.02, 0]} scale={[WING_X - 4, 0.04, 19]} geometry={G.box} material={M.deck} receiveShadow />
    </group>
  )
}

function Dome() {
  const fins = useMemo(() => {
    const it: InstItem[] = []
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2
      it.push({ p: [DOME.x + Math.cos(a) * DOME.drumR, H + 1.2 + DOME.drumH / 2, DOME.z + Math.sin(a) * DOME.drumR], s: [0.12, DOME.drumH, 0.12] })
    }
    return it
  }, [])
  const domeGeo = useMemo(() => new THREE.SphereGeometry(DOME.r, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), [])
  const top = H + 1.2 + DOME.drumH + 0.25
  return (
    <group>
      {/* podium with planting */}
      <mesh position={[DOME.x, H + 0.6, DOME.z]} scale={[DOME.r * 2.6, 1.2, DOME.r * 2.6]} geometry={G.cyl} material={M.wall} castShadow receiveShadow />
      <mesh position={[DOME.x, H + 1.2 + DOME.drumH / 2, DOME.z]} scale={[DOME.drumR * 2, DOME.drumH, DOME.drumR * 2]} geometry={G.cyl} material={M.glassLit} />
      <Inst geometry={G.box} material={M.metal} items={fins} />
      <mesh position={[DOME.x, H + 1.2 + DOME.drumH + 0.12, DOME.z]} scale={[DOME.r * 2.1, 0.25, DOME.r * 2.1]} geometry={G.cyl} material={M.wall} castShadow />
      <mesh position={[DOME.x, top, DOME.z]} geometry={domeGeo} material={M.dome} castShadow />
      {/* cross */}
      <mesh position={[DOME.x, top + DOME.r + 1.3, DOME.z]} scale={[0.22, 2.6, 0.22]} geometry={G.box} material={M.metal} castShadow />
      <mesh position={[DOME.x, top + DOME.r + 1.85, DOME.z]} scale={[1.3, 0.22, 0.22]} geometry={G.box} material={M.metal} castShadow />
    </group>
  )
}

function PlantRooms() {
  const { rooms, fins } = useMemo(() => {
    const rooms: InstItem[] = [
      boxItem(-12.5, H, -6.5, -5.6, H + 3.0, 3.2),
      boxItem(5.6, H, -6.5, 10.0, H + 3.0, 3.2),
      boxItem(-28, H, -7, -20, H + 2.0, -1),
    ]
    const fins: InstItem[] = []
    const addFins = (x0: number, x1: number, z: number, h: number) => {
      for (let x = x0 + 0.2; x < x1; x += 0.36) fins.push({ p: [x, H + h / 2, z], s: [0.08, h, 0.2] })
    }
    addFins(-12.5, -5.6, 3.3, 3.0)
    addFins(5.6, 10.0, 3.3, 3.0)
    return { rooms, fins }
  }, [])
  return (
    <group>
      <Inst geometry={G.box} material={M.plantRoom} items={rooms} />
      <Inst geometry={G.box} material={M.louvre} items={fins} />
    </group>
  )
}

function Grounds() {
  const r = useMemo(() => rng(7), [])
  const trees = useMemo(() => {
    const spots: [number, number][] = []
    const add = (x: number, z: number) => spots.push([x, z])
    for (let i = 0; i < 9; i++) add(-44 - r() * 26, -28 + i * 8 + r() * 4)
    for (let i = 0; i < 7; i++) add(-36 - r() * 20, 30 + r() * 26)
    for (let i = 0; i < 6; i++) add(56 + r() * 18, -30 + i * 6 + r() * 4)
    for (let i = 0; i < 4; i++) add(74 + r() * 14, 34 + r() * 20)
    for (let i = 0; i < 10; i++) add(-30 + i * 7 + r() * 3, -20 - r() * 10)
    const trunks: InstItem[] = []
    const crowns: InstItem[] = []
    const greens = ['#5f8a45', '#6f9a4e', '#557d3c', '#7ea457', '#4f7a3d']
    spots.forEach(([x, z]) => {
      const h = 3 + r() * 3
      const s = 4 + r() * 3.5
      trunks.push({ p: [x, h / 2, z], s: [0.5, h, 0.5] })
      crowns.push({ p: [x, h + s * 0.35, z], s: [s, s * 0.8, s], r: [0, r() * 3, 0], c: greens[Math.floor(r() * greens.length)] })
      crowns.push({ p: [x + (r() - 0.5) * 2.4, h + s * 0.7, z + (r() - 0.5) * 2.4], s: s * 0.7, r: [r(), r() * 3, 0], c: greens[Math.floor(r() * greens.length)] })
    })
    return { trunks, crowns }
  }, [r])
  const shrubs = useMemo(() => {
    const it: InstItem[] = []
    for (let x = -31; x <= 31; x += 1.6) {
      if (Math.abs(x) < 5.4) continue
      it.push({ p: [x, 1.15, 12.9], s: [1.5, 0.9, 1.1], r: [0, x, 0], c: x % 3.2 === 0 ? '#5d8c43' : '#6c9a4c' })
    }
    return it
  }, [])
  const steps: InstItem[] = useMemo(
    () => [
      boxItem(-WING_X - 2, 0, FRONT_Z, WING_X, 0.9, 13.6),
      boxItem(-WING_X - 2, 0, 13.6, WING_X, 0.6, 14.4),
      boxItem(-WING_X - 2, 0, 14.4, WING_X, 0.3, 15.2),
    ],
    [],
  )
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, -0.02, 0]} receiveShadow material={M.ground}>
        <circleGeometry args={[220, 48]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6, 0.0, 40]} receiveShadow material={M.lawn}>
        <planeGeometry args={[88, 46]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0.01, 17.4]} receiveShadow material={M.path}>
        <planeGeometry args={[100, 4.2]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[38, 0.01, 30]} receiveShadow material={M.path}>
        <planeGeometry args={[4, 30]} />
      </mesh>
      <Inst geometry={G.box} material={M.stone} items={steps} />
      <Inst geometry={G.blob1} material={M.leaf} items={shrubs} />
      <Inst geometry={G.cyl6} material={M.trunk} items={trees.trunks} />
      <Inst geometry={G.blob} material={M.leaf} items={trees.crowns} />
      {/* flagpoles, as on the front lawn */}
      {[
        [-24, 24, M.flagWhite],
        [-19.5, 25.5, M.flagGreen],
      ].map(([x, z, mat], i) => (
        <group key={i} position={[x as number, 0, z as number]}>
          <mesh position={[0, 6.5, 0]} scale={[0.14, 13, 0.14]} geometry={G.cyl} material={M.metal} castShadow />
          <mesh position={[1.2, 11.9, 0]} scale={[2.3, 1.4, 0.04]} geometry={G.box} material={mat as THREE.Material} castShadow />
        </group>
      ))}
      {/* low neighbouring blocks, background context only */}
      <Inst
        geometry={G.box}
        material={M.context}
        items={[boxItem(-76, 0, -38, -40, 9, -14), boxItem(-30, 0, -44, 6, 7, -30), boxItem(14, 0, -48, 44, 8, -32)]}
      />
    </group>
  )
}

export function Campus() {
  return (
    <group>
      <Body />
      <WingFacade x0={LEFT.x0} x1={LEFT.x1} n={LEFT.arches} louvreBoth={false} />
      <WingFacade x0={RIGHT.x0} x1={RIGHT.x1} n={RIGHT.arches} louvreBoth />
      <CentralBay />
      <Dome />
      <PlantRooms />
      <Grounds />
    </group>
  )
}
