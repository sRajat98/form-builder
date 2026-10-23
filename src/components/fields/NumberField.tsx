import type { FieldComponentProps } from '../../types/registry.types';

export function NumberField({ fieldName, field, error, disabled, onChange, onBlur, value }: FieldComponentProps) {
  return (
    <div className="rhf-field rhf-field--number">
      {field.label && (
        <label htmlFor={fieldName} className="rhf-label">
          {field.label}
        </label>
      )}
      <input
        id={fieldName}
        name={fieldName}
        type="number"
        className={`rhf-input${error ? ' rhf-input--error' : ''}`}
        placeholder={field.placeholder}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.valueAsNumber)}
        onBlur={onBlur}
        value={(value as number) ?? ''}
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
