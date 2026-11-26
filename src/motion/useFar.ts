import { useEffect } from 'react'

const SECTIONS = ['.day', '.walk', '.mask', '.goals2', '.dots', '.sizer', '.doors', '.year', '.closing']

/**
 * Marks sections that are well off screen, so their pictures and canvases give
 * their graphics memory back. Links and buttons stay reachable by keyboard.
 */
export function useFar() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => ((e.target as HTMLElement).dataset.far = String(!e.isIntersecting))),
      { rootMargin: '70% 0px' },
    )
    SECTIONS.forEach((s) => {
      const el = document.querySelector(s)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])
}
