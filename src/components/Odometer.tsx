/** Rolling digits. Digits sit at their final value in CSS, so it reads correctly with motion off. */
export function Odometer({ value, className }: { value: string; className?: string }) {
  return (
    <span className={`odo ${className ?? ''}`} data-reveal="odo" aria-label={value}>
      {value.split('').map((ch, i) =>
        /\d/.test(ch) ? (
          <span className="odo-win" key={i} aria-hidden="true">
            <span className="odo-col" data-d={ch} style={{ transform: `translateY(${-(Number(ch) + 10) * (100 / 21)}%)` }}>
              {Array.from({ length: 21 }, (_, k) => (
                <span key={k}>{k % 10}</span>
              ))}
            </span>
          </span>
        ) : (
          <span className="odo-sep" key={i} aria-hidden="true">
            {ch}
          </span>
        ),
      )}
    </span>
  )
}
