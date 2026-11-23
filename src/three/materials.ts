import * as THREE from 'three'

// Shared, reused materials and procedural textures. Created once per page load.

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  draw(g)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(repeat[0], repeat[1])
  }
  return t
}

// One PV module: 6 x 10 cells with silver frame.
const pvTex = canvasTex(120, 200, (g) => {
  g.fillStyle = '#c9ced6'
  g.fillRect(0, 0, 120, 200)
  g.fillStyle = '#1b2c55'
  g.fillRect(4, 4, 112, 192)
  g.strokeStyle = 'rgba(160,180,220,0.35)'
  g.lineWidth = 1
  for (let i = 1; i < 6; i++) {
    g.beginPath(); g.moveTo(4 + (112 / 6) * i, 4); g.lineTo(4 + (112 / 6) * i, 196); g.stroke()
  }
  for (let j = 1; j < 10; j++) {
    g.beginPath(); g.moveTo(4, 4 + (192 / 10) * j); g.lineTo(116, 4 + (192 / 10) * j); g.stroke()
  }
})

const domeTex = canvasTex(256, 128, (g) => {
  g.fillStyle = '#dfe3e6'
  g.fillRect(0, 0, 256, 128)
  g.strokeStyle = 'rgba(120,130,140,0.45)'
  for (let i = 0; i <= 64; i++) {
    g.beginPath(); g.moveTo(i * 4, 0); g.lineTo(i * 4, 128); g.stroke()
  }
  for (let j = 0; j <= 32; j++) {
    g.beginPath(); g.moveTo(0, j * 4); g.lineTo(256, j * 4); g.stroke()
  }
}, [2, 1])

const drainTex = canvasTex(64, 64, (g) => {
  g.fillStyle = '#b9bdb7'
  g.fillRect(0, 0, 64, 64)
  g.fillStyle = '#8d928b'
  for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) {
    g.beginPath(); g.arc(8 + x * 16, 8 + y * 16, 4.5, 0, Math.PI * 2); g.fill()
  }
}, [40, 24])

const paverTex = canvasTex(64, 64, (g) => {
  g.fillStyle = '#d9d2c4'
  g.fillRect(0, 0, 64, 64)
  g.strokeStyle = '#c2b9a8'
  g.lineWidth = 2
  g.strokeRect(1, 1, 62, 30)
  g.strokeRect(1, 33, 62, 30)
}, [2, 20])

const woodTex = canvasTex(64, 32, (g) => {
  g.fillStyle = '#a77b4f'
  g.fillRect(0, 0, 64, 32)
  g.strokeStyle = '#8a6239'
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(0, i * 8 + 0.5); g.lineTo(64, i * 8 + 0.5); g.stroke() }
})

const lawnTex = canvasTex(128, 128, (g) => {
  g.fillStyle = '#8fae62'
  g.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 900; i++) {
    g.fillStyle = Math.random() > 0.5 ? 'rgba(70,110,45,0.18)' : 'rgba(190,210,140,0.18)'
    g.fillRect(Math.random() * 128, Math.random() * 128, 2, 2)
  }
}, [30, 30])

const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p)

