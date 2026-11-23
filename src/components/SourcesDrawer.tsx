import { useEffect, useRef } from 'react'
import { SOURCES } from '../data/sources'
import { useStore } from '../state/store'
import { Ext } from './Icons'

export function SourcesDrawer() {
  const open = useStore((s) => s.sourcesOpen)
  const setOpen = useStore((s) => s.setSourcesOpen)
  const panel = useRef<HTMLDivElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement
      setTimeout(() => panel.current?.querySelector<HTMLElement>('button')?.focus(), 30)
    } else lastFocus.current?.focus?.()
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [open, setOpen])
  return (
    <div className={`drawer${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="drawer-scrim" onClick={() => setOpen(false)} />
      <div className="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" ref={panel} data-lenis-prevent>
        <div className="drawer-top">
          <h2 id="drawer-title">Sources</h2>
          <button type="button" className="ctl" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            Close
          </button>
        </div>
        <p className="fine">Facts on this page were checked against these sources. Poster references without a public link are listed by title.</p>
        <ol className="src-list">
          {SOURCES.map((s) => (
            <li key={s.id}>
              <span className="src-n">[{s.n}]</span>
              <div>
                <strong>{s.title}</strong>
                <span className="src-pub">{s.publisher}</span>
                <span className="src-note">{s.note}</span>
                {s.url && (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
                    {s.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} <Ext />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
