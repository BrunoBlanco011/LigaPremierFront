export function StatCard({
  num,
  label,
}: {
  num: number | string
  label: string
}) {
  return (
    <div className="card stat-card">
      <div className="stat-card__num tnum">{num}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  )
}
