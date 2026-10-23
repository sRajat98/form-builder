import type { FieldConstraint } from './constraint.types';
import type { FieldConfig } from './field.types';

export type SectionConfig = {
  id: string;
  title?: string;
  description?: string;
  fields: string[];
  visibility?: FieldConstraint;
  columns?: 1 | 2 | 3;
};

export type FormConfig = {
  id: string;
  name: string;
  version: string;
  fields: Record<string, FieldConfig>;
  fieldsOrder: string[];
  layout?: {
    columns?: 1 | 2 | 3;
    sections?: SectionConfig[];
  };
};
