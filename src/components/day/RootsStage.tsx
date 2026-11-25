import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useLoop } from '../scenes/util'
import { useStore } from '../../state/store'
import { StageText } from './StageText'
import { isMouse } from './util'

const IW = 1800
const IH = 1627
const MW = 360
const MH = Math.round((MW * IH) / IW)

const VS = 'attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}'
const FS = `precision highp float;varying vec2 v;uniform sampler2D a,b,m;uniform float t;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){return n(p)*.5+n(p*2.1+3.)*.28+n(p*4.3+9.)*.22;}
void main(){
  vec4 mk=texture2D(m,v);
  vec3 line=texture2D(a,v).rgb,photo=texture2D(b,v).rgb;
  // leafy, uneven growing edge
  float f=fb(v*vec2(34.,31.)+vec2(t*.05,0.));
  float k=mk.r+(f-.5)*.62*(1.-smoothstep(.8,1.,mk.r));
  float on=smoothstep(.47,.53,k);
  float rim=smoothstep(.33,.47,k)*(1.-smoothstep(.47,.62,k));
  float word=mk.g;
  float w=smoothstep(.45,.55,word);
  vec3 c=mix(line,photo,on);
  c=mix(c,vec3(.36,.66,.16),rim*.85*(1.-w));
  // the word: green ink on the drawing, paper white once the roof has grown through it
  vec3 ink=mix(vec3(.0,.36,.17),vec3(.0,.22,.1),smoothstep(.95,.5,line.r));
  c=mix(c,mix(ink,vec3(.992,.984,.95),on),w);
  gl_FragColor=vec4(c,1.);
}`

const TAGS = [
  { x: 0.8, y: 0.44, label: 'Leafy greens' },
  { x: 0.66, y: 0.76, label: 'Herbs' },
  { x: 0.3, y: 0.235, label: 'Shade planting' },
  { x: 0.27, y: 0.66, label: 'Canteen, if approved' },
]

