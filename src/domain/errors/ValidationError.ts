import { DomainError } from './DomainError';

export class ValidationError extends DomainError {
  constructor(message: string, details: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
  }

  static forField(field: string, message: string) {
    return new ValidationError(message, { field });
  }
}
