import { useStore } from '../../state/store'
import { returnById, type ReturnId } from '../../data/returns'
import { scrollToId } from '../../motion/motion'
import { Arrow } from '../Icons'

/** Name, one line of fact, how to play with it. */
export function StageText({ id, hint, light }: { id: ReturnId; hint: string; light?: boolean }) {
  const setMode = useStore((s) => s.setMode)
  const r = returnById(id)
  return (
    <div className={`stage-text${light ? ' light' : ''}`}>
      <h2 id={`h-${id}`} className="sr-only">{r.name}</h2>
      <p className="st-out">{r.outcome}</p>
      <p className="st-hint">{hint}</p>
      <button
        type="button"
        className="st-3d"
        onClick={() => {
          setMode(id)
          scrollToId(document.getElementById(`ch-${id}`) ? `ch-${id}` : 'explorer')
        }}
      >
        See it in 3D <Arrow />
      </button>
    </div>
  )
}
