import type { FieldConstraint } from './constraint.types';
import type { ValidationConfig } from './validation.types';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multi-select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'hidden';

export type FieldOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type FieldConstraints = {
  visibility?: FieldConstraint;
  disabled?: boolean | FieldConstraint;
};

export type FieldConfig = {
  type: FieldType;
  label?: string;
  placeholder?: string;
  helperText?: string;
  defaultValue?: unknown;
  constraints?: FieldConstraints;
  validations?: ValidationConfig;
  options?: FieldOption[];
  children?: Record<string, FieldConfig>;
  childrenOrder?: string[];
  meta?: Record<string, unknown>;
};
