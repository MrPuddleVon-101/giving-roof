import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useStore } from '../state/store'
import { RETURNS, OVERVIEW_PANEL, MODE_LABEL, type Mode, returnById } from '../data/returns'
import { HOTSPOTS } from '../data/hotspots'
import { ScrollTrigger } from '../motion/motion'
import { useReveal } from '../motion/useReveal'
import type { CamName } from '../three/cameraTargets'
import { ReturnGlyph } from './Icons'
import { Split } from './Split'
import { DragHint } from './DragHint'
import { StaticExplorer } from './StaticExplorer'
import { ReachFlow } from './ReachFlow'

const Scene = lazy(() => import('../three/Scene'))

const MODES: Mode[] = ['overview', 'solar', 'rain', 'roots', 'reach']

interface Chapter {
  id: string
  mode: Mode
  cam: CamName | null
  kicker: string
  title: string
  body: string[]
}

const SHORT: Record<string, string> = {
  solar: 'Panels make electricity up top. Shade plants grow underneath.',
  rain: 'Gutter, sealed tank, flushing only. Surplus goes to a rain garden.',
  roots: 'A few sunny beds for a canteen trial, if approved. Not a farm.',
  reach: '20% of verified net savings to bursaries, only if the school approves.',
}

const CHAPTERS: Chapter[] = [
  {
    id: 'intro',
    mode: 'overview',
    cam: null,
    kicker: 'The roof in 3D',
    title: 'Start at the arches you know.',
    body: ['Keep scrolling. The camera rises to the one wing we would change.'],
  },
  ...RETURNS.filter((r) => r.id === 'solar' || r.id === 'rain').map((r) => ({ id: r.id, mode: r.id, cam: r.id as CamName, kicker: r.name, title: r.headline, body: [SHORT[r.id]] })),
  {
    id: 'whole',
    mode: 'overview',
    cam: 'top',
    kicker: 'All four, together',
    title: 'Now it is yours.',
    body: ['Drag to orbit. Tap a marker. Make it rain. Pull the layers apart.'],
  },
]

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function Explorer() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [webgl] = useState(hasWebGL)
  const [ready, setReady] = useState(false)
  const [inView, setInView] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [panelOpen, setPanelOpen] = useState(() => window.innerWidth > 900)
  const s = useStore()
  useReveal(root)

  const useStatic = !webgl || s.staticView

  // mount the canvas shortly before it is needed, render only while visible
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting)
        if (e.isIntersecting) setMounted(true)
      },
      { rootMargin: '600px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // scroll chapters drive the model; manual input still works between them
  useLayoutEffect(() => {
    const triggers: ScrollTrigger[] = []
    CHAPTERS.forEach((ch) => {
      const el = document.getElementById(`ch-${ch.id}`)
      if (!el) return
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 62%',
          end: 'bottom 62%',
          onToggle: (self) => {
            if (!self.isActive) return
            const st = useStore.getState()
            // layout refreshes can re-fire a trigger; never override the user inside the same chapter
            if (st.chapter === ch.id) return
            st.setChapter(ch.id)
            if (ch.id === 'intro') st.setMode('overview', null)
            else st.setMode(ch.mode, ch.cam)
          },
        }),
      )
    })
    const intro = document.getElementById('ch-intro')
    if (intro)
      triggers.push(
        ScrollTrigger.create({
          trigger: intro,
          start: 'top 95%',
          end: 'bottom 50%',
          onUpdate: (self) => useStore.getState().setReveal(self.progress),
        }),
      )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = MODES[(i + (e.key === 'ArrowRight' ? 1 : MODES.length - 1)) % MODES.length]
    s.setMode(next)
    document.getElementById(`tab-${next}`)?.focus()
  }

  const hs = HOTSPOTS.find((h) => h.id === s.hotspot)
  const panel = s.mode === 'overview' ? OVERVIEW_PANEL : returnById(s.mode).panel
  const warning = s.mode !== 'overview' ? returnById(s.mode).panel.warning : undefined

  return (
    <section className="explorer" id="explorer" ref={root} aria-label="3D roof explorer">
      <div className="explorer-grid">
        <div className="stage" ref={stage} data-mode={s.mode} data-static={useStatic}>
          <div className="stage-inner" data-cursor={useStatic ? undefined : 'drag'}>
            {useStatic ? (
              <StaticExplorer webgl={webgl} />
            ) : (
              <>
                <div className={`stage-poster${ready ? ' hide' : ''}`} aria-hidden={ready}>
                  <img src="img/axo-960.webp" alt="" />
                  <span>Loading the 3D concept model</span>
                </div>
                <div className="canvas-wrap" role="img" aria-label={`Interactive 3D concept model of the campus and proposed roof wing, showing ${MODE_LABEL[s.mode]}. The same information is in the panel and chapters as text.`}>
                  {mounted && (
                    <Suspense fallback={null}>
                      <Scene active={inView} onReady={() => setReady(true)} />
                    </Suspense>
                  )}
                </div>

                <DragHint active={ready && inView} />
                <div className="tabs" role="tablist" aria-label="Choose a return to inspect">
                  {MODES.map((m, i) => (
                    <button
                      key={m}
                      id={`tab-${m}`}
                      role="tab"
                      type="button"
                      aria-selected={s.mode === m}
                      aria-controls="stage-panel"
                      tabIndex={s.mode === m ? 0 : -1}
                      className="tab"
                      data-m={m}
                      onClick={() => s.setMode(m)}
                      onKeyDown={(e) => onTabKey(e, i)}
                    >
                      {MODE_LABEL[m]}
                    </button>
                  ))}
                </div>

                <aside id="stage-panel" role="tabpanel" aria-labelledby={`tab-${s.mode}`} className={`panel${panelOpen ? '' : ' closed'}`} aria-live="polite">
                  <button type="button" className="panel-toggle" aria-expanded={panelOpen} onClick={() => setPanelOpen(!panelOpen)}>
                    {panelOpen ? 'Hide details' : 'Show details'}
                  </button>
                  <div className="panel-body">
                    {hs ? (
                      <>
                        <p className="panel-kicker">{MODE_LABEL[s.mode]} · selected part</p>
                        <h4>{hs.title}</h4>
                        <p>{hs.body}</p>
                        {hs.tag && <p className="warn">{hs.tag}</p>}
                        <button type="button" className="btn-link small" onClick={() => s.setHotspot(null)}>
                          Back to {MODE_LABEL[s.mode]}
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="panel-kicker">Showing</p>
                        <h4>{panel.title}</h4>
                        {s.mode === 'reach' ? (
                          <ReachFlow />
                        ) : (
                          <ul>
                            {panel.points.map((p) => (
                              <li key={p}>{p}</li>
                            ))}
                          </ul>
                        )}
                        {warning && <p className="warn">{warning}</p>}
                      </>
                    )}
                  </div>
                </aside>

                <div className="controls" role="group" aria-label="Model controls">
                  <div className="seg" role="group" aria-label="Weather">
                    <button type="button" aria-pressed={s.weather === 'day'} onClick={() => s.setWeather('day')}>
                      Day
                    </button>
                    <button type="button" aria-pressed={s.weather === 'rain'} onClick={() => s.setWeather('rain')}>
                      Rain
                    </button>
                  </div>
                  <div className="explode">
                    <button type="button" className="ctl" aria-pressed={s.exploded} onClick={() => s.setExploded(!s.exploded)}>
                      Exploded view
                    </button>
                    {s.exploded && (
                      <label className="explode-range">
                        <span className="sr-only">Layer separation</span>
                        <input type="range" min={0} max={1} step={0.01} value={s.explode} onChange={(e) => s.setExplode(Number(e.target.value))} />
                      </label>
                    )}
                  </div>
                  <div className="seg" role="group" aria-label="Zoom">
                    <button type="button" onClick={() => s.zoom(1)} aria-label="Zoom in">
                      +
                    </button>
                    <button type="button" onClick={() => s.zoom(-1)} aria-label="Zoom out">
                      −
                    </button>
                  </div>
                  <button type="button" className="ctl" onClick={s.resetCamera}>
                    Reset view
                  </button>
                  <button type="button" className="ctl quiet" onClick={() => s.setStaticView(true)}>
                    Static view
                  </button>
                </div>
                {s.exploded && (
                  <ol className="explode-key" aria-label="Exploded layers, top to bottom">
                    <li>PV canopy</li>
                    <li>Planting, soil and drainage</li>
                    <li>Waterproof roof and paths</li>
                    <li>Water route (moved sideways)</li>
                  </ol>
                )}
              </>
            )}
          </div>
          <p className="stage-note">Concept model. Not to scale. The washroom and plant-room cutaway is an indicative location only.</p>
        </div>
        <div className="chapters">
          {CHAPTERS.map((ch) => (
            <article key={ch.id} id={`ch-${ch.id}`} className="chapter" data-active={s.chapter === ch.id} style={{ ['--c' as string]: ch.mode === 'overview' ? 'var(--ink)' : returnById(ch.mode as Exclude<Mode, 'overview'>).colour }}>
              <div className="ch-card">
              <p className="chapter-kicker">
                {ch.mode !== 'overview' && <ReturnGlyph id={ch.mode} size={28} />}
                {ch.kicker}
              </p>
              <Split as="h3" className="chapter-title" text={ch.title} />
              {ch.body.map((b, i) => (
                <p key={i}>{b}</p>
              ))}
              {ch.id === 'rain' && <p className="warn">Not for drinking or handwashing.</p>}
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}
