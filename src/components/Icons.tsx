// Small line glyphs. Each one depicts the physical thing it labels.
import type { ReturnId } from '../data/returns'

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export function ReturnGlyph({ id, size = 44 }: { id: ReturnId; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className={`glyph glyph-${id}`}>
      {id === 'solar' && (
        <g {...base}>
          <circle className="g-sun" cx="16" cy="14" r="5" />
          <g className="g-rays">
            <path d="M16 4v2.5M16 21.5V24M6 14h2.5M23.5 14H26M9 7l1.8 1.8M21.2 19.2 23 21M9 21l1.8-1.8M21.2 8.8 23 7" />
          </g>
          <path d="M14 40l6-14h22l-6 14z" />
          <path d="M17 33h22M27.5 26l-4.5 14M34.5 26 30 40" />
        </g>
      )}
      {id === 'rain' && (
        <g {...base}>
          <path className="g-drop" d="M24 6c5 7 9 12 9 17a9 9 0 0 1-18 0c0-5 4-10 9-17z" />
          <path d="M8 36h12v6H8zM30 36h10v6H30M20 39h10" />
        </g>
      )}
      {id === 'roots' && (
        <g {...base}>
          <path className="g-stem" d="M24 34V18" />
          <path className="g-leaf" d="M24 24c-6 0-10-4-10-10 6 0 10 4 10 10zM24 20c0-6 4-10 10-10 0 6-4 10-10 10z" />
          <path d="M8 34h32v8H8z" />
          <path d="M14 34v8M24 34v8M34 34v8" />
        </g>
      )}
      {id === 'reach' && (
        <g {...base}>
          <rect x="6" y="8" width="16" height="12" />
          <path d="M10 16v-3M14 16v-5M18 16v-2" />
          <path className="g-arrow" d="M22 14h8a6 6 0 0 1 6 6v6" />
          <path className="g-arrow" d="M32 22l4 4 4-4" />
          <path d="M28 30h16v10H28zM32 34h8" />
          <path d="M6 34h12M6 38h8" />
        </g>
      )}
    </svg>
  )
}

export const Arrow = ({ dir = 'right' }: { dir?: 'right' | 'down' | 'up-right' }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="arrow" style={{ transform: dir === 'down' ? 'rotate(90deg)' : dir === 'up-right' ? 'rotate(-45deg)' : undefined }}>
    <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
)

export const Ext = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="ext">
    <path d="M4 2h6v6M10 2 3 9" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)