export const M = {
  wall: std({ color: '#f4f1ea', roughness: 0.88 }),
  wallShade: std({ color: '#e6e1d6', roughness: 0.9 }),
  stone: std({ color: '#e9e2d3', roughness: 0.8 }),
  glass: std({ color: '#2a3446', roughness: 0.15, metalness: 0.55 }),
  glassLit: std({ color: '#5b6f86', roughness: 0.1, metalness: 0.6, transparent: true, opacity: 0.55 }),
  louvre: std({ color: '#3a414b', roughness: 0.6, metalness: 0.3 }),
  metal: std({ color: '#b8bec6', roughness: 0.35, metalness: 0.75 }),
  steel: std({ color: '#9aa3ad', roughness: 0.4, metalness: 0.7 }),
  dome: std({ map: domeTex, color: '#f2f4f6', roughness: 0.28, metalness: 0.75 }),
  plantRoom: std({ color: '#8c939b', roughness: 0.55, metalness: 0.35 }),
  pv: std({ map: pvTex, roughness: 0.25, metalness: 0.4, emissive: '#c79a17', emissiveIntensity: 0 }),
  pvFrame: std({ color: '#c2c8cf', roughness: 0.35, metalness: 0.75, emissive: '#c79a17', emissiveIntensity: 0 }),
  membrane: std({ color: '#40464d', roughness: 0.7 }),
  drain: std({ map: drainTex, roughness: 0.9, emissive: '#2c9ad1', emissiveIntensity: 0 }),
  soil: std({ color: '#6b5440', roughness: 1 }),
  paver: std({ map: paverTex, roughness: 0.95 }),
  deck: std({ color: '#cfc9bd', roughness: 0.95 }),
  wood: std({ map: woodTex, roughness: 0.85, emissive: '#5e8c4a', emissiveIntensity: 0 }),
  leaf: std({ color: '#ffffff', roughness: 0.85, flatShading: true }),
  leafShade: std({ color: '#ffffff', roughness: 0.9, flatShading: true, emissive: '#3f7a2e', emissiveIntensity: 0 }),
  leafBed: std({ color: '#ffffff', roughness: 0.85, flatShading: true, emissive: '#78b04a', emissiveIntensity: 0 }),
  trunk: std({ color: '#6e5a45', roughness: 1 }),
  lawn: std({ map: lawnTex, roughness: 1 }),
  ground: std({ color: '#d8d0bf', roughness: 1 }),
  path: std({ color: '#cbc3b3', roughness: 0.95 }),
  rail: std({ color: '#aeb4bb', roughness: 0.4, metalness: 0.7 }),
  water: std({ color: '#2c9ad1', roughness: 0.35, metalness: 0.1, emissive: '#2c9ad1', emissiveIntensity: 0 }),
  tank: std({ color: '#7fb3d8', roughness: 0.45, metalness: 0.1, emissive: '#2c9ad1', emissiveIntensity: 0 }),
  overflow: std({ color: '#5f7f86', roughness: 0.5, metalness: 0.3, emissive: '#5f7f86', emissiveIntensity: 0 }),
  gutter: std({ color: '#b5bcc4', roughness: 0.35, metalness: 0.7, emissive: '#2c9ad1', emissiveIntensity: 0 }),
  power: std({ color: '#d4a017', roughness: 0.4, metalness: 0.2, emissive: '#d4a017', emissiveIntensity: 0.15 }),
  board: std({ color: '#eceae4', roughness: 0.6, emissive: '#d4a017', emissiveIntensity: 0 }),
  meter: std({ color: '#f5f3ee', roughness: 0.5, emissive: '#018539', emissiveIntensity: 0 }),
  screen: std({ color: '#0e2a1a', emissive: '#3fd07a', emissiveIntensity: 0.6, roughness: 0.4 }),
  porcelain: std({ color: '#fbfbfa', roughness: 0.3 }),
  tile: std({ color: '#d9d6cf', roughness: 0.7 }),
  interior: std({ color: '#f1e7d2', roughness: 0.9, emissive: '#f5e6c4', emissiveIntensity: 0.25 }),
  cut: std({ color: '#14213d', roughness: 0.8 }),
  ceilingLight: std({ color: '#fff7e0', emissive: '#fff2cc', emissiveIntensity: 1.2 }),
  rock: std({ color: '#9b9790', roughness: 1, flatShading: true }),
  mulch: std({ color: '#5c4a38', roughness: 1 }),
  flagRed: std({ color: '#d9363e', roughness: 0.8, side: THREE.DoubleSide }),
  flagGreen: std({ color: '#0e8a43', roughness: 0.8, side: THREE.DoubleSide }),
  flagWhite: std({ color: '#f7f7f4', roughness: 0.8, side: THREE.DoubleSide }),
  context: std({ color: '#e5e0d6', roughness: 0.95 }),
  contextDark: std({ color: '#b9b4aa', roughness: 0.9 }),
}

export const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
  cyl6: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),
  blob: new THREE.IcosahedronGeometry(0.5, 0),
  blob1: new THREE.IcosahedronGeometry(0.5, 1),
  sphere: new THREE.SphereGeometry(0.5, 12, 8),
}

/** Arch opening: rectangle with a semicircular head. Origin at bottom-centre. */
export function archPath(path: THREE.Path, cx: number, y0: number, w: number, h: number) {
  const r = w / 2
  const spring = y0 + h - r
  path.moveTo(cx - r, y0)
  path.lineTo(cx + r, y0)
  path.lineTo(cx + r, spring)
  path.absarc(cx, spring, r, 0, Math.PI, false)
  path.lineTo(cx - r, y0)
  return path
}

/** Straight segments joined with small rounded corners, like a run of pipe. */
export function pipeCurve(points: [number, number, number][], radius = 0.45) {
  const path = new THREE.CurvePath<THREE.Vector3>()
  const P = points.map((p) => new THREE.Vector3(...p))
  let prev = P[0].clone()
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1]
    const b = P[i]
    if (i < P.length - 1) {
      const c = P[i + 1]
      const inDir = b.clone().sub(a).normalize()
      const outDir = c.clone().sub(b).normalize()
      const r = Math.min(radius, b.distanceTo(a) / 2, c.distanceTo(b) / 2)
      const p1 = b.clone().addScaledVector(inDir, -r)
      const p2 = b.clone().addScaledVector(outDir, r)
      if (prev.distanceTo(p1) > 1e-4) path.add(new THREE.LineCurve3(prev, p1))
      path.add(new THREE.QuadraticBezierCurve3(p1, b.clone(), p2))
      prev = p2
    } else {
      path.add(new THREE.LineCurve3(prev, b.clone()))
    }
  }
  return path
}

/** Deterministic pseudo-random so the model looks identical on every load. */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}
