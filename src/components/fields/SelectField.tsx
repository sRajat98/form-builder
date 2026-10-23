import type { FieldComponentProps } from '../../types/registry.types';

export function SelectField({ fieldName, field, error, disabled, onChange, onBlur, value }: FieldComponentProps) {
  return (
    <div className="rhf-field rhf-field--select">
      {field.label && (
        <label htmlFor={fieldName} className="rhf-label">
          {field.label}
        </label>
      )}
      <select
        id={fieldName}
        name={fieldName}
        className={`rhf-select${error ? ' rhf-select--error' : ''}`}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        value={(value as string) ?? ''}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldName}-error` : undefined}
      >
        <option value="">{field.placeholder ?? 'Select...'}</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {field.helperText && !error && (
        <p className="rhf-helper-text">{field.helperText}</p>
      )}
      {error && (
        <p id={`${fieldName}-error`} className="rhf-error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
