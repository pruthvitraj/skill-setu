import { useId } from 'react';
export default function Select({ label, id, hint, error, className = '', options = [], ...props }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const describedBy = [props['aria-describedby'], hint && `${fieldId}-hint`, error && `${fieldId}-error`].filter(Boolean).join(' ');
  // Keep existing native props and className consumers compatible.
  const nativeProps = { ...props }; delete nativeProps['aria-describedby']; delete nativeProps['aria-invalid'];
  return <div className="ui-field">{label && <label className="label" htmlFor={fieldId}>{label}</label>}<select id={fieldId} className={`input ${className}`} aria-invalid={error ? true : props['aria-invalid']} aria-describedby={describedBy || undefined} {...nativeProps}>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{hint && <p className="ui-helper" id={`${fieldId}-hint`}>{hint}</p>}{error && <p className="ui-field-error" id={`${fieldId}-error`}>{error}</p>}</div>;
}
