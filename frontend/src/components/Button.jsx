import { Loader2 } from 'lucide-react';

/** Reusable tactical button. variant: primary | amber | danger | success | ghost */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  iconOnly = false,
  children,
  className = '',
  disabled,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${iconOnly ? 'btn-icon' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 size={size === 'sm' ? 14 : 18} className="spin" /> : Icon && <Icon size={size === 'sm' ? 14 : 18} />}
      {!iconOnly && children}
    </button>
  );
}
