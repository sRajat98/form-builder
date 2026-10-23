import { useForm } from 'react-hook-form';
import type { UseFormReturn, SubmitHandler } from 'react-hook-form';
import { createRegistry } from '../registry/componentRegistry';
import { FieldMaker } from './FieldMaker';
import { FieldGroup } from './FieldGroup';
import type { FormConfig } from '../types/config.types';
import type { ComponentRegistry } from '../types/registry.types';
import type { Formatter } from '../core/templateResolver';

type ConfigFormProps = {
  config: FormConfig;
  onSubmit: (data: Record<string, unknown>) => void;
  components?: ComponentRegistry;
  formatters?: Record<string, Formatter>;
  defaultValues?: Record<string, unknown>;
  className?: string;
  form?: UseFormReturn<Record<string, unknown>>;
  includeHiddenFields?: boolean;
};

export function ConfigForm({
  config,
  onSubmit,
  components,
  formatters,
  defaultValues,
  className,
  form: externalForm,
  includeHiddenFields = true,
}: ConfigFormProps) {
  const internalForm = useForm<Record<string, unknown>>({ defaultValues });
  const form = externalForm ?? internalForm;
  const { control, handleSubmit } = form;

  const registry = createRegistry(components);

  const submitHandler: SubmitHandler<Record<string, unknown>> = (data) => {
    const output = { ...data };
    if (!includeHiddenFields) {
      config.fieldsOrder.forEach((fieldName) => {
        const field = config.fields[fieldName];
        if (field?.type === 'hidden') delete output[fieldName];
      });
    }
    onSubmit(output);
  };

  if (process.env.NODE_ENV !== 'production') {
    config.fieldsOrder.forEach((key) => {
      if (!config.fields[key]) {
        console.warn(
          `[rhf-config-engine] fieldsOrder contains "${key}" but it is not defined in config.fields`
        );
      }
    });
  }

  const hasSections = (config.layout?.sections?.length ?? 0) > 0;

  return (
    <form
      className={`rhf-form${className ? ` ${className}` : ''}`}
      onSubmit={handleSubmit(submitHandler)}
      noValidate
    >
      {hasSections
        ? config.layout!.sections!.map((section) => (
            <FieldGroup
              key={section.id}
              section={section}
              fields={config.fields}
              control={control}
              registry={registry}
              formatters={formatters}
            />
          ))
        : config.fieldsOrder.map((fieldName) => {
            const field = config.fields[fieldName];
            if (!field) return null;
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
      <button type="submit" className="rhf-submit">
        Submit
      </button>
    </form>
  );
}
