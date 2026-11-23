import { useLayoutEffect, useRef } from 'react'
import { useReveal } from '../motion/useReveal'
import { useStore } from '../state/store'
import { gsap, motionOn, scrollToId } from '../motion/motion'
import { Ext, Arrow } from './Icons'
import { ImageTrail } from './ImageTrail'

const LINE = 'The roof of a school can help shape what happens beneath it.'

export function Closing() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  useReveal(root)
  // words light up one by one as you scroll through the line
  useLayoutEffect(() => {
    const el = root.current!
    if (!motionOn()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.fill-w', { opacity: 0.12 }, { opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: '.closing-line', start: 'top 80%', end: 'bottom 40%', scrub: true } })
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <section className="closing" ref={root} aria-labelledby="closing-title">
      <div className="closing-stage" ref={stage} data-cursor="hover">
        <ImageTrail target={stage} />
        <h2 id="closing-title" className="display-1 closing-line" aria-label={LINE}>
          {LINE.split(' ').map((w, i) => (
            <span key={i} className="fill-w" aria-hidden="true">
              {w}{' '}
            </span>
          ))}
        </h2>
        <p className="closing-move" aria-hidden="true">Move your cursor here</p>
      </div>
      <p className="closing-sub" data-reveal="rise">
        <span>Imagine a campus that produces more than space: power, water, learning and opportunity.</span>
      </p>
      <div className="closing-cta" data-reveal="rise">
        <a className="btn btn-solid" href="#explorer" onClick={(e) => { e.preventDefault(); scrollToId('explorer') }}>
          Explore the roof again <Arrow />
        </a>
        <a className="btn btn-line magnetic" href="#posters" onClick={(e) => { e.preventDefault(); scrollToId('posters') }}>
          See the campaign
        </a>
      </div>
      <dl className="credits" data-reveal="rise">
        <div>
          <dt>Group 11A</dt>
          <dd>Joaquin, Lucy, Sander, Vedant</dd>
        </div>
        <div>
          <dt>Supervisor</dt>
          <dd>Mr Kenny Li</dd>
        </div>
        <div>
          <dt>Programme</dt>
          <dd>2026 IB Collaborative Science Project</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>Green School: Gardens and Outdoor Areas</dd>
        </div>
      </dl>
    </section>
  )
}

export function Footer() {
  const setSourcesOpen = useStore((s) => s.setSourcesOpen)
  return (
    <footer className="footer" id="disclaimer">
      <div className="foot-brand">
        <span className="brand-logo">
          <img src="img/sji-logo.png" alt="St. Joseph's Institution International crest and wordmark" width={738} height={237} loading="lazy" />
        </span>
        <p className="foot-line">Group 11A student concept for SJI International. Not an approved campus design.</p>
      </div>
      <div className="foot-cols">
        <div>
          <h3>This site</h3>
          <p>A student project. Not the official SJI International website.</p>
        </div>
        <nav aria-label="Footer">
          <h3>Links</h3>
          <ul>
            <li>
              <button type="button" className="btn-link" onClick={() => setSourcesOpen(true)}>
                Research and data sources
              </button>
            </li>
            <li>
              <a className="btn-link" href="https://www.sji-international.com.sg/giving/building-futures" target="_blank" rel="noopener noreferrer">
                School Building Futures page <Ext />
              </a>
            </li>
            <li>
              <a className="btn-link" href="#disclaimer">
                Disclaimer: the roof is a student concept
              </a>
            </li>
          </ul>
        </nav>
        <div>
          <h3>Images</h3>
          <p>Concept images and a simplified 3D model. Not to scale.</p>
        </div>
      </div>
      <p className="foot-small">© 2026 Group 11A. SJI International crest used for identification of a student project.</p>
    </footer>
  )
}
