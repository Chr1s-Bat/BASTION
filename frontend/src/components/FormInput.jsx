import { AlertTriangle } from 'lucide-react';

function Field({ label, name, error, hint, required, children }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={name} className="field-label">
          {label} {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="field-error" role="alert">
          <AlertTriangle size={13} /> {error}
        </p>
      ) : (
        hint && <p className="field-hint">{hint}</p>
      )}
    </div>
  );
}

/** Controlled text input with optional leading icon and error display. */
export function FormInput({ label, name, error, hint, required, icon: Icon, ...rest }) {
  return (
    <Field label={label} name={name} error={error} hint={hint} required={required}>
      <div className="input-wrap">
        {Icon && <Icon size={18} className="input-icon" />}
        <input id={name} name={name} className={`input ${Icon ? 'with-icon' : ''}`} {...rest} />
      </div>
    </Field>
  );
}

export function FormSelect({ label, name, error, hint, required, icon: Icon, children, ...rest }) {
  return (
    <Field label={label} name={name} error={error} hint={hint} required={required}>
      <div className="input-wrap">
        {Icon && <Icon size={18} className="input-icon" />}
        <select id={name} name={name} className={`input ${Icon ? 'with-icon' : ''}`} {...rest}>
          {children}
        </select>
      </div>
    </Field>
  );
}

export function FormTextarea({ label, name, error, hint, required, ...rest }) {
  return (
    <Field label={label} name={name} error={error} hint={hint} required={required}>
      <textarea id={name} name={name} className="input textarea" rows={3} {...rest} />
    </Field>
  );
}
