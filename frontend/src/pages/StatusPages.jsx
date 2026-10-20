import { Link } from 'react-router-dom';
import { Home, Lock, MapPinOff } from 'lucide-react';
import Button from '../components/Button';

function Screen({ icon: Icon, code, title, text }) {
  return (
    <div className="empty panel corners status-screen">
      <Icon size={60} />
      <p className="status-code">{code}</p>
      <h3>{title}</h3>
      <p>{text}</p>
      <Link to="/"><Button variant="amber" icon={Home}>Return to command</Button></Link>
    </div>
  );
}

export const NotFound = () => (
  <Screen icon={MapPinOff} code="404" title="Coordinates not found" text="That page is not on the map." />
);

export const Forbidden = () => (
  <Screen icon={Lock} code="403" title="Clearance denied" text="This area is restricted to Base Commanders." />
);
