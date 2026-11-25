import { useRef } from 'react'
import { UNKNOWNS } from '../data/research'
import { useStore } from '../state/store'
import { DotField } from './evidence/DotField'
import { RoofSizer } from './evidence/RoofSizer'
import { Doors } from './evidence/Doors'

/** Published evidence, then our assumptions, then what nobody knows yet. Kept visibly apart. */
export function Evidence() {
  const root = useRef<HTMLElement>(null)
  const setSourcesOpen = useStore((s) => s.setSourcesOpen)
  return (
    <section className="ev2" id="research" ref={root} aria-labelledby="research-title">
      <h2 id="research-title" className="sr-only">Evidence, assumptions and unknowns</h2>
      <DotField />
      <RoofSizer />
      <Doors items={UNKNOWNS} onSources={() => setSourcesOpen(true)} />
    </section>
  )
}
