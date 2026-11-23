import { Fragment, type ElementType, type ReactNode } from 'react'

/**
 * Heading whose characters flip up out of a mask (data-reveal="words").
 * The heading carries the plain text as its accessible name.
 */
export function Split({ as: Tag = 'h2', text, className, id, children, words = true }: { as?: ElementType; text: string; className?: string; id?: string; children?: ReactNode; words?: boolean }) {
  const parts = text.split(' ')
  return (
    <Tag className={className} id={id} data-reveal="words" aria-label={text}>
      {parts.map((w, i) => (
        <Fragment key={i}>
          <span className="w" aria-hidden="true">
            {words ? (
              <span className="wi">{w}</span>
            ) : (
              <span className="wi">
                {w.split('').map((c, j) => (
                  <span className="ci" key={j}>
                    {c}
                  </span>
                ))}
              </span>
            )}
          </span>
          {i < parts.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
      {children}
    </Tag>
  )
}
