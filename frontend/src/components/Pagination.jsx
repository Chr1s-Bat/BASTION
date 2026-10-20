import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Displays Laravel paginate() meta: { current_page, last_page, total, from, to } */
export default function Pagination({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) {
    return meta ? <p className="page-info">{meta.total} record{meta.total === 1 ? '' : 's'} on file</p> : null;
  }

  const { current_page: cur, last_page: last } = meta;
  const pages = [];
  for (let p = Math.max(1, cur - 2); p <= Math.min(last, cur + 2); p++) pages.push(p);

  return (
    <nav className="pagination" aria-label="Pagination">
      <p className="page-info">
        Showing {meta.from}–{meta.to} of {meta.total}
      </p>
      <div className="page-btns">
        <button className="page-btn" disabled={cur === 1} onClick={() => onPage(cur - 1)} aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>
        {pages[0] > 1 && (
          <>
            <button className="page-btn" onClick={() => onPage(1)}>1</button>
            {pages[0] > 2 && <span className="page-gap">…</span>}
          </>
        )}
        {pages.map((p) => (
          <button key={p} className={`page-btn ${p === cur ? 'active' : ''}`} onClick={() => onPage(p)}>
            {p}
          </button>
        ))}
        {pages[pages.length - 1] < last && (
          <>
            {pages[pages.length - 1] < last - 1 && <span className="page-gap">…</span>}
            <button className="page-btn" onClick={() => onPage(last)}>{last}</button>
          </>
        )}
        <button className="page-btn" disabled={cur === last} onClick={() => onPage(cur + 1)} aria-label="Next page">
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
