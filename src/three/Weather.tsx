import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useStore } from '../state/store'
import { sim } from './sim'

export const SUN_DIR: [number, number, number] = [-0.5, 0.78, 0.38]

const DAY = { top: new THREE.Color('#a9c4dd'), horizon: new THREE.Color('#f3ede1'), sun: 2.7, hemi: 0.9 }
const RAIN = { top: new THREE.Color('#7f8b97'), horizon: new THREE.Color('#c9cdcf'), sun: 0.65, hemi: 0.75 }

const skyVert = `varying vec3 vP; void main(){ vP = (modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix*viewMatrix*vec4(vP,1.); }`
const skyFrag = `uniform vec3 top; uniform vec3 horizon; varying vec3 vP;
void main(){ float h = normalize(vP).y; float t = smoothstep(-0.02, 0.55, h); gl_FragColor = vec4(mix(horizon, top, t), 1.); }`

const SHOWER_SECONDS = 7

export function Weather() {
  const { scene } = useThree()
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const skyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { top: { value: DAY.top.clone() }, horizon: { value: DAY.horizon.clone() } },
        vertexShader: skyVert,
        fragmentShader: skyFrag,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  )
  const fog = useMemo(() => new THREE.Fog(DAY.horizon.clone(), 140, 380), [])
  useEffect(() => {
    const l = sun.current
    if (l) {
      l.target.position.set(10, 0, 0)
      l.target.updateMatrixWorld()
    }
  }, [])
  useEffect(() => {
    scene.fog = fog
    return () => {
      scene.fog = null
    }
  }, [scene, fog])

  // timed shower: starts on every showerKey bump, fades after a few seconds
  const showerUntil = useRef(0)
  const showerKey = useStore((s) => s.showerKey)
  useEffect(() => {
    if (showerKey > 0) showerUntil.current = performance.now() + SHOWER_SECONDS * 1000
  }, [showerKey])

  // rain streaks
  const COUNT = 800
  const rain = useMemo(() => {
    const pos = new Float32Array(COUNT * 6)
    const seed = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      seed[i * 3] = -14 + Math.random() * 74
      seed[i * 3 + 1] = Math.random() * 46
      seed[i * 3 + 2] = -22 + Math.random() * 56
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.LineBasicMaterial({ color: '#7f97b0', transparent: true, opacity: 0 })
    return { geo, mat, seed, pos }
  }, [])
  const lines = useRef<THREE.LineSegments>(null)

  useFrame((_, dt) => {
    const { weather, motionOff } = useStore.getState()
    const now = performance.now()
    const showerOn = now < showerUntil.current
    const want = showerOn ? 1 : 0
    sim.shower = motionOff ? want * 0.6 : THREE.MathUtils.damp(sim.shower, want, showerOn ? 3 : 1.2, dt)
    const overcastTarget = weather === 'rain' || showerOn ? 1 : 0
    sim.overcast = motionOff ? overcastTarget : THREE.MathUtils.damp(sim.overcast, overcastTarget, 2, dt)
    const k = sim.overcast
    skyMat.uniforms.top.value.copy(DAY.top).lerp(RAIN.top, k)
    skyMat.uniforms.horizon.value.copy(DAY.horizon).lerp(RAIN.horizon, k)
    fog.color.copy(skyMat.uniforms.horizon.value)
    fog.near = 140 - 70 * k
    if (sun.current) sun.current.intensity = THREE.MathUtils.lerp(DAY.sun, RAIN.sun, k)
    if (hemi.current) hemi.current.intensity = THREE.MathUtils.lerp(DAY.hemi, RAIN.hemi, k)

    // streaks
    const ls = lines.current
    if (!ls) return
    rain.mat.opacity = sim.shower * 0.75
    ls.visible = sim.shower > 0.02
    if (!ls.visible) return
    const fall = motionOff ? 0 : dt * 38
    const { seed, pos } = rain
    for (let i = 0; i < COUNT; i++) {
      let y = seed[i * 3 + 1] - fall
      if (y < 0) y += 46
      seed[i * 3 + 1] = y
      const x = seed[i * 3]
      const z = seed[i * 3 + 2]
      pos[i * 6] = x
      pos[i * 6 + 1] = y
      pos[i * 6 + 2] = z
      pos[i * 6 + 3] = x + 0.12
      pos[i * 6 + 4] = y + 1.1
      pos[i * 6 + 5] = z + 0.05
    }
    rain.geo.attributes.position.needsUpdate = true
  })

  const sunPos = useMemo(() => new THREE.Vector3(...SUN_DIR).normalize().multiplyScalar(110).add(new THREE.Vector3(10, 0, 0)), [])
  return (
    <>
      <mesh material={skyMat} scale={400}>
        <sphereGeometry args={[1, 32, 16]} />
      </mesh>
      <hemisphereLight ref={hemi} args={['#f4f1ea', '#8c8f7a', DAY.hemi]} />
      <directionalLight
        ref={sun}
        position={sunPos}
        intensity={DAY.sun}
        color="#fff3df"
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-left={-75}
        shadow-camera-right={75}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={10}
        shadow-camera-far={260}
        shadow-bias={-0.0004}
        shadow-normalBias={0.05}
      />
      <lineSegments ref={lines} geometry={rain.geo} material={rain.mat} frustumCulled={false} />
    </>
  )
}
