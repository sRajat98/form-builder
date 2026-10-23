import { useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { extractDependencies } from '../core/fieldDependencyGraph';
import { evaluateConstraint } from '../core/constraintEvaluator';
import type { FieldConstraint } from '../types/constraint.types';

export function useFieldVisibility(
  constraint: FieldConstraint | undefined,
  control: Control<Record<string, unknown>>
): boolean {
  const deps = extractDependencies(constraint);

  const watchedValues = useWatch({ control, name: deps as [string, ...string[]] });

  if (!constraint) return true;

  const values: Record<string, unknown> = deps.reduce<Record<string, unknown>>(
    (acc, key, i) => {
      acc[key] = Array.isArray(watchedValues) ? (watchedValues as unknown[])[i] : watchedValues;
      return acc;
    },
    {}
  );

  return evaluateConstraint(constraint, values);
}
