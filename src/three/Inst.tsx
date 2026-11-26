import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'

export interface InstItem {
  p: [number, number, number]
  s?: [number, number, number] | number
  r?: [number, number, number]
  c?: string
}

// An instanced mesh must not share a material with a plain one: three.js would swap
// shader programs back and forth on every draw. Each use gets its own copy.
const variants = new Map<THREE.Material, { plain?: THREE.Material; tinted?: THREE.Material }>()
export function instMaterial(m: THREE.Material, tinted: boolean) {
  let v = variants.get(m)
  if (!v) variants.set(m, (v = {}))
  const k = tinted ? 'tinted' : 'plain'
  return (v[k] ??= m.clone())
}
/** every copy of a material, so highlights reach all of them */
export function copiesOf(m: THREE.Material) {
  const v = variants.get(m)
  return v ? ([v.plain, v.tinted].filter(Boolean) as THREE.Material[]) : []
}

const dummy = new THREE.Object3D()
const col = new THREE.Color()

/** Instanced mesh from a plain list. One draw call per list. */
export function Inst({
  geometry,
  material,
  items,
  cast = true,
  receive = true,
  onClick,
  name,
}: {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  items: InstItem[]
  cast?: boolean
  receive?: boolean
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  name?: string
}) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const mat = instMaterial(material, items.some((i) => i.c))
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    items.forEach((it, i) => {
      dummy.position.set(...it.p)
      const s = it.s ?? 1
      if (typeof s === 'number') dummy.scale.setScalar(s)
      else dummy.scale.set(...s)
      dummy.rotation.set(...(it.r ?? [0, 0, 0]))
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      if (it.c) m.setColorAt(i, col.set(it.c))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.computeBoundingSphere()
  }, [items])
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, mat, items.length]}
      castShadow={cast}
      receiveShadow={receive}
      onClick={onClick}
      name={name}
    />
  )
}

/** Box defined by min/max corners, which is how most architecture is easiest to write. */
export function boxItem(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c?: string): InstItem {
  return { p: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], s: [Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)], c }
}
