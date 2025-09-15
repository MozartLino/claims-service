export type DomainErrorCode =
  | 'ENTITY_NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INVARIANT_VIOLATION'
  | 'CONFLICT'
  | 'PERMISSION_DENIED'
  | 'INFRA_ERROR'
  | 'UNKNOWN_ERROR';

export type DomainErrorDetails = Record<string, unknown>;
