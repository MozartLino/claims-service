import createHttpError from 'http-errors';
import { InfraError, NotFoundError, ValidationError } from '../../../../domain/errors';
import { DomainError } from '../../../../domain/errors/DomainError';

type DomainHttpErrorDefinition = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sourceError: new (...args: any[]) => DomainError;
  factory: (msg: string) => Error;
};

const domainHttpErrorMappings: DomainHttpErrorDefinition[] = [
  {
    sourceError: NotFoundError,
    factory: (msg) => createHttpError.NotFound(msg),
  },
  {
    sourceError: ValidationError,
    factory: (msg) => createHttpError.BadRequest(msg),
  },
  {
    sourceError: InfraError,
    factory: (msg) => createHttpError.InternalServerError(msg),
  },
];

export const mapDomainErrorToHttpError = (error: unknown): Error => {
  if (error instanceof DomainError) {
    const mapping = domainHttpErrorMappings.find(({ sourceError }) => error instanceof sourceError);

    if (mapping) {
      return mapping.factory(error.message);
    }

    return error;
  }

  return new createHttpError.InternalServerError('Unexpected error');
};
