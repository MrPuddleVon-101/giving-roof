import { useEffect, useRef } from 'react'
import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useStore } from '../state/store'
import { CAMS, MODE_CAM, BOUNDS, scaled, type CamTarget } from './cameraTargets'
import { HOTSPOTS } from '../data/hotspots'
import { sim } from './sim'

const A = CameraControlsImpl.ACTION

export function CameraRig() {
  const ref = useRef<CameraControlsImpl | null>(null)
  const size = useThree((s) => s.size)
  const narrow = size.width < 760 || size.width / size.height < 0.9
  const camCmd = useStore((s) => s.camCmd)
  const zoomCmd = useStore((s) => s.zoomCmd)
  const reveal = useStore((s) => s.reveal)
  const chapter = useStore((s) => s.chapter)
  const motionOff = useStore((s) => s.motionOff)
  const drift = useRef({ dir: 1, base: 0, on: false })

  const go = (t: CamTarget, smooth = true) => {
    const c = ref.current
    if (!c) return
    const s = scaled(t, narrow)
    const sm = smooth && !useStore.getState().motionOff
    c.setLookAt(...s.pos, ...s.look, sm)
    frame(s, sm)
  }
  // on wide screens the chapter cards sit on the left, so frame the subject right of centre
  const frame = (s: CamTarget, sm: boolean) => {
    const c = ref.current
    if (!c) return
    const d = Math.hypot(s.pos[0] - s.look[0], s.pos[1] - s.look[1], s.pos[2] - s.look[2])
    c.setFocalOffset(narrow ? 0 : -d * 0.13, 0, 0, sm)
  }

  // controls config: no wheel/right-button capture so the page always scrolls normally
  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.mouseButtons.wheel = A.NONE
    c.mouseButtons.right = A.NONE
    c.mouseButtons.middle = A.NONE
    c.touches.one = A.TOUCH_ROTATE
    c.touches.two = A.TOUCH_DOLLY
    c.touches.three = A.NONE
    Object.assign(c, BOUNDS)
    c.smoothTime = 0.55
    if (import.meta.env.DEV) (window as unknown as { __cc: unknown }).__cc = c
    c.draggingSmoothTime = 0.12
    go(CAMS.overview, false)
    const start = () => {
      sim.interacting = true
      sim.lastInteract = performance.now()
      drift.current.on = false
    }
    const end = () => {
      sim.interacting = false
      sim.lastInteract = performance.now()
    }
    c.addEventListener('controlstart', start)
    c.addEventListener('controlend', end)
    return () => {
      c.removeEventListener('controlstart', start)
      c.removeEventListener('controlend', end)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // named targets from tabs, hotspots, reset and scroll chapters
  useEffect(() => {
    const { hotspot, mode } = useStore.getState()
    drift.current.on = false
    sim.lastInteract = performance.now()
    if (camCmd.name === 'hotspot') {
      const h = HOTSPOTS.find((x) => x.id === hotspot)
      if (h) go(h.cam)
      return
    }
    if (camCmd.name === 'reset') return go(CAMS[MODE_CAM[mode]])
    go(CAMS[camCmd.name])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camCmd.n, narrow])

  // scroll-linked façade-to-roof reveal; yields to the user while they drag
  useEffect(() => {
    const c = ref.current
    if (!c || chapter !== 'intro' || sim.interacting) return
    if (performance.now() - sim.lastInteract < 1500 && sim.lastInteract > 0 && reveal > 0.02) return
    const a = scaled(CAMS.facade, narrow)
    const b = scaled(CAMS.roofCorner, narrow)
    c.lerpLookAt(...a.pos, ...a.look, ...b.pos, ...b.look, reveal, !motionOff)
    frame(reveal < 0.5 ? a : b, !motionOff)
  }, [reveal, chapter, narrow, motionOff])

  useEffect(() => {
    const c = ref.current
    if (!c || zoomCmd.n === 0) return
    c.dolly(zoomCmd.dir * c.distance * 0.22, !useStore.getState().motionOff)
  }, [zoomCmd.n])

  // gentle idle drift in overview only; stops the moment anyone touches the model
  useFrame((_, dt) => {
    const c = ref.current
    if (!c) return
    const { mode, hotspot, motionOff: off, chapter: ch } = useStore.getState()
    const idle = performance.now() - sim.lastInteract > 5000
    const allowed = !off && !hotspot && mode === 'overview' && ch !== 'intro' && idle && !sim.interacting
    const d = drift.current
    if (!allowed) {
      d.on = false
      return
    }
    if (!d.on) {
      d.on = true
      d.base = c.azimuthAngle
    }
    if (c.azimuthAngle > d.base + 0.3) d.dir = -1
    if (c.azimuthAngle < d.base - 0.3) d.dir = 1
    c.rotate(d.dir * dt * 0.035, 0, false)
  })

  return <CameraControls ref={ref} makeDefault />
}
