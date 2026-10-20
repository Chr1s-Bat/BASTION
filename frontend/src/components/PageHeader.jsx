export default function PageHeader({ icon: Icon, title, subtitle, children }) {
  return (
    <header className="page-header">
      <div className="page-title">
        {Icon && <span className="page-title-icon"><Icon size={28} /></span>}
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="page-actions">{children}</div>
    </header>
  );
}
