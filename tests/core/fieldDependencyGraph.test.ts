import { describe, it, expect } from 'vitest';
import { extractDependencies } from '../../src/core/fieldDependencyGraph';
import type { FieldConstraint } from '../../src/types/constraint.types';

describe('extractDependencies', () => {
  it('returns empty array for undefined', () => {
    expect(extractDependencies(undefined)).toEqual([]);
  });

  it('extracts field from a leaf node', () => {
    const c: FieldConstraint = { field: 'status', operator: 'EQ', value: 'active' };
    expect(extractDependencies(c)).toEqual(['status']);
  });

  it('extracts both field and targetField from a leaf', () => {
    const c: FieldConstraint = { field: 'price', operator: 'GT', targetField: 'minPrice' };
    const deps = extractDependencies(c);
    expect(deps).toContain('price');
    expect(deps).toContain('minPrice');
    expect(deps).toHaveLength(2);
  });

  it('extracts fields from $and', () => {
    const c: FieldConstraint = {
      $and: [
        { field: 'a', operator: 'EQ', value: 1 },
        { field: 'b', operator: 'EQ', value: 2 },
      ],
    };
    const deps = extractDependencies(c);
    expect(deps).toContain('a');
    expect(deps).toContain('b');
  });

  it('extracts fields from $or', () => {
    const c: FieldConstraint = {
      $or: [
        { field: 'x', operator: 'EQ', value: 1 },
        { field: 'y', operator: 'EQ', value: 2 },
      ],
    };
    expect(extractDependencies(c)).toContain('x');
    expect(extractDependencies(c)).toContain('y');
  });

  it('extracts fields from $not', () => {
    const c: FieldConstraint = { $not: { field: 'flag', operator: 'EQ', value: true } };
    expect(extractDependencies(c)).toEqual(['flag']);
  });

  it('deduplicates fields referenced multiple times', () => {
    const c: FieldConstraint = {
      $and: [
        { field: 'status', operator: 'EQ', value: 'a' },
        { field: 'status', operator: 'NEQ', value: 'b' },
      ],
    };
    expect(extractDependencies(c)).toEqual(['status']);
  });

  it('handles deeply nested constraints', () => {
    const c: FieldConstraint = {
      $and: [
        { $or: [{ field: 'a', operator: 'EQ', value: 1 }, { field: 'b', operator: 'EQ', value: 2 }] },
        { $not: { field: 'c', operator: 'EMPTY' } },
      ],
    };
    const deps = extractDependencies(c);
    expect(deps).toContain('a');
    expect(deps).toContain('b');
    expect(deps).toContain('c');
    expect(deps).toHaveLength(3);
  });
});
