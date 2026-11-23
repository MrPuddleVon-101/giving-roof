import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { Campus } from './Campus'
import { RoofWing, pvYAt } from './RoofWing'
import { WaterSystem } from './WaterSystem'
import { Weather, SUN_DIR } from './Weather'
import { SunRays } from './Flows'
import { Hotspots } from './Hotspots'
import { CameraRig } from './CameraRig'
import { Highlighter } from './Highlighter'
import { CAMS } from './cameraTargets'
import { PV } from './layout'

const RAY_TARGETS: [number, number, number][] = [
  [13, pvYAt(-6) + 0.1, -6],
  [17, pvYAt(-2) + 0.1, -2],
  [21, pvYAt(-5) + 0.1, -5],
  [15, pvYAt(3) + 0.1, 3],
  [PV.x1 - 1.5, pvYAt(1) + 0.1, 1],
]

export default function Scene({ active, onReady }: { active: boolean; onReady: () => void }) {
  const narrow = typeof window !== 'undefined' && window.innerWidth < 760
  const [dpr, setDpr] = useState<number>(Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 1.75))
  return (
    <Canvas
      shadows
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 34, near: 0.5, far: 900, position: CAMS.overview.pos }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={() => requestAnimationFrame(() => onReady())}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <Weather />
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={1.6} position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[40, 40, 1]} color="#fffaf0" />
        <Lightformer intensity={0.8} position={[-20, 4, 10]} rotation-y={Math.PI / 2} scale={[30, 10, 1]} color="#dfe9f2" />
        <Lightformer intensity={0.5} position={[20, 2, -10]} rotation-y={-Math.PI / 2} scale={[30, 8, 1]} color="#f3e6cc" />
      </Environment>
      <Campus />
      <RoofWing />
      <WaterSystem />
      <SunRays targets={RAY_TARGETS} dir={SUN_DIR} />
      <Highlighter />
      <Hotspots />
      <CameraRig />
    </Canvas>
  )
}
