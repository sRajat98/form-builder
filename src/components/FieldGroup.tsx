import type { Control } from 'react-hook-form';
import { useFieldVisibility } from '../hooks/useFieldVisibility';
import { FieldMaker } from './FieldMaker';
import type { SectionConfig } from '../types/config.types';
import type { FieldConfig } from '../types/field.types';
import type { ComponentRegistry } from '../types/registry.types';
import type { Formatter } from '../core/templateResolver';

type FieldGroupProps = {
  section: SectionConfig;
  fields: Record<string, FieldConfig>;
  control: Control<Record<string, unknown>>;
  registry: ComponentRegistry;
  formatters?: Record<string, Formatter>;
};

export function FieldGroup({ section, fields, control, registry, formatters }: FieldGroupProps) {
  const isVisible = useFieldVisibility(section.visibility, control);
  if (!isVisible) return null;

  const columns = section.columns ?? 1;

  return (
    <fieldset className={`rhf-section rhf-section--cols-${columns}`}>
      {(section.title || section.description) && (
        <div className="rhf-section-header">
          {section.title && <legend className="rhf-section-title">{section.title}</legend>}
          {section.description && (
            <p className="rhf-section-description">{section.description}</p>
          )}
        </div>
      )}
      <div className="rhf-section-fields">
        {section.fields.map((fieldName) => {
          const field = fields[fieldName];
          if (!field) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn(
                `[rhf-config-engine] Section "${section.id}" references unknown field "${fieldName}"`
              );
            }
            return null;
          }
          return (
            <FieldMaker
              key={fieldName}
              fieldName={fieldName}
              field={field}
              control={control}
              registry={registry}
              formatters={formatters}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
