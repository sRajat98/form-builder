import type { FieldConstraint, FieldComparisonCriteria, Operator } from '../types/constraint.types';

function toNumber(v: unknown): number {
  if (typeof v === 'number') return v;
  const n = Number(v);
  return isNaN(n) ? NaN : n;
}

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined || v === '') return true;
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function evaluateLeaf(
  criteria: FieldComparisonCriteria,
  values: Record<string, unknown>
): boolean {
  const fieldValue = values[criteria.field];
  const compareValue =
    criteria.targetField !== undefined
      ? values[criteria.targetField]
      : criteria.value;

  const op: Operator = criteria.operator;

  switch (op) {
    case 'EQ':
      return fieldValue === compareValue;
    case 'NEQ':
      return fieldValue !== compareValue;
    case 'GT': {
      const a = toNumber(fieldValue);
      const b = toNumber(compareValue);
      return !isNaN(a) && !isNaN(b) && a > b;
    }
    case 'GTE': {
      const a = toNumber(fieldValue);
      const b = toNumber(compareValue);
      return !isNaN(a) && !isNaN(b) && a >= b;
    }
    case 'LT': {
      const a = toNumber(fieldValue);
      const b = toNumber(compareValue);
      return !isNaN(a) && !isNaN(b) && a < b;
    }
    case 'LTE': {
      const a = toNumber(fieldValue);
      const b = toNumber(compareValue);
      return !isNaN(a) && !isNaN(b) && a <= b;
    }
    case 'INC': {
      if (!Array.isArray(fieldValue)) return false;
      return fieldValue.includes(compareValue);
    }
    case 'NINC': {
      if (!Array.isArray(fieldValue)) return false;
      return !fieldValue.includes(compareValue);
    }
    case 'EMPTY':
      return isEmpty(fieldValue);
    case 'NOT_EMPTY':
      return !isEmpty(fieldValue);
    default:
      return false;
  }
}

export function evaluateConstraint(
  constraint: FieldConstraint,
  values: Record<string, unknown>
): boolean {
  if ('$and' in constraint) {
    return constraint.$and.every((c) => evaluateConstraint(c, values));
  }
  if ('$or' in constraint) {
    return constraint.$or.some((c) => evaluateConstraint(c, values));
  }
  if ('$not' in constraint) {
    return !evaluateConstraint(constraint.$not, values);
  }
  return evaluateLeaf(constraint as FieldComparisonCriteria, values);
}
