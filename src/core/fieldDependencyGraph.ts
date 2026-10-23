import type { FieldConstraint, FieldComparisonCriteria } from '../types/constraint.types';

function collect(constraint: FieldConstraint, acc: Set<string>): void {
  if ('$and' in constraint) {
    constraint.$and.forEach((c) => collect(c, acc));
  } else if ('$or' in constraint) {
    constraint.$or.forEach((c) => collect(c, acc));
  } else if ('$not' in constraint) {
    collect(constraint.$not, acc);
  } else {
    const leaf = constraint as FieldComparisonCriteria;
    acc.add(leaf.field);
    if (leaf.targetField !== undefined) {
      acc.add(leaf.targetField);
    }
  }
}

export function extractDependencies(constraint?: FieldConstraint): string[] {
  if (!constraint) return [];
  const acc = new Set<string>();
  collect(constraint, acc);
  return Array.from(acc);
}
