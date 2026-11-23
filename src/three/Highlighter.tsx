import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { M } from './materials'
import { useStore } from '../state/store'
import type { Mode } from '../data/returns'

// Visibly highlights the physical parts that belong to the active return.
type Key = keyof typeof M
const LEVELS: Partial<Record<Key, Partial<Record<Mode, number>> & { base?: number; hotspot?: Record<string, number> }>> = {
  pv: { solar: 0.22, hotspot: { pv: 0.3 } },
  pvFrame: { solar: 0.35, hotspot: { pv: 0.4 } },
  power: { base: 0.15, overview: 0.35, solar: 1.1, reach: 0.6, hotspot: { switch: 1.1 } },
  board: { solar: 0.45, reach: 0.5, hotspot: { switch: 0.6 } },
  meter: { reach: 1.0, hotspot: { switch: 0.6 } },
  gutter: { rain: 0.35, hotspot: { gutter: 0.55 } },
  water: { overview: 0.15, rain: 0.6, reach: 0.4, hotspot: { flush: 0.8, tank: 0.4 } },
  tank: { rain: 0.35, reach: 0.25, hotspot: { tank: 0.55 } },
  overflow: { rain: 0.5, hotspot: { overflow: 0.8 } },
  leafShade: { roots: 0.32, solar: 0.12, hotspot: { shade: 0.4 } },
  leafBed: { roots: 0.5, hotspot: { beds: 0.6 } },
  wood: { roots: 0.3, hotspot: { beds: 0.4 } },
  drain: { roots: 0.0, hotspot: { drain: 0.5 } },
}

export function Highlighter() {
  useFrame((state, dt) => {
    const { mode, hotspot, motionOff } = useStore.getState()
    const pulse = motionOff ? 1 : 0.82 + 0.18 * Math.sin(state.clock.elapsedTime * 2.4)
    for (const key of Object.keys(LEVELS) as Key[]) {
      const cfg = LEVELS[key]!
      const mat = M[key] as THREE.MeshStandardMaterial
      let target = cfg[mode] ?? cfg.base ?? 0
      if (hotspot && cfg.hotspot?.[hotspot] != null) target = Math.max(target, cfg.hotspot[hotspot])
      const goal = target * (target > (cfg.base ?? 0) ? pulse : 1)
      mat.emissiveIntensity = motionOff ? goal : THREE.MathUtils.damp(mat.emissiveIntensity, goal, 6, dt)
    }
  })
  return null
}
