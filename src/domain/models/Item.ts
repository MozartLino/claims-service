import { ValidationError } from '../errors/ValidationError';
import { ItemPrimitives, ItemProps } from './types';

export class Item {
  private readonly idValue: string;
  private readonly nameValue: string;
  private readonly createdAtValue: Date;
  readonly version: number;

  private constructor(props: ItemProps) {
    this.idValue = props.id;
    this.nameValue = props.name;
    this.createdAtValue = props.createdAt;
    this.version = props.version ?? 0;
  }

  public static create(props: ItemProps): Item {
    if (!props.id) {
      throw ValidationError.forField('id', 'Item must have an id');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw ValidationError.forField('name', 'Item must have a non-empty name');
    }
    if (!(props.createdAt instanceof Date) || isNaN(props.createdAt.getTime())) {
      throw ValidationError.forField('createAt', 'Item createdAt must be a valid date');
    }
    const n = Number(props.version ?? 0);
    if (!Number.isInteger(n) || n < 0) {
      throw ValidationError.forField('version', 'Item version must be a non-negative integer');
    }

    return new Item(props);
  }

  public static restore(primitives: ItemPrimitives): Item {
    return Item.create({
      id: primitives.id,
      name: primitives.name,
      createdAt: new Date(primitives.createdAt),
      version: primitives.version,
    });
  }

  public rename(name: string): Item {
    return Item.create({
      name,
      id: this.id,
      createdAt: this.createdAt,
      version: this.version,
    });
  }

  public get id(): string {
    return this.idValue;
  }

  public get name(): string {
    return this.nameValue;
  }

  public get createdAt(): Date {
    return this.createdAtValue;
  }
}
