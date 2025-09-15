import { DomainError } from './DomainError';

export class InfraError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'INFRA_ERROR', details);
  }
}
