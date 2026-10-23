import type { FieldComponentProps } from '../../types/registry.types';

export function FileField({ fieldName, field, error, disabled, onChange, onBlur }: FieldComponentProps) {
  return (
    <div className="rhf-field rhf-field--file">
      {field.label && (
        <label htmlFor={fieldName} className="rhf-label">
          {field.label}
        </label>
      )}
      <input
        id={fieldName}
        name={fieldName}
        type="file"
        className={`rhf-input rhf-input--file${error ? ' rhf-input--error' : ''}`}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.files)}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldName}-error` : undefined}
      />
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
