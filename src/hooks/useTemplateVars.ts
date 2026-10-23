import { useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { resolveTemplate, extractTemplateFields } from '../core/templateResolver';
import type { Formatter } from '../core/templateResolver';

export function useTemplateVars(
  template: string | undefined,
  control: Control<Record<string, unknown>>,
  formatters?: Record<string, Formatter>
): string | undefined {
  const deps = template ? extractTemplateFields(template) : [];

  const watchedValues = useWatch({
    control,
    name: deps as [string, ...string[]],
    disabled: deps.length === 0,
  });

  if (!template) return undefined;
  if (deps.length === 0) return template;

  const values: Record<string, unknown> = deps.reduce<Record<string, unknown>>(
    (acc, key, i) => {
      acc[key] = Array.isArray(watchedValues) ? (watchedValues as unknown[])[i] : watchedValues;
      return acc;
    },
    {}
  );

  return resolveTemplate(template, values, formatters);
}
