import { DomainError } from './DomainError';

export class ConflictError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFLICT', details);
  }

  static versionMismatch() {
    return new ConflictError('Write conflict (version mismatch)', { reason: 'VERSION_MISMATCH' });
  }
}
