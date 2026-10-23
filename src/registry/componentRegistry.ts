import { TextField } from '../components/fields/TextField';
import { TextareaField } from '../components/fields/TextareaField';
import { NumberField } from '../components/fields/NumberField';
import { SelectField } from '../components/fields/SelectField';
import { MultiSelectField } from '../components/fields/MultiSelectField';
import { RadioField } from '../components/fields/RadioField';
import { CheckboxField } from '../components/fields/CheckboxField';
import { DateField } from '../components/fields/DateField';
import { FileField } from '../components/fields/FileField';
import { HiddenField } from '../components/fields/HiddenField';
import type { ComponentRegistry } from '../types/registry.types';

const defaultRegistry: ComponentRegistry = {
  text: TextField,
  textarea: TextareaField,
  number: NumberField,
  select: SelectField,
  'multi-select': MultiSelectField,
  radio: RadioField,
  checkbox: CheckboxField,
  date: DateField,
  file: FileField,
  hidden: HiddenField,
};

export function createRegistry(overrides?: ComponentRegistry): ComponentRegistry {
  return { ...defaultRegistry, ...overrides };
}
