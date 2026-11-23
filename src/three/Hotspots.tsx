import { Html } from '@react-three/drei'
import { HOTSPOTS } from '../data/hotspots'
import { useStore } from '../state/store'

// DOM markers anchored to real 3D positions (projected each frame by drei's Html).
export function Hotspots() {
  const mode = useStore((s) => s.mode)
  const active = useStore((s) => s.hotspot)
  const setHotspot = useStore((s) => s.setHotspot)
  const exploded = useStore((s) => s.exploded)
  return (
    <>
      {HOTSPOTS.map((h) => {
        const show = !exploded && (h.modes.includes(mode) || active === h.id)
        return (
          <Html key={h.id} position={h.at} center zIndexRange={[30, 10]} style={{ pointerEvents: show ? 'auto' : 'none' }}>
            <button
              type="button"
              className="hs"
              data-show={show}
              data-active={active === h.id}
              aria-pressed={active === h.id}
              tabIndex={show ? 0 : -1}
              aria-hidden={!show}
              onClick={() => setHotspot(active === h.id ? null : h.id)}
            >
              <span className="hs-dot" aria-hidden="true" />
              <span className="hs-label">{h.label}</span>
            </button>
          </Html>
        )
      })}
    </>
  )
}
