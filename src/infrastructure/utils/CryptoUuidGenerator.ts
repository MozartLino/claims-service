/* istanbul ignore file */
import { randomUUID } from 'crypto';
import { IdGenerator } from '../../domain/services/IdGenerator';

export class CryptoUuidGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
}
