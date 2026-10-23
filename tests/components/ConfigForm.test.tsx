import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigForm } from '../../src/components/ConfigForm';
import type { FormConfig } from '../../src/types/config.types';

const basicConfig: FormConfig = {
  id: 'test-form',
  name: 'Test Form',
  version: '1.0.0',
  fields: {
    firstName: { type: 'text', label: 'First Name' },
    lastName: { type: 'text', label: 'Last Name' },
  },
  fieldsOrder: ['firstName', 'lastName'],
};

describe('ConfigForm', () => {
  it('renders fields from config', () => {
    render(<ConfigForm config={basicConfig} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
  });

  it('calls onSubmit with form data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ConfigForm config={basicConfig} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'John', lastName: 'Doe' })
      );
    });
  });

  it('renders with default values', () => {
    render(
      <ConfigForm
        config={basicConfig}
        onSubmit={vi.fn()}
        defaultValues={{ firstName: 'Jane' }}
      />
    );
    expect(screen.getByLabelText('First Name')).toHaveValue('Jane');
  });

  it('hides field based on visibility constraint', async () => {
    const config: FormConfig = {
      id: 'vis-test',
      name: 'Visibility Test',
      version: '1',
      fields: {
        type: { type: 'select', label: 'Type', options: [{ label: 'Business', value: 'business' }] },
        companyName: {
          type: 'text',
          label: 'Company Name',
          constraints: { visibility: { field: 'type', operator: 'EQ', value: 'business' } },
        },
      },
      fieldsOrder: ['type', 'companyName'],
    };

    render(<ConfigForm config={config} onSubmit={vi.fn()} />);
    expect(screen.queryByLabelText('Company Name')).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText('Type'), 'business');

    await waitFor(() => {
      expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
    });
  });

  it('renders sections when layout.sections is provided', () => {
    const config: FormConfig = {
      ...basicConfig,
      layout: {
        sections: [
          { id: 'sec1', title: 'Personal Info', fields: ['firstName', 'lastName'] },
        ],
      },
    };
    render(<ConfigForm config={config} onSubmit={vi.fn()} />);
    expect(screen.getByText('Personal Info')).toBeInTheDocument();
  });

  it('skips unknown fields in fieldsOrder without crashing', () => {
    const config: FormConfig = {
      ...basicConfig,
      fieldsOrder: ['firstName', 'nonExistentField', 'lastName'],
    };
    render(<ConfigForm config={config} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
  });
});