/** A line drawing of the planted roof. Brush it and the real thing grows out of the paper. */
export function RootsStage({ active }: { active: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const gl = useRef<{ draw: (t: number) => void } | null>(null)
  const [fail, setFail] = useState(false)
  const [seen, setSeen] = useState<boolean[]>([false, false, false, false])
  const motionOff = useStore((s) => s.motionOff)
  const st = useRef({
    stamps: [] as { x: number; y: number; r: number; R: number }[],
    base: null as CanvasRenderingContext2D | null,
    mask: null as CanvasRenderingContext2D | null,
    last: { x: -1, y: -1 },
    idle: 99,
    auto: 0,
    tick: 0,
  })

  // stage setup: textures, shader, and the word drawn into the mask
  useEffect(() => {
    const c = cv.current
    if (motionOff || !c) return
    const ctx = c.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true })
    if (!ctx) return setFail(true)
    const g = ctx
    const sh = (type: number, src: string) => {
      const s = g.createShader(type)!
      g.shaderSource(s, src)
      g.compileShader(s)
      return s
    }
    const pr = g.createProgram()!
    g.attachShader(pr, sh(g.VERTEX_SHADER, VS))
    g.attachShader(pr, sh(g.FRAGMENT_SHADER, FS))
    g.linkProgram(pr)
    if (!g.getProgramParameter(pr, g.LINK_STATUS)) return setFail(true)
    g.useProgram(pr)
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer())
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW)
    const loc = g.getAttribLocation(pr, 'p')
    g.enableVertexAttribArray(loc)
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0)
    const tex = (unit: number, name: string) => {
      const t = g.createTexture()
      g.activeTexture(g.TEXTURE0 + unit)
      g.bindTexture(g.TEXTURE_2D, t)
      for (const [k, v] of [[g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE], [g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE], [g.TEXTURE_MIN_FILTER, g.LINEAR], [g.TEXTURE_MAG_FILTER, g.LINEAR]]) g.texParameteri(g.TEXTURE_2D, k, v)
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, 1, 1, 0, g.RGBA, g.UNSIGNED_BYTE, new Uint8Array([243, 238, 227, 255]))
      g.uniform1i(g.getUniformLocation(pr, name), unit)
    }
    tex(0, 'a')
    tex(1, 'b')
    tex(2, 'm')
    const ut = g.getUniformLocation(pr, 't')
    let dead = false
    const load = (unit: number, src: string) => {
      const im = new Image()
      im.onload = () => {
        if (dead) return
        g.activeTexture(g.TEXTURE0 + unit)
        g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, im)
        gl.current?.draw(0)
      }
      im.src = src
    }
    const mkc = () => {
      const k = document.createElement('canvas')
      k.width = MW * 2
      k.height = MH * 2
      return k.getContext('2d', { willReadFrequently: true })!
    }
    const s = st.current
    s.base = mkc()
    s.mask = mkc()
    const size = () => {
      const r = c.getBoundingClientRect()
      const k = Math.min(devicePixelRatio || 1, 1.5)
      c.width = Math.min(1800, Math.round(r.width * k))
      c.height = Math.round((c.width * IH) / IW)
      g.viewport(0, 0, c.width, c.height)
    }
    const word = () => {
      // the word is set in the visible part of the frame, whatever the crop
      const b = s.base!
      const host = c.closest('.dstage')!.getBoundingClientRect()
      const r = c.getBoundingClientRect()
      const kx = b.canvas.width / r.width
      const vw = host.width * kx
      const cx = (host.left - r.left) * kx + vw / 2
      const top = (host.top - r.top) * (b.canvas.height / r.height)
      const vh = host.height * (b.canvas.height / r.height)
      b.globalCompositeOperation = 'source-over'
      b.fillStyle = '#000'
      b.fillRect(0, 0, b.canvas.width, b.canvas.height)
      b.fillStyle = '#0f0'
      b.textAlign = 'center'
      b.textBaseline = 'middle'
      const fs = Math.min(vw * 0.34, vh * 0.56)
      b.font = `800 ${fs}px "Archivo Variable", Archivo, sans-serif`
      ;(b as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = 'extra-condensed'
      b.fillText('Roots', cx, top + vh * 0.36)
    }
    gl.current = {
      draw: (t) => {
        const m = s.mask!
        m.globalCompositeOperation = 'source-over'
        m.drawImage(s.base!.canvas, 0, 0)
        m.globalCompositeOperation = 'lighter'
        for (const p of s.stamps) stamp(m, p.x, p.y, p.r)
        g.activeTexture(g.TEXTURE2)
        g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, m.canvas)
        g.uniform1f(ut, t)
        g.drawArrays(g.TRIANGLES, 0, 3)
      },
    }
    size()
    load(0, 'img/day/beds-line.webp')
    load(1, 'img/day/beds.webp')
    document.fonts.load('800 100px "Archivo Variable"').finally(() => {
      if (dead) return
      word()
      gl.current?.draw(0)
    })
    let w = innerWidth
    const rs = () => {
      if (Math.abs(innerWidth - w) < 8) return
      w = innerWidth
      size()
      s.stamps = []
      word()
      gl.current?.draw(0)
    }
    window.addEventListener('resize', rs)
    return () => {
      dead = true
      window.removeEventListener('resize', rs)
      gl.current = null
    }
  }, [motionOff])

  const plant = (u: number, v: number, R: number) => {
    const s = st.current
    s.stamps.push({ x: u * MW * 2, y: v * MH * 2, r: 4, R: R * MW * 2 })
  }

  useLoop(active && !motionOff && !fail, (dt, t) => {
    const s = st.current
    if (!gl.current || !s.base) return
    s.idle += dt
    if (s.idle > 2.4) {
      // untouched: shoots appear on their own, following the planted beds
      s.auto += dt
      if (s.auto > 0.2 && s.tick < 46) {
        s.auto = 0
        s.tick++
        const k = s.tick / 46
        plant(0.97 - k * 0.62 + Math.sin(s.tick * 1.9) * 0.05, 0.42 + Math.sin(k * 5.2) * 0.2 + Math.cos(s.tick * 2.3) * 0.05, 0.05 + Math.random() * 0.035)
      }
    }
    for (const p of s.stamps) p.r += (p.R - p.r) * Math.min(1, dt * 2.6)
    // settle finished growth into the base layer
    const done = s.stamps.filter((p) => p.R - p.r < 1)
    if (done.length) {
      s.base.globalCompositeOperation = 'lighter'
      done.forEach((p) => stamp(s.base!, p.x, p.y, p.R))
      s.stamps = s.stamps.filter((p) => p.R - p.r >= 1)
    }
    gl.current.draw(t)
    const m = s.mask!
    if (Math.random() < 0.15)
      setSeen((old) => {
        const nw = TAGS.map((g, i) => old[i] || m.getImageData(Math.floor(g.x * MW * 2), Math.floor(g.y * MH * 2), 1, 1).data[0] > 130)
        return nw.some((x, i) => x !== old[i]) ? nw : old
      })
  })

  const brush = (e: PointerEvent) => {
    const s = st.current
    if (!isMouse(e) && e.buttons === 0) return
    const r = box.current!.getBoundingClientRect()
    const u = (e.clientX - r.left) / r.width
    const v = (e.clientY - r.top) / r.height
    s.idle = 0
    const d = Math.hypot(u - s.last.x, v - s.last.y)
    if (d < 0.016) return
    s.last = { x: u, y: v }
    plant(u, v, 0.055 + Math.min(0.03, d * 0.3))
  }

  return (
    <section className="dstage st-roots" id="rp-roots" aria-labelledby="h-roots" onPointerMove={brush} onPointerDown={brush}>
      <div className="stage-in">
        <div className="cover" ref={box} style={{ ['--ar' as string]: IW / IH, ['--fx' as string]: 0.7, ['--fy' as string]: 0.6 }}>
          <img src="img/day/beds.webp" alt="Concept image: raised beds of leafy greens and baskets of herbs along a rooftop walkway, with shade planting under a solar canopy and a canteen below." loading="lazy" draggable={false} />
          {!fail && !motionOff && <canvas ref={cv} aria-hidden="true" />}
          {TAGS.map((g, i) => (
            <span key={g.label} className="tag" data-show={seen[i] || motionOff} style={{ left: `${g.x * 100}%`, top: `${g.y * 100}%` }}>
              {g.label}
            </span>
          ))}
        </div>
        <StageText id="roots" hint="Brush over the drawing to grow it." />
      </div>
    </section>
  )
}

function stamp(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r)
  gr.addColorStop(0, 'rgba(255,0,0,.95)')
  gr.addColorStop(0.45, 'rgba(255,0,0,.6)')
  gr.addColorStop(1, 'rgba(255,0,0,0)')
  g.fillStyle = gr
  g.fillRect(x - r, y - r, r * 2, r * 2)
}
