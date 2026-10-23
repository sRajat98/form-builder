import { extractDependencies } from '../core/fieldDependencyGraph';
import { extractTemplateFields } from '../core/templateResolver';
import type { FieldConfig } from '../types/field.types';
import type { FieldConstraint } from '../types/constraint.types';

export function useFieldDependencies(_fieldName: string, field: FieldConfig): string[] {
  const deps = new Set<string>();
  const { visibility, disabled } = field.constraints ?? {};

  extractDependencies(visibility).forEach((d) => deps.add(d));

  if (disabled && typeof disabled !== 'boolean') {
    extractDependencies(disabled as FieldConstraint).forEach((d) => deps.add(d));
  }

  if (field.validations) {
    const { required, minLength, maxLength, min, max, pattern, custom } = field.validations;
    [required, minLength, maxLength, min, max, pattern].forEach((r) => {
      if (r?.constraints) extractDependencies(r.constraints).forEach((d) => deps.add(d));
    });
    custom?.forEach((r) => {
      if (r.constraints) extractDependencies(r.constraints).forEach((d) => deps.add(d));
    });
  }

  [field.label, field.placeholder, field.helperText].forEach((tpl) => {
    if (tpl) extractTemplateFields(tpl).forEach((d) => deps.add(d));
  });

  return Array.from(deps);
}
