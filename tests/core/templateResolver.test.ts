import { describe, it, expect } from 'vitest';
import { resolveTemplate, extractTemplateFields } from '../../src/core/templateResolver';

describe('resolveTemplate', () => {
  it('replaces a simple variable', () => {
    expect(resolveTemplate('Hello {{name}}!', { name: 'World' })).toBe('Hello World!');
  });

  it('replaces multiple variables', () => {
    expect(resolveTemplate('{{first}} {{last}}', { first: 'John', last: 'Doe' })).toBe('John Doe');
  });

  it('leaves placeholder if field is undefined', () => {
    expect(resolveTemplate('Hello {{name}}!', {})).toBe('Hello {{name}}!');
  });

  it('handles no template vars (plain string passthrough)', () => {
    expect(resolveTemplate('No vars here', { x: 1 })).toBe('No vars here');
  });

  describe('built-in formatters', () => {
    it('uppercase', () => {
      expect(resolveTemplate('{{name,uppercase}}', { name: 'hello' })).toBe('HELLO');
    });

    it('lowercase', () => {
      expect(resolveTemplate('{{name,lowercase}}', { name: 'HELLO' })).toBe('hello');
    });

    it('number with decimal pattern', () => {
      expect(resolveTemplate('{{val,number::2}}', { val: 3.14159 })).toBe('3.14');
    });

    it('number without pattern uses locale string', () => {
      const result = resolveTemplate('{{val,number}}', { val: 1000 });
      expect(result).toBeTruthy();
    });

    it('date with pattern', () => {
      expect(resolveTemplate('{{d,date::YYYY-MM-DD}}', { d: '2024-06-15' })).toBe('2024-06-15');
    });

    it('leaves placeholder when formatter field is undefined', () => {
      expect(resolveTemplate('{{name,uppercase}}', {})).toBe('{{name,uppercase}}');
    });
  });

  describe('custom formatters', () => {
    it('uses custom formatter', () => {
      const result = resolveTemplate(
        '{{val,currency::USD}}',
        { val: 42 },
        { currency: (v, pattern) => `${pattern} ${v}` }
      );
      expect(result).toBe('USD 42');
    });

    it('custom formatter overrides built-in with same name', () => {
      const result = resolveTemplate(
        '{{val,uppercase}}',
        { val: 'hello' },
        { uppercase: () => 'CUSTOM' }
      );
      expect(result).toBe('CUSTOM');
    });
  });
});

describe('extractTemplateFields', () => {
  it('extracts a single field', () => {
    expect(extractTemplateFields('Hello {{name}}')).toEqual(['name']);
  });

  it('extracts multiple fields', () => {
    expect(extractTemplateFields('{{a}} {{b}}')).toEqual(['a', 'b']);
  });

  it('deduplicates', () => {
    expect(extractTemplateFields('{{x}} and {{x}}')).toEqual(['x']);
  });

  it('extracts field from formatted var', () => {
    expect(extractTemplateFields('{{amount,number::2}}')).toEqual(['amount']);
  });

  it('returns empty for no vars', () => {
    expect(extractTemplateFields('plain text')).toEqual([]);
  });
});
