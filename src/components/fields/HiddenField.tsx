import type { FieldComponentProps } from '../../types/registry.types';

export function HiddenField({ fieldName, value, onChange }: FieldComponentProps) {
  return (
    <input
      type="hidden"
      name={fieldName}
      value={(value as string) ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}
