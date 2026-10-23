import { describe, it, expect } from 'vitest';
import { buildValidationRules } from '../../src/core/validationBuilder';
import type { ValidationConfig } from '../../src/types/validation.types';

describe('buildValidationRules', () => {
  it('returns empty object for undefined validations', () => {
    expect(buildValidationRules(undefined, {})).toEqual({});
  });

  it('includes required rule', () => {
    const config: ValidationConfig = {
      required: { key: 'required', value: true, message: 'This field is required' },
    };
    const rules = buildValidationRules(config, {});
    expect(rules.required).toBe('This field is required');
  });

  it('uses boolean value when no message provided for required', () => {
    const config: ValidationConfig = {
      required: { key: 'required', value: true },
    };
    const rules = buildValidationRules(config, {});
    expect(rules.required).toBe(true);
  });

  it('includes minLength rule', () => {
    const config: ValidationConfig = {
      minLength: { key: 'minLength', value: 3, message: 'Too short' },
    };
    const rules = buildValidationRules(config, {});
    expect(rules.minLength).toEqual({ value: 3, message: 'Too short' });
  });

  it('includes maxLength with default message', () => {
    const config: ValidationConfig = {
      maxLength: { key: 'maxLength', value: 10 },
    };
    const rules = buildValidationRules(config, {});
    expect((rules.maxLength as { value: number; message: string }).value).toBe(10);
  });

  it('includes min and max rules', () => {
    const config: ValidationConfig = {
      min: { key: 'min', value: 1, message: 'Min 1' },
      max: { key: 'max', value: 100, message: 'Max 100' },
    };
    const rules = buildValidationRules(config, {});
    expect(rules.min).toEqual({ value: 1, message: 'Min 1' });
    expect(rules.max).toEqual({ value: 100, message: 'Max 100' });
  });

  it('converts string pattern to RegExp', () => {
    const config: ValidationConfig = {
      pattern: { key: 'pattern', value: '^[a-z]+$', message: 'Lowercase only' },
    };
    const rules = buildValidationRules(config, {});
    expect((rules.pattern as { value: RegExp }).value).toBeInstanceOf(RegExp);
  });

  it('passes RegExp pattern through as-is', () => {
    const re = /^\d+$/;
    const config: ValidationConfig = {
      pattern: { key: 'pattern', value: re },
    };
    const rules = buildValidationRules(config, {});
    expect((rules.pattern as { value: RegExp }).value).toBe(re);
  });

  describe('conditional rules (constraints)', () => {
    it('includes rule when constraint passes', () => {
      const config: ValidationConfig = {
        required: {
          key: 'required',
          value: true,
          message: 'Required',
          constraints: { field: 'type', operator: 'EQ', value: 'business' },
        },
      };
      const rules = buildValidationRules(config, { type: 'business' });
      expect(rules.required).toBe('Required');
    });

    it('excludes rule when constraint fails', () => {
      const config: ValidationConfig = {
        required: {
          key: 'required',
          value: true,
          message: 'Required',
          constraints: { field: 'type', operator: 'EQ', value: 'business' },
        },
      };
      const rules = buildValidationRules(config, { type: 'individual' });
      expect(rules.required).toBeUndefined();
    });

    it('includes minLength conditionally', () => {
      const config: ValidationConfig = {
        minLength: {
          key: 'minLength',
          value: 8,
          message: 'Min 8',
          constraints: { field: 'strength', operator: 'EQ', value: 'high' },
        },
      };
      expect(buildValidationRules(config, { strength: 'high' }).minLength).toBeDefined();
      expect(buildValidationRules(config, { strength: 'low' }).minLength).toBeUndefined();
    });
  });

  describe('custom rules', () => {
    it('includes active custom rules', () => {
      const config: ValidationConfig = {
        custom: [
          {
            key: 'noSpaces',
            value: (v: unknown) => !String(v).includes(' ') || 'No spaces allowed',
          },
        ],
      };
      const rules = buildValidationRules(config, {});
      expect(rules.validate).toBeDefined();
      expect(typeof (rules.validate as Record<string, unknown>)['noSpaces']).toBe('function');
    });

    it('excludes custom rule when constraint fails', () => {
      const config: ValidationConfig = {
        custom: [
          {
            key: 'specialCheck',
            value: () => true,
            constraints: { field: 'mode', operator: 'EQ', value: 'strict' },
          },
        ],
      };
      const rules = buildValidationRules(config, { mode: 'relaxed' });
      expect(rules.validate).toBeUndefined();
    });
  });
});
