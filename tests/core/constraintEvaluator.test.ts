import { describe, it, expect } from 'vitest';
import { evaluateConstraint } from '../../src/core/constraintEvaluator';
import type { FieldConstraint } from '../../src/types/constraint.types';

describe('evaluateConstraint', () => {
  describe('EQ', () => {
    it('returns true when field equals value', () => {
      expect(evaluateConstraint({ field: 'x', operator: 'EQ', value: 'foo' }, { x: 'foo' })).toBe(true);
    });
    it('returns false when field does not equal value', () => {
      expect(evaluateConstraint({ field: 'x', operator: 'EQ', value: 'foo' }, { x: 'bar' })).toBe(false);
    });
    it('returns false when field is undefined', () => {
      expect(evaluateConstraint({ field: 'x', operator: 'EQ', value: 'foo' }, {})).toBe(false);
    });
  });

  describe('NEQ', () => {
    it('returns true when field differs from value', () => {
      expect(evaluateConstraint({ field: 'x', operator: 'NEQ', value: 'a' }, { x: 'b' })).toBe(true);
    });
    it('returns false when field equals value', () => {
      expect(evaluateConstraint({ field: 'x', operator: 'NEQ', value: 'a' }, { x: 'a' })).toBe(false);
    });
    it('returns true when field is undefined and value is not', () => {
      expect(evaluateConstraint({ field: 'x', operator: 'NEQ', value: 'a' }, {})).toBe(true);
    });
  });

  describe('GT / GTE / LT / LTE', () => {
    it('GT: 5 > 3', () => {
      expect(evaluateConstraint({ field: 'n', operator: 'GT', value: 3 }, { n: 5 })).toBe(true);
    });
    it('GT: 3 > 5 is false', () => {
      expect(evaluateConstraint({ field: 'n', operator: 'GT', value: 5 }, { n: 3 })).toBe(false);
    });
    it('GTE: 5 >= 5', () => {
      expect(evaluateConstraint({ field: 'n', operator: 'GTE', value: 5 }, { n: 5 })).toBe(true);
    });
    it('LT: 2 < 4', () => {
      expect(evaluateConstraint({ field: 'n', operator: 'LT', value: 4 }, { n: 2 })).toBe(true);
    });
    it('LTE: 4 <= 4', () => {
      expect(evaluateConstraint({ field: 'n', operator: 'LTE', value: 4 }, { n: 4 })).toBe(true);
    });
    it('GT with string coercion: "10" > 5', () => {
      expect(evaluateConstraint({ field: 'n', operator: 'GT', value: 5 }, { n: '10' })).toBe(true);
    });
    it('GT returns false when field is undefined', () => {
      expect(evaluateConstraint({ field: 'n', operator: 'GT', value: 5 }, {})).toBe(false);
    });
    it('GT returns false when field is non-numeric string', () => {
      expect(evaluateConstraint({ field: 'n', operator: 'GT', value: 5 }, { n: 'abc' })).toBe(false);
    });
  });

  describe('INC / NINC', () => {
    it('INC: array includes value', () => {
      expect(evaluateConstraint({ field: 'tags', operator: 'INC', value: 'a' }, { tags: ['a', 'b'] })).toBe(true);
    });
    it('INC: array does not include value', () => {
      expect(evaluateConstraint({ field: 'tags', operator: 'INC', value: 'c' }, { tags: ['a', 'b'] })).toBe(false);
    });
    it('INC: non-array field returns false', () => {
      expect(evaluateConstraint({ field: 'tags', operator: 'INC', value: 'a' }, { tags: 'a' })).toBe(false);
    });
    it('NINC: value not in array', () => {
      expect(evaluateConstraint({ field: 'tags', operator: 'NINC', value: 'c' }, { tags: ['a', 'b'] })).toBe(true);
    });
    it('NINC: non-array field returns false', () => {
      expect(evaluateConstraint({ field: 'tags', operator: 'NINC', value: 'a' }, { tags: 'a' })).toBe(false);
    });
  });

  describe('EMPTY / NOT_EMPTY', () => {
    it('EMPTY: undefined is empty', () => {
      expect(evaluateConstraint({ field: 'x', operator: 'EMPTY' }, {})).toBe(true);
    });
    it('EMPTY: null is empty', () => {
      expect(evaluateConstraint({ field: 'x', operator: 'EMPTY' }, { x: null })).toBe(true);
    });
    it('EMPTY: empty string is empty', () => {
      expect(evaluateConstraint({ field: 'x', operator: 'EMPTY' }, { x: '' })).toBe(true);
    });
    it('EMPTY: empty array is empty', () => {
      expect(evaluateConstraint({ field: 'x', operator: 'EMPTY' }, { x: [] })).toBe(true);
    });
    it('EMPTY: non-empty string is not empty', () => {
      expect(evaluateConstraint({ field: 'x', operator: 'EMPTY' }, { x: 'hi' })).toBe(false);
    });
    it('NOT_EMPTY: non-empty string passes', () => {
      expect(evaluateConstraint({ field: 'x', operator: 'NOT_EMPTY' }, { x: 'hi' })).toBe(true);
    });
    it('NOT_EMPTY: undefined fails', () => {
      expect(evaluateConstraint({ field: 'x', operator: 'NOT_EMPTY' }, {})).toBe(false);
    });
  });

  describe('targetField (field vs field)', () => {
    it('EQ: two fields with same value', () => {
      expect(
        evaluateConstraint(
          { field: 'a', operator: 'EQ', targetField: 'b' },
          { a: 'hello', b: 'hello' }
        )
      ).toBe(true);
    });
    it('NEQ: two fields with different values', () => {
      expect(
        evaluateConstraint(
          { field: 'a', operator: 'NEQ', targetField: 'b' },
          { a: 'hello', b: 'world' }
        )
      ).toBe(true);
    });
    it('GT: field greater than targetField', () => {
      expect(
        evaluateConstraint(
          { field: 'price', operator: 'GT', targetField: 'minPrice' },
          { price: 10, minPrice: 5 }
        )
      ).toBe(true);
    });
  });

  describe('$and / $or / $not', () => {
    it('$and: both true', () => {
      const c: FieldConstraint = {
        $and: [
          { field: 'a', operator: 'EQ', value: 1 },
          { field: 'b', operator: 'EQ', value: 2 },
        ],
      };
      expect(evaluateConstraint(c, { a: 1, b: 2 })).toBe(true);
    });
    it('$and: one false makes it false', () => {
      const c: FieldConstraint = {
        $and: [
          { field: 'a', operator: 'EQ', value: 1 },
          { field: 'b', operator: 'EQ', value: 2 },
        ],
      };
      expect(evaluateConstraint(c, { a: 1, b: 3 })).toBe(false);
    });
    it('$or: at least one true', () => {
      const c: FieldConstraint = {
        $or: [
          { field: 'a', operator: 'EQ', value: 1 },
          { field: 'b', operator: 'EQ', value: 2 },
        ],
      };
      expect(evaluateConstraint(c, { a: 99, b: 2 })).toBe(true);
    });
    it('$or: all false is false', () => {
      const c: FieldConstraint = {
        $or: [
          { field: 'a', operator: 'EQ', value: 1 },
          { field: 'b', operator: 'EQ', value: 2 },
        ],
      };
      expect(evaluateConstraint(c, { a: 99, b: 99 })).toBe(false);
    });
    it('$not: inverts a true constraint', () => {
      const c: FieldConstraint = { $not: { field: 'a', operator: 'EQ', value: 1 } };
      expect(evaluateConstraint(c, { a: 1 })).toBe(false);
    });
    it('$not: inverts a false constraint', () => {
      const c: FieldConstraint = { $not: { field: 'a', operator: 'EQ', value: 1 } };
      expect(evaluateConstraint(c, { a: 99 })).toBe(true);
    });
    it('deep nesting: $and inside $or inside $and', () => {
      const c: FieldConstraint = {
        $and: [
          {
            $or: [
              {
                $and: [
                  { field: 'x', operator: 'GT', value: 0 },
                  { field: 'y', operator: 'LT', value: 10 },
                ],
              },
              { field: 'z', operator: 'EQ', value: 'bypass' },
            ],
          },
          { field: 'active', operator: 'EQ', value: true },
        ],
      };
      expect(evaluateConstraint(c, { x: 1, y: 5, active: true })).toBe(true);
      expect(evaluateConstraint(c, { z: 'bypass', active: true })).toBe(true);
      expect(evaluateConstraint(c, { x: 1, y: 5, active: false })).toBe(false);
    });
    it('$not wrapping $and', () => {
      const c: FieldConstraint = {
        $not: {
          $and: [
            { field: 'a', operator: 'EQ', value: 1 },
            { field: 'b', operator: 'EQ', value: 2 },
          ],
        },
      };
      expect(evaluateConstraint(c, { a: 1, b: 2 })).toBe(false);
      expect(evaluateConstraint(c, { a: 1, b: 99 })).toBe(true);
    });
  });
});
