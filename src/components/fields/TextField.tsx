import type { FieldComponentProps } from '../../types/registry.types';

export function TextField({ fieldName, field, error, disabled, onChange, onBlur, value }: FieldComponentProps) {
  return (
    <div className="rhf-field rhf-field--text">
      {field.label && (
        <label htmlFor={fieldName} className="rhf-label">
          {field.label}
        </label>
      )}
      <input
        id={fieldName}
        name={fieldName}
        type="text"
        className={`rhf-input${error ? ' rhf-input--error' : ''}`}
        placeholder={field.placeholder}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        value={(value as string) ?? ''}
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
