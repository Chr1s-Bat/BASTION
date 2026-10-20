import {
  Ban, CheckCircle2, Hourglass, PackageCheck, Siren, Undo2, Wrench, Archive, Flag, ArrowDownCircle,
} from 'lucide-react';

const STATUS = {
  // requisition workflow
  pending: { icon: Hourglass, cls: 'amber' },
  approved: { icon: CheckCircle2, cls: 'green' },
  issued: { icon: PackageCheck, cls: 'blue' },
  returned: { icon: Undo2, cls: 'grey' },
  rejected: { icon: Ban, cls: 'red' },
  // equipment condition
  operational: { icon: CheckCircle2, cls: 'green' },
  maintenance: { icon: Wrench, cls: 'amber' },
  decommissioned: { icon: Archive, cls: 'grey' },
  // priority
  routine: { icon: ArrowDownCircle, cls: 'grey' },
  urgent: { icon: Flag, cls: 'amber' },
  critical: { icon: Siren, cls: 'red' },
};

export default function StatusBadge({ value }) {
  const cfg = STATUS[value] || { icon: Hourglass, cls: 'grey' };
  const Icon = cfg.icon;
  return (
    <span className={`badge badge-${cfg.cls}`}>
      <Icon size={13} /> {value}
    </span>
  );
}
