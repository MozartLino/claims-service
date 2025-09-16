import createHttpError from 'http-errors';
import { InfraError, NotFoundError, ValidationError, DomainError } from '../../../../../../src/domain/errors';
import { mapDomainErrorToHttpError } from '../../../../../../src/presentation/handlers/http/utils/mapDomainErrorToHttpError';

describe('mapDomainErrorToHttpError', () => {
  it('should map NotFoundError to HTTP 404', () => {
    const err = new NotFoundError('not found', 'item');
    const result = mapDomainErrorToHttpError(err);
    expect(result).toBeInstanceOf(createHttpError.NotFound);
    expect(result.message).toBe('not found with id item not found');
  });

  it('should map ValidationError to HTTP 400', () => {
    const err = new ValidationError('invalid', { field: 'name' });
    const result = mapDomainErrorToHttpError(err);
    expect(result).toBeInstanceOf(createHttpError.BadRequest);
    expect(result.message).toBe('invalid');
  });

  it('should map InfraError to HTTP 500', () => {
    const err = new InfraError('infra issue');
    const result = mapDomainErrorToHttpError(err);
    expect(result).toBeInstanceOf(createHttpError.InternalServerError);
    expect(result.message).toBe('infra issue');
  });

  it('should return the original error if DomainError is not mapped', () => {
    class CustomDomainError extends DomainError {
      constructor() {
        super('custom', 'UNKNOWN_ERROR');
      }
    }

    const err = new CustomDomainError();
    const result = mapDomainErrorToHttpError(err);
    expect(result).toBe(err);
  });

  it('should map unknown errors to generic InternalServerError', () => {
    const err = new Error('random failure');
    const result = mapDomainErrorToHttpError(err);
    expect(result).toBeInstanceOf(createHttpError.InternalServerError);
    expect(result.message).toBe('Unexpected error');
  });
});
