import type { FieldComponentProps } from '../../types/registry.types';

export function TextareaField({ fieldName, field, error, disabled, onChange, onBlur, value }: FieldComponentProps) {
  return (
    <div className="rhf-field rhf-field--textarea">
      {field.label && (
        <label htmlFor={fieldName} className="rhf-label">
          {field.label}
        </label>
      )}
      <textarea
        id={fieldName}
        name={fieldName}
        className={`rhf-textarea${error ? ' rhf-textarea--error' : ''}`}
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
