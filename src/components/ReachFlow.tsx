/** Restrained diagram: what gets logged, how a net saving is verified, and the conditional 20% share. */
export function ReachFlow({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`reachflow${compact ? ' compact' : ''}`}>
      <ol className="rf-steps">
        <li>
          <span className="rf-n">Log</span>
          <span>PV meter kWh · water delivered to flushing, m³ · running and contract costs</span>
        </li>
        <li>
          <span className="rf-n">Verify</span>
          <span>
            Net saving = evidenced bill reduction, <b>minus</b> operation and maintenance, <b>minus</b> financing, PPA and other contract costs
          </span>
        </li>
        <li>
          <span className="rf-n">Share</span>
          <span>
            Bursary amount = <b>20%</b> × verified net saving, <em>only if the school approves</em>
          </span>
        </li>
      </ol>
      {!compact && <p className="rf-note">No baseline bills or installed costs exist yet, so no dollar figure is shown.</p>}
    </div>
  )
}
