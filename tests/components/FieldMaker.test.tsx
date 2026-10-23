import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { FieldMaker } from '../../src/components/FieldMaker';
import { createRegistry } from '../../src/registry/componentRegistry';
import type { FieldConfig } from '../../src/types/field.types';

function Wrapper({ fieldName, field }: { fieldName: string; field: FieldConfig }) {
  const { control } = useForm<Record<string, unknown>>({
    defaultValues: { type: '', [fieldName]: '' },
  });
  return (
    <FieldMaker
      fieldName={fieldName}
      field={field}
      control={control}
      registry={createRegistry()}
    />
  );
}

describe('FieldMaker', () => {
  it('renders a text field', () => {
    render(<Wrapper fieldName="name" field={{ type: 'text', label: 'Name' }} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('renders null when visibility constraint is not met', () => {
    const field: FieldConfig = {
      type: 'text',
      label: 'Hidden Field',
      constraints: { visibility: { field: 'type', operator: 'EQ', value: 'show' } },
    };
    render(<Wrapper fieldName="hidden" field={field} />);
    expect(screen.queryByLabelText('Hidden Field')).not.toBeInTheDocument();
  });

  it('shows field when visibility constraint is met', () => {
    function WrapperWithValue() {
      const { control } = useForm<Record<string, unknown>>({
        defaultValues: { type: 'show', target: '' },
      });
      return (
        <FieldMaker
          fieldName="target"
          field={{
            type: 'text',
            label: 'Shown Field',
            constraints: { visibility: { field: 'type', operator: 'EQ', value: 'show' } },
          }}
          control={control}
          registry={createRegistry()}
        />
      );
    }
    render(<WrapperWithValue />);
    expect(screen.getByLabelText('Shown Field')).toBeInTheDocument();
  });

  it('shows validation error when field is required and empty', async () => {
    const user = userEvent.setup();

    function WrapperWithForm() {
      const { control, handleSubmit } = useForm<Record<string, unknown>>();
      return (
        <form onSubmit={handleSubmit(vi.fn())}>
          <FieldMaker
            fieldName="email"
            field={{
              type: 'text',
              label: 'Email',
              validations: {
                required: { key: 'required', value: true, message: 'Email is required' },
              },
            }}
            control={control}
            registry={createRegistry()}
          />
          <button type="submit">Submit</button>
        </form>
      );
    }

    render(<WrapperWithForm />);
    await user.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
    });
  });
});
