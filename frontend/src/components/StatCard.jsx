/** Dashboard figure tile */
export default function StatCard({ icon: Icon, label, value, tone = 'olive', sub }) {
  return (
    <div className={`stat panel corners tone-${tone}`}>
      <div className="stat-icon"><Icon size={26} /></div>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
    </div>
  );
}
