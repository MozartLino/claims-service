import { DomainError } from './DomainError';

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string | number) {
    super(`${entity} with id ${id} not found`, 'ENTITY_NOT_FOUND', { entity, id });
  }
}
