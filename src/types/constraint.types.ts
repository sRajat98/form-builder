export type Operator =
  | 'EQ'
  | 'NEQ'
  | 'GT'
  | 'GTE'
  | 'LT'
  | 'LTE'
  | 'INC'
  | 'NINC'
  | 'EMPTY'
  | 'NOT_EMPTY';

export type FieldComparisonCriteria = {
  field: string;
  operator: Operator;
  value?: unknown;
  targetField?: string;
};

export type FieldConstraint =
  | FieldComparisonCriteria
  | { $and: FieldConstraint[] }
  | { $or: FieldConstraint[] }
  | { $not: FieldConstraint };
