import type { FieldComponentProps } from '../../types/registry.types';

export function RadioField({ fieldName, field, error, disabled, onChange, onBlur, value }: FieldComponentProps) {
  return (
    <div className="rhf-field rhf-field--radio">
      {field.label && (
        <fieldset className="rhf-fieldset">
          <legend className="rhf-label">{field.label}</legend>
          {field.options?.map((opt) => (
            <label key={opt.value} className="rhf-radio-option">
              <input
                type="radio"
                name={fieldName}
                value={opt.value}
                checked={value === opt.value}
                disabled={disabled || opt.disabled}
                onChange={() => onChange?.(opt.value)}
                onBlur={onBlur}
                aria-invalid={!!error}
              />
              {opt.label}
            </label>
          ))}
        </fieldset>
      )}
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
