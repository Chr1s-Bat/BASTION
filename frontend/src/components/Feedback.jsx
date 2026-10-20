import { AlertOctagon, Inbox, Loader2, RefreshCw } from 'lucide-react';
import Button from './Button';

/** Loading indicator */
export function Loader({ label = 'Establishing uplink…' }) {
  return (
    <div className="loader" role="status">
      <div className="radar"><span /></div>
      <p><Loader2 size={14} className="spin" /> {label}</p>
    </div>
  );
}

/** Empty list state */
export function EmptyState({ title = 'No records found', text, action }) {
  return (
    <div className="empty panel">
      <Inbox size={44} />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

/** Error state with retry */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="empty panel error-panel" role="alert">
      <AlertOctagon size={44} />
      <h3>Transmission failed</h3>
      <p>{message}</p>
      {onRetry && <Button variant="amber" icon={RefreshCw} onClick={onRetry}>Retry</Button>}
    </div>
  );
}
