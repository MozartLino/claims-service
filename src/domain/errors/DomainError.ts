import { DomainErrorCode, DomainErrorDetails } from './types';

export class DomainError extends Error {
  public readonly code: DomainErrorCode;
  public readonly details?: DomainErrorDetails;
  public readonly isDomainError = true as const;

  constructor(message: string, code: DomainErrorCode, details?: DomainErrorDetails) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.details = details;
  }
}
