import { Compass, HeartPulse, Package, Radio, Tent, Truck, Zap } from 'lucide-react';

const MAP = {
  radio: Radio,
  truck: Truck,
  'heart-pulse': HeartPulse,
  zap: Zap,
  tent: Tent,
  package: Package,
  compass: Compass,
};

export default function CategoryIcon({ name, size = 22 }) {
  const Icon = MAP[name] || Package;
  return <Icon size={size} />;
}
