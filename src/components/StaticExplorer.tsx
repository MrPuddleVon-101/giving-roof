import { RETURNS, OVERVIEW_PANEL } from '../data/returns'
import { HOTSPOTS } from '../data/hotspots'
import { useStore } from '../state/store'

/** Full text-and-image fallback: used when WebGL is missing, on weak devices, or by choice. */
export function StaticExplorer({ webgl }: { webgl: boolean }) {
  const setStaticView = useStore((s) => s.setStaticView)
  return (
    <div className="static">
      <figure className="static-fig">
        <img
          src="img/axo-1536.webp"
          srcSet="img/axo-960.webp 960w, img/axo-1536.webp 1536w"
          sizes="(max-width: 900px) 100vw, 60vw"
          alt="Cutaway concept illustration: the arched façade and dome, with a PV canopy over roof planting and raised beds on the side wing, a downpipe to a sealed ground tank, a separate blue pipe to toilets and an overflow to a rain garden."
          loading="lazy"
        />
        <figcaption>Concept cutaway generated for Group 11A. Not an engineering drawing.</figcaption>
      </figure>
      <div className="static-text">
        <h4>{OVERVIEW_PANEL.title}</h4>
        <ul>
          {OVERVIEW_PANEL.points.slice(0, 2).map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        {RETURNS.map((r) => (
          <div key={r.id} className="static-block" style={{ ['--c' as string]: r.colour }}>
            <h4>{r.panel.title}</h4>
            <ul>
              {r.panel.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {r.panel.warning && <p className="warn">{r.panel.warning}</p>}
          </div>
        ))}
        <details className="static-parts">
          <summary>All model parts explained</summary>
          <dl>
            {HOTSPOTS.map((h) => (
              <div key={h.id}>
                <dt>{h.title}</dt>
                <dd>{h.body}</dd>
              </div>
            ))}
          </dl>
        </details>
        {webgl ? (
          <button type="button" className="btn btn-solid" onClick={() => setStaticView(false)}>
            Open the 3D model
          </button>
        ) : (
          <p className="fine">3D is not available in this browser, so the static version is shown.</p>
        )}
      </div>
    </div>
  )
}
