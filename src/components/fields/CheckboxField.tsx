import type { FieldComponentProps } from '../../types/registry.types';

export function CheckboxField({ fieldName, field, error, disabled, onChange, onBlur, value }: FieldComponentProps) {
  return (
    <div className="rhf-field rhf-field--checkbox">
      <label className="rhf-checkbox-label">
        <input
          id={fieldName}
          name={fieldName}
          type="checkbox"
          className={`rhf-checkbox${error ? ' rhf-checkbox--error' : ''}`}
          disabled={disabled}
          checked={(value as boolean) ?? false}
          onChange={(e) => onChange?.(e.target.checked)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldName}-error` : undefined}
        />
        {field.label && <span className="rhf-checkbox-text">{field.label}</span>}
      </label>
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
