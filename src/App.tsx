import { useEffect, useState } from 'react'
import { useStore } from './state/store'
import { prefersReducedMotion, watchFrames, finishAllReveals, ScrollTrigger } from './motion/motion'
import { Loader } from './components/Loader'
import { Cursor } from './components/Cursor'
import { Masthead } from './components/Masthead'
import { Day } from './components/day/Day'
import { useGlobalFx } from './motion/useGlobalFx'
import { useFar } from './motion/useFar'
import { Explorer } from './components/Explorer'
import { MaskReveal } from './components/MaskReveal'
import { PosterGallery } from './components/PosterGallery'
import { Evidence } from './components/Evidence'
import { Next } from './components/Next'
import { Goals } from './components/Goals'
import { Closing, Footer } from './components/Closing'
import { SourcesDrawer } from './components/SourcesDrawer'

function readMotionPref() {
  try {
    const v = localStorage.getItem('gr-motion')
    if (v === 'off') return true
    if (v === 'on') return false
  } catch {
    /* storage unavailable */
  }
  return prefersReducedMotion()
}

// initial preferences, set before first render so nothing animates that should not
const initialOff = readMotionPref()
const nav = navigator as Navigator & { deviceMemory?: number }
const weak = (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2
useStore.setState({ motionOff: initialOff, staticView: prefersReducedMotion() || weak })

export default function App() {
  const motionOff = useStore((s) => s.motionOff)
  const [ready, setReady] = useState(false)
  useGlobalFx()
  useFar()

  useEffect(() => {
    document.documentElement.dataset.motion = motionOff ? 'off' : 'on'
    try {
      localStorage.setItem('gr-motion', motionOff ? 'off' : 'on')
    } catch {
      /* storage unavailable */
    }
    if (motionOff) finishAllReveals()
    ScrollTrigger.refresh()
    return motionOff ? undefined : watchFrames()
  }, [motionOff])

  useEffect(() => {
    // refresh trigger positions once fonts and images settle
    const t = setTimeout(() => ScrollTrigger.refresh(), 1200)
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <a className="skip" href="#explorer">
        Skip to the 3D roof explorer
      </a>
      <Loader onDone={() => setReady(true)} />
      <Cursor />
      <div className="progress" aria-hidden="true">
        <i />
      </div>
      <Masthead />
      <main>
        <Day ready={ready} />
        <PosterGallery />
        <MaskReveal />
        <Explorer />
        <Goals />
        <Evidence />
        <Next />
        <Closing />
      </main>
      <Footer />
      <SourcesDrawer />
    </>
  )
}
