import { DomainError } from '../../../../domain/errors/DomainError';
import { mapDomainErrorToHttpError } from './mapDomainErrorToHttpError';
import { internalError } from '../../../utils/errors/responseError';

export function handleError(error: unknown, reason = 'Internal Server Error'): never {
  if (error instanceof DomainError) {
    throw mapDomainErrorToHttpError(error);
  }

  throw internalError({ reason });
}
