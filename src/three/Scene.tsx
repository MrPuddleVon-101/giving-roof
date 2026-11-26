import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useStore } from '../state/store'
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

/** Shadows are redrawn only while something that casts one is moving. */
function ShadowSaver() {
  const gl = useThree((s) => s.gl)
  const left = useRef(6)
  useEffect(() => {
    gl.shadowMap.autoUpdate = false
    return useStore.subscribe((a, b) => {
      if (a.explode !== b.explode || a.exploded !== b.exploded) left.current = 120
    })
  }, [gl])
  useFrame(() => {
    if (left.current > 0) {
      left.current--
      gl.shadowMap.needsUpdate = true
    }
  })
  return null
}

/** Parts are picked by click only, so the model is never hit-tested while the pointer merely moves over it. */
function ClickOnly() {
  const gl = useThree((s) => s.gl)
  const setEvents = useThree((s) => s.setEvents)
  useEffect(() => {
    const el = gl.domElement.parentElement ?? gl.domElement
    const on = () => setEvents({ enabled: true })
    let t = 0
    const off = () => {
      clearTimeout(t)
      t = window.setTimeout(() => setEvents({ enabled: false }), 400)
    }
    setEvents({ enabled: false })
    el.addEventListener('pointerdown', on, true)
    window.addEventListener('pointerup', off)
    return () => {
      clearTimeout(t)
      el.removeEventListener('pointerdown', on, true)
      window.removeEventListener('pointerup', off)
    }
  }, [gl, setEvents])
  return null
}

export default function Scene({ active, near, onReady }: { active: boolean; near: boolean; onReady: () => void }) {
  const lite = useStore((s) => s.lite)
  const [dpr, setDpr] = useState<number>(Math.min(window.devicePixelRatio || 1, 1.25))
  return (
    <Canvas
      shadows
      // far from the screen the model keeps its compiled shaders but almost no pixels
      dpr={near ? (lite ? Math.min(dpr, 0.8) : dpr) : 0.08}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 34, near: 0.5, far: 900, position: CAMS.overview.pos }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={() => requestAnimationFrame(() => requestAnimationFrame(onReady))}
      aria-hidden="true"
    >
      {near && <PerformanceMonitor onDecline={() => setDpr(1)} />}
      <ShadowSaver />
      <ClickOnly />
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
