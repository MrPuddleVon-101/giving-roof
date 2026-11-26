import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { G } from './materials'
import { useStore } from '../state/store'
import type { Mode } from '../data/returns'
import { sim } from './sim'

export type FlowKind = 'power' | 'collect' | 'supply' | 'overflow' | 'sun'

const COLOURS: Record<FlowKind, string> = {
  power: '#f2bd1d',
  collect: '#3fb0e8',
  supply: '#2c9ad1',
  overflow: '#8fb1b8',
  sun: '#ffd45a',
}

/** Which flows are shown in which mode. Rain collection also runs whenever it is raining. */
export function flowVisible(kind: FlowKind, mode: Mode, raining: boolean) {
  switch (kind) {
    case 'power':
      return mode === 'overview' || mode === 'solar' || mode === 'reach'
    case 'sun':
      return mode === 'solar'
    case 'collect':
      return mode === 'rain' || raining
    case 'supply':
      return mode === 'overview' || mode === 'rain' || mode === 'reach'
    case 'overflow':
      return mode === 'rain' || (mode === 'overview' && raining)
  }
}

const dummy = new THREE.Object3D()

export function FlowDots({
  curve,
  kind,
  count = 18,
  speed = 0.12,
  size = 0.26,
}: {
  curve: THREE.Curve<THREE.Vector3>
  kind: FlowKind
  count?: number
  speed?: number
  size?: number
}) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: COLOURS[kind], transparent: true, opacity: 0, depthWrite: false, toneMapped: false }),
    [kind],
  )
  const state = useRef({ t: 0, vis: 0 })
  const len = useMemo(() => curve.getLength(), [curve])
  const table = useMemo(() => curve.getSpacedPoints(160), [curve])
  useFrame((_, dt) => {
    const m = ref.current
    if (!m) return
    const { mode, weather, motionOff } = useStore.getState()
    const raining = weather === 'rain' || sim.shower > 0.05
    const target = flowVisible(kind, mode, raining) ? 1 : 0
    const s = state.current
    s.vis = motionOff ? target : THREE.MathUtils.damp(s.vis, target, 5, dt)
    mat.opacity = s.vis * 0.95
    m.visible = s.vis > 0.01
    if (!m.visible) return
    if (!motionOff) s.t += (dt * speed * 30) / len
    for (let i = 0; i < count; i++) {
      const u = (s.t + i / count) % 1
      const q = u * 160
      const k = Math.floor(q)
      dummy.position.lerpVectors(table[k], table[Math.min(160, k + 1)], q - k)
      dummy.scale.setScalar(size * (0.6 + 0.4 * s.vis))
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[G.sphere, mat, count]} frustumCulled={false} renderOrder={5} />
}

/** Gold dashes travelling from the sun's direction onto the panels. */
export function SunRays({ targets, dir }: { targets: [number, number, number][]; dir: [number, number, number] }) {
  const curves = useMemo(() => {
    const d = new THREE.Vector3(...dir).normalize()
    return targets.map((t) => {
      const end = new THREE.Vector3(...t)
      return new THREE.LineCurve3(end.clone().addScaledVector(d, 34), end)
    })
  }, [targets, dir])
  const beamMat = useMemo(() => new THREE.MeshBasicMaterial({ color: COLOURS.sun, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }), [])
  const beams = useMemo(() => curves.map((c) => new THREE.TubeGeometry(c, 1, 0.05, 6, false)), [curves])
  const vis = useRef(0)
  const grp = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    const { mode, motionOff } = useStore.getState()
    const t = mode === 'solar' ? 1 : 0
    vis.current = motionOff ? t : THREE.MathUtils.damp(vis.current, t, 5, dt)
    beamMat.opacity = vis.current * 0.45
    if (grp.current) grp.current.visible = vis.current > 0.01
  })
  return (
    <group>
      <group ref={grp}>
        {beams.map((g, i) => (
          <mesh key={i} geometry={g} material={beamMat} renderOrder={4} />
        ))}
      </group>
      {curves.map((c, i) => (
        <FlowDots key={i} curve={c} kind="sun" count={6} speed={0.5} size={0.34} />
      ))}
    </group>
  )
}
