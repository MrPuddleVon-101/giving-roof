import { useEffect, type PointerEvent, type RefObject } from 'react'

/** Pointer position in the pixels of the render that fills `el` (a .cover). */
export function inRender(el: HTMLElement, e: { clientX: number; clientY: number }, iw: number, ih: number) {
  const r = el.getBoundingClientRect()
  return { x: ((e.clientX - r.left) / r.width) * iw, y: ((e.clientY - r.top) / r.height) * ih }
}

/** Size a canvas to the render it covers, capped so phones stay smooth. */
export function fitCanvas(cv: HTMLCanvasElement, iw: number, ih: number) {
  const r = cv.getBoundingClientRect()
  const k = Math.min(window.devicePixelRatio || 1, 1.25)
  const w = Math.min(window.innerWidth <= 900 ? 1000 : 1672, Math.round(r.width * k))
  const h = Math.round((w * ih) / iw)
  if (w > 0 && (cv.width !== w || cv.height !== h)) {
    cv.width = w
    cv.height = h
  }
  const g = cv.getContext('2d')!
  g.setTransform(cv.width / iw, 0, 0, cv.height / ih, 0, 0)
  return g
}

/** Give a canvas's memory back while its scene is not next to the one on screen. */
export function useRelease(cv: RefObject<HTMLCanvasElement | null>, near: boolean) {
  useEffect(() => {
    const c = cv.current
    if (!near && c) c.width = c.height = 1
  }, [cv, near])
}

export const isMouse = (e: PointerEvent) => e.pointerType === 'mouse'
export const ease = (t: number) => t * t * (3 - 2 * t)
export const smooth = (a: number, b: number, v: number) => ease(Math.min(1, Math.max(0, (v - a) / (b - a))))
