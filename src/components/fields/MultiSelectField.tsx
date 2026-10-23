import type { FieldComponentProps } from '../../types/registry.types';

export function MultiSelectField({ fieldName, field, error, disabled, onChange, onBlur, value }: FieldComponentProps) {
  const selected = (value as string[]) ?? [];

  function toggle(optValue: string) {
    const next = selected.includes(optValue)
      ? selected.filter((v) => v !== optValue)
      : [...selected, optValue];
    onChange?.(next);
  }

  return (
    <div className="rhf-field rhf-field--multi-select">
      {field.label && (
        <fieldset className="rhf-fieldset">
          <legend className="rhf-label">{field.label}</legend>
          {field.options?.map((opt) => (
            <label key={opt.value} className="rhf-checkbox-option">
              <input
                type="checkbox"
                name={fieldName}
                value={opt.value}
                checked={selected.includes(opt.value)}
                disabled={disabled || opt.disabled}
                onChange={() => toggle(opt.value)}
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
