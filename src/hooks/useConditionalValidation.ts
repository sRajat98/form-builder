import { useWatch } from 'react-hook-form';
import type { Control, RegisterOptions } from 'react-hook-form';
import { extractDependencies } from '../core/fieldDependencyGraph';
import { buildValidationRules } from '../core/validationBuilder';
import type { ValidationConfig, ValidationRule } from '../types/validation.types';
import type { FieldConstraint } from '../types/constraint.types';

function collectValidationConstraints(validations?: ValidationConfig): FieldConstraint[] {
  if (!validations) return [];
  const constraints: FieldConstraint[] = [];

  const scalar: Array<ValidationRule | undefined> = [
    validations.required,
    validations.minLength,
    validations.maxLength,
    validations.min,
    validations.max,
    validations.pattern,
  ];

  scalar.forEach((r) => {
    if (r?.constraints) constraints.push(r.constraints);
  });

  validations.custom?.forEach((r) => {
    if (r.constraints) constraints.push(r.constraints);
  });

  return constraints;
}

export function useConditionalValidation(
  validations: ValidationConfig | undefined,
  control: Control<Record<string, unknown>>
): RegisterOptions {
  const constraints = collectValidationConstraints(validations);
  const deps = Array.from(
    new Set(
      constraints.reduce<string[]>((acc, c) => acc.concat(extractDependencies(c)), [])
    )
  );

  const watchedValues = useWatch({
    control,
    name: deps as [string, ...string[]],
    disabled: deps.length === 0,
  });

  const values: Record<string, unknown> = deps.reduce<Record<string, unknown>>(
    (acc, key, i) => {
      acc[key] = Array.isArray(watchedValues) ? (watchedValues as unknown[])[i] : watchedValues;
      return acc;
    },
    {}
  );

  return buildValidationRules(validations, values);
}
