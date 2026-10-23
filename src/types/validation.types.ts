import type { FieldConstraint } from './constraint.types';

export type ValidationRule = {
  key: string;
  value: unknown;
  message?: string;
  constraints?: FieldConstraint;
};

export type ValidationConfig = {
  required?: ValidationRule;
  minLength?: ValidationRule;
  maxLength?: ValidationRule;
  min?: ValidationRule;
  max?: ValidationRule;
  pattern?: ValidationRule;
  custom?: ValidationRule[];
};
