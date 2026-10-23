import type { RegisterOptions } from 'react-hook-form';
import type { ValidationConfig, ValidationRule } from '../types/validation.types';
import { evaluateConstraint } from './constraintEvaluator';

function isRuleActive(rule: ValidationRule, values: Record<string, unknown>): boolean {
  if (!rule.constraints) return true;
  return evaluateConstraint(rule.constraints, values);
}

export function buildValidationRules(
  validations: ValidationConfig | undefined,
  values: Record<string, unknown>
): RegisterOptions {
  if (!validations) return {};

  const rules: RegisterOptions = {};

  if (validations.required && isRuleActive(validations.required, values)) {
    rules.required = validations.required.message ?? (validations.required.value as boolean);
  }

  if (validations.minLength && isRuleActive(validations.minLength, values)) {
    rules.minLength = {
      value: validations.minLength.value as number,
      message: validations.minLength.message ?? `Minimum length is ${validations.minLength.value}`,
    };
  }

  if (validations.maxLength && isRuleActive(validations.maxLength, values)) {
    rules.maxLength = {
      value: validations.maxLength.value as number,
      message: validations.maxLength.message ?? `Maximum length is ${validations.maxLength.value}`,
    };
  }

  if (validations.min && isRuleActive(validations.min, values)) {
    rules.min = {
      value: validations.min.value as number,
      message: validations.min.message ?? `Minimum value is ${validations.min.value}`,
    };
  }

  if (validations.max && isRuleActive(validations.max, values)) {
    rules.max = {
      value: validations.max.value as number,
      message: validations.max.message ?? `Maximum value is ${validations.max.value}`,
    };
  }

  if (validations.pattern && isRuleActive(validations.pattern, values)) {
    const patternValue = validations.pattern.value;
    const regexp =
      patternValue instanceof RegExp
        ? patternValue
        : new RegExp(String(patternValue));
    rules.pattern = {
      value: regexp,
      message: validations.pattern.message ?? 'Invalid format',
    };
  }

  if (validations.custom && validations.custom.length > 0) {
    const activeCustom = validations.custom.filter((r) => isRuleActive(r, values));
    if (activeCustom.length > 0) {
      rules.validate = activeCustom.reduce<Record<string, (v: unknown) => boolean | string>>(
        (acc, rule) => {
          acc[rule.key] = (fieldValue: unknown) => {
            const fn = rule.value as (v: unknown) => boolean | string;
            if (typeof fn === 'function') {
              const result = fn(fieldValue);
              if (result === false) return rule.message ?? 'Invalid value';
              if (typeof result === 'string') return result;
              return true;
            }
            return true;
          };
          return acc;
        },
        {}
      );
    }
  }

  return rules;
}
