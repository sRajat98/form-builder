// Components
export { ConfigForm } from './components/ConfigForm';
export { FieldMaker } from './components/FieldMaker';
export { FieldGroup } from './components/FieldGroup';

// Hooks
export { useFieldVisibility } from './hooks/useFieldVisibility';
export { useConditionalValidation } from './hooks/useConditionalValidation';
export { useTemplateVars } from './hooks/useTemplateVars';
export { useFieldDependencies } from './hooks/useFieldDependencies';

// Core (pure functions — usable outside React / in Node.js)
export { evaluateConstraint } from './core/constraintEvaluator';
export { extractDependencies } from './core/fieldDependencyGraph';
export { resolveTemplate, extractTemplateFields } from './core/templateResolver';
export { buildValidationRules } from './core/validationBuilder';
export { createRegistry } from './registry/componentRegistry';

// Types
export type {
  FieldConfig,
  FieldConstraints,
  FieldType,
  FieldOption,
} from './types/field.types';
export type {
  FieldConstraint,
  FieldComparisonCriteria,
  Operator,
} from './types/constraint.types';
export type {
  ValidationRule,
  ValidationConfig,
} from './types/validation.types';
export type {
  FormConfig,
  SectionConfig,
} from './types/config.types';
export type {
  FieldComponentProps,
  ComponentRegistry,
} from './types/registry.types';
export type { Formatter } from './core/templateResolver';
