import { create } from 'zustand'
import type { Mode } from '../data/returns'
import type { CamName } from '../three/cameraTargets'

export type Weather = 'day' | 'rain'

interface State {
  mode: Mode
  hotspot: string | null
  weather: Weather
  showerKey: number // bump to replay a timed shower
  exploded: boolean
  explode: number // 0..1
  motionOff: boolean // user pause or prefers-reduced-motion
  staticView: boolean
  chapter: string | null // scroll chapter driving the camera
  reveal: number // 0..1 façade-to-roof progress
  camCmd: { name: CamName | 'hotspot' | 'reset'; n: number }
  zoomCmd: { dir: 1 | -1; n: number }
  sourcesOpen: boolean
  setMode: (m: Mode, cam?: CamName | null) => void
  setHotspot: (id: string | null) => void
  setWeather: (w: Weather) => void
  setExploded: (b: boolean) => void
  setExplode: (v: number) => void
  setMotionOff: (b: boolean) => void
  setStaticView: (b: boolean) => void
  setChapter: (c: string | null) => void
  setReveal: (v: number) => void
  resetCamera: () => void
  zoom: (dir: 1 | -1) => void
  setSourcesOpen: (b: boolean) => void
}

export const useStore = create<State>((set, get) => ({
  mode: 'overview',
  hotspot: null,
  weather: 'day',
  showerKey: 0,
  exploded: false,
  explode: 0,
  motionOff: false,
  staticView: false,
  chapter: null,
  reveal: 0,
  camCmd: { name: 'overview', n: 0 },
  zoomCmd: { dir: 1, n: 0 },
  sourcesOpen: false,
  setMode: (m, cam) => {
    const s = get()
    const extra: Partial<State> = {}
    // Rain mode always plays a brief shower so the water route reads.
    if (m === 'rain' && s.mode !== 'rain') extra.showerKey = s.showerKey + 1
    if (cam !== null) extra.camCmd = { name: cam ?? m, n: s.camCmd.n + 1 }
    set({ mode: m, hotspot: null, ...extra })
  },
  setHotspot: (id) => {
    const s = get()
    set({ hotspot: id, camCmd: { name: id ? 'hotspot' : s.mode, n: s.camCmd.n + 1 } })
  },
  setWeather: (w) => set((s) => ({ weather: w, showerKey: w === 'rain' ? s.showerKey + 1 : s.showerKey })),
  setExploded: (b) =>
    set((s) => ({ exploded: b, explode: b ? 0.7 : 0, hotspot: null, camCmd: { name: b ? 'exploded' : s.mode, n: s.camCmd.n + 1 } })),
  setExplode: (v) => set({ explode: v }),
  setMotionOff: (b) => set({ motionOff: b }),
  setStaticView: (b) => set({ staticView: b }),
  setChapter: (c) => set({ chapter: c }),
  setReveal: (v) => set({ reveal: v }),
  resetCamera: () => set((s) => ({ hotspot: null, camCmd: { name: 'reset', n: s.camCmd.n + 1 } })),
  zoom: (dir) => set((s) => ({ zoomCmd: { dir, n: s.zoomCmd.n + 1 } })),
  setSourcesOpen: (b) => set({ sourcesOpen: b }),
}))
