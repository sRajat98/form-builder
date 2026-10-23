import type { ComponentType } from 'react';
import type { Control, FieldError } from 'react-hook-form';
import type { FieldConfig, FieldType } from './field.types';

export type FieldComponentProps = {
  fieldName: string;
  field: FieldConfig;
  control: Control<Record<string, unknown>>;
  error?: FieldError;
  disabled?: boolean;
  onChange?: (value: unknown) => void;
  onBlur?: () => void;
  value?: unknown;
  name?: string;
};

export type ComponentRegistry = Partial<Record<FieldType, ComponentType<FieldComponentProps>>>;
