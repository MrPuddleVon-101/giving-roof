import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useLoop } from '../scenes/util'
import { useStore } from '../../state/store'
import { SHARE, WINDOWS } from './data'
import { useRelease, fitCanvas, inRender } from './util'
import { StageText } from './StageText'

const W = 1672
const H = 941
const NICHE: [number, number] = [782, 545]
const PAD = 60

interface Spark { i: number; t: number; v: number; o: number }

/** Twenty arches stand for one verified net saving. Light them, then see where four would go. */
export function ReachStage({ active, near }: { active: boolean; near: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const on = useRef<boolean[]>(WINDOWS.map(() => false))
  const val = useRef<number[]>(WINDOWS.map(() => 0))
  const [count, setCount] = useState(0)
  const [ok, setOk] = useState(false)
  const gold = useRef(0)
  const niche = useRef(0)
  const sparks = useRef<Spark[]>([])
  const sprites = useRef<{ pale: HTMLCanvasElement[]; gold: HTMLCanvasElement[]; niche: HTMLCanvasElement } | null>(null)
  const idle = useRef(99)
  const motionOff = useStore((s) => s.motionOff)
  useRelease(cv, near || motionOff)
  const full = count === WINDOWS.length

  // cut each lit arch (with its spill of light) out of the evening grade
  useEffect(() => {
    let dead = false
    const get = (src: string) =>
      new Promise<HTMLImageElement>((res, rej) => {
        const im = new Image()
        im.onload = () => res(im)
        im.onerror = rej
        im.src = src
      })
    Promise.all([get('img/day/hero-pale.webp'), get('img/day/hero-lit.webp')])
      .then(([p, l]) => {
        if (dead) return
        const cut = (im: HTMLImageElement, x0: number, x1: number, y0: number, y1: number, pad: number) => {
          const c = document.createElement('canvas')
          c.width = x1 - x0 + pad * 2
          c.height = y1 - y0 + pad * 2
          const g = c.getContext('2d')!
          // soft-edged arch (shadow instead of filter, for Safari)
          g.shadowColor = '#fff'
          g.shadowBlur = 28
          g.shadowOffsetX = 3000
          g.beginPath()
          g.roundRect(pad - 14 - 3000, pad - 14, x1 - x0 + 28, y1 - y0 + 28, [(x1 - x0) / 2 + 14, (x1 - x0) / 2 + 14, 8, 8])
          g.fill()
          g.shadowColor = 'transparent'
          g.globalCompositeOperation = 'source-in'
          g.drawImage(im, x0 - pad, y0 - pad, c.width, c.height, 0, 0, c.width, c.height)
          return c
        }
        sprites.current = {
          pale: WINDOWS.map((w) => cut(p, w[0], w[1], w[2], w[3], PAD)),
          gold: WINDOWS.map((w) => cut(l, w[0], w[1], w[2], w[3], PAD)),
          niche: cut(l, 735, 828, 455, 612, 30),
        }
      })
      .catch(() => {})
    return () => {
      dead = true
    }
  }, [])

  const sync = () => setCount(on.current.filter(Boolean).length)
  const draw = (dt: number, t: number) => {
    const s = sprites.current
    if (!cv.current || !s) return
    const g = fitCanvas(cv.current, W, H)
    g.clearRect(0, 0, W, H)
    gold.current += ((ok ? 1 : 0) - gold.current) * Math.min(1, dt * 2.4)
    WINDOWS.forEach((w, i) => {
      const go = on.current[i] ? 1 : 0
      val.current[i] += (go - val.current[i]) * Math.min(1, dt * (go ? 9 : 4))
      const v = val.current[i]
      if (v < 0.01) return
      const flick = v < 0.92 && go ? 0.7 + Math.random() * 0.3 : 1
      const share = SHARE.has(i) ? gold.current : 0
      g.globalAlpha = v * flick * (ok && !SHARE.has(i) ? 1 - gold.current * 0.35 : 1)
      g.drawImage(s.pale[i], w[0] - PAD, w[2] - PAD)
      if (share > 0.01) {
        g.globalAlpha = v * share
        g.drawImage(s.gold[i], w[0] - PAD, w[2] - PAD)
        g.globalCompositeOperation = 'lighter'
        g.globalAlpha = share * (0.25 + 0.12 * Math.sin(t * 3 + i))
        g.drawImage(s.gold[i], w[0] - PAD, w[2] - PAD)
        g.globalCompositeOperation = 'source-over'
      }
    })
    g.globalAlpha = 1
    // light from the four arches gathers in the entrance niche
    if (ok && Math.random() < dt * 34) {
      const ids = [...SHARE]
      sparks.current.push({ i: ids[Math.floor(Math.random() * ids.length)], t: 0, v: 0.45 + Math.random() * 0.4, o: Math.random() * 2 - 1 })
    }
    g.globalCompositeOperation = 'lighter'
    sparks.current = sparks.current.filter((k) => k.t < 1)
    for (const k of sparks.current) {
      k.t += dt * k.v
      const w = WINDOWS[k.i]
      const x0 = (w[0] + w[1]) / 2 + k.o * 14
      const y0 = (w[2] + w[3]) / 2
      const e = k.t * k.t * (3 - 2 * k.t)
      const x = x0 + (NICHE[0] + k.o * 12 - x0) * e
      const y = y0 + (NICHE[1] - y0) * e - Math.sin(Math.PI * k.t) * (60 + k.o * 26)
      const r = 9
      const gr = g.createRadialGradient(x, y, 0, x, y, r)
      gr.addColorStop(0, 'rgba(255,240,190,.95)')
      gr.addColorStop(0.35, 'rgba(255,190,60,.55)')
      gr.addColorStop(1, 'rgba(255,170,20,0)')
      g.fillStyle = gr
      g.fillRect(x - r, y - r, r * 2, r * 2)
    }
    niche.current += ((ok ? 1 : 0) - niche.current) * Math.min(1, dt * 0.9)
    if (niche.current > 0.01) {
      const gr = g.createRadialGradient(782, 548, 4, 782, 548, 118)
      gr.addColorStop(0, `rgba(255,196,80,${0.62 * niche.current})`)
      gr.addColorStop(0.5, `rgba(255,170,50,${0.28 * niche.current})`)
      gr.addColorStop(1, 'rgba(255,160,30,0)')
      g.save()
      g.beginPath()
      g.roundRect(738, 455, 88, 160, [44, 44, 0, 0])
      g.clip()
      g.fillStyle = gr
      g.fillRect(640, 400, 290, 290)
      g.restore()
    }
    g.globalCompositeOperation = 'source-over'
  }

  useLoop(active && !motionOff, (dt, t) => {
    idle.current += dt
    // untouched: rooms come on by themselves
    if (idle.current > 2.2 && count < WINDOWS.length && Math.random() < dt * 4.2) {
      const off = on.current.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0)
      on.current[off[Math.floor(Math.random() * off.length)]] = true
      sync()
    }
    draw(dt, t)
  })
  useEffect(() => {
    if (!motionOff) return
    on.current = WINDOWS.map(() => true)
    sync()
    const id = window.setTimeout(() => {
      val.current = WINDOWS.map(() => 1)
      gold.current = ok ? 1 : 0
      niche.current = ok ? 1 : 0
      draw(0, 0)
    }, 600)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionOff, ok])

  const sweep = (e: PointerEvent) => {
    if (motionOff || (e.pointerType !== 'mouse' && e.buttons === 0)) return
    const q = inRender(box.current!, e, W, H)
    let hit = false
    WINDOWS.forEach((w, i) => {
      if (!on.current[i] && q.x > w[0] - 22 && q.x < w[1] + 22 && q.y > w[2] - 26 && q.y < w[3] + 26) {
        on.current[i] = true
        hit = true
      }
    })
    if (hit) {
      idle.current = 0
      sync()
    }
  }
  const reset = () => {
    on.current = WINDOWS.map(() => false)
    setOk(false)
    idle.current = 0
    sync()
  }

  return (
    <section className="dstage st-reach" id="rp-reach" aria-labelledby="h-reach" onPointerMove={sweep} onPointerDown={sweep}>
      <div className="stage-in">
        <div className="hs-stars on" aria-hidden="true" />
        <p className="stage-word sw-reach" aria-hidden="true">Reach</p>
        <div className="cover" ref={box} style={{ ['--fx' as string]: 0.52, ['--fy' as string]: 0.6 }}>
          <img src="img/day/hero-night.webp" alt="The same campus render graded to evening, with its arched windows dark until lit." decoding="async" draggable={false} />
          <canvas ref={cv} aria-hidden="true" />
        </div>
        <StageText id="reach" light hint="Sweep the façade. 20 windows stand for one verified net saving." />
        <div className="approve">
          <p aria-live="polite">
            <b>{ok ? '4 of 20' : `${count} of 20`}</b>
            <span>{ok ? 'would go to the Scholarships and Bursaries Fund' : full ? 'verified. Nothing moves without approval.' : 'windows verified'}</span>
          </p>
          <div>
            <button type="button" className="approve-btn" role="switch" aria-checked={ok} disabled={!full} onClick={() => setOk(!ok)}>
              {ok ? 'Undo approval' : 'School approves'}
            </button>
            {full && !motionOff && (
              <button type="button" className="approve-re" onClick={reset}>
                Lights off
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
