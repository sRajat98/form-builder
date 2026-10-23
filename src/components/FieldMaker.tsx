import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { useFieldVisibility } from '../hooks/useFieldVisibility';
import { useConditionalValidation } from '../hooks/useConditionalValidation';
import { useTemplateVars } from '../hooks/useTemplateVars';
import type { FieldConfig } from '../types/field.types';
import type { FieldConstraint } from '../types/constraint.types';
import type { ComponentRegistry } from '../types/registry.types';
import type { Formatter } from '../core/templateResolver';

type FieldMakerProps = {
  fieldName: string;
  field: FieldConfig;
  control: Control<Record<string, unknown>>;
  registry: ComponentRegistry;
  formatters?: Record<string, Formatter>;
};

export function FieldMaker({ fieldName, field, control, registry, formatters }: FieldMakerProps) {
  const { visibility, disabled } = field.constraints ?? {};

  const isVisible = useFieldVisibility(visibility, control);

  const rules = useConditionalValidation(field.validations, control);

  const label = useTemplateVars(field.label, control, formatters);
  const placeholder = useTemplateVars(field.placeholder, control, formatters);
  const helperText = useTemplateVars(field.helperText, control, formatters);

  // Always call hooks unconditionally; only use the constraint result when one exists
  const disabledConstraint =
    typeof disabled === 'object' && disabled !== null
      ? (disabled as FieldConstraint)
      : undefined;
  const isDisabledByConstraint = useFieldVisibility(disabledConstraint, control);
  const isDisabled =
    disabled === undefined
      ? false
      : typeof disabled === 'boolean'
        ? disabled
        : isDisabledByConstraint;

  if (!isVisible) return null;

  const Component = registry[field.type];
  if (!Component) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[rhf-config-engine] No component registered for field type: "${field.type}"`);
    }
    return null;
  }

  return (
    <Controller
      name={fieldName}
      control={control}
      rules={rules}
      defaultValue={(field.defaultValue as Record<string, unknown>[string]) ?? ''}
      render={({ field: rhfField, fieldState }) => (
        <Component
          fieldName={fieldName}
          field={{ ...field, label, placeholder, helperText }}
          control={control}
          error={fieldState.error}
          disabled={isDisabled}
          onChange={rhfField.onChange}
          onBlur={rhfField.onBlur}
          value={rhfField.value}
          name={rhfField.name}
        />
      )}
    />
  );
}
