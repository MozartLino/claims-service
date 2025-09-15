import { Item } from '../../../../src/domain';
import { ValidationError } from '../../../../src/domain/errors';

describe('Item', () => {
  const validProps = {
    id: 'item-1',
    name: 'Test Item',
    createdAt: new Date(),
    version: 0,
  };

  it('should create a valid Item instance', () => {
    const item = Item.create(validProps);
    expect(item.id).toBe(validProps.id);
    expect(item.name).toBe(validProps.name);
    expect(item.createdAt).toBeInstanceOf(Date);
    expect(item.version).toBe(0);
  });

  it('should throw if id is missing', () => {
    expect(() => Item.create({ ...validProps, id: '' })).toThrow(ValidationError);
  });

  it('should throw if name is empty', () => {
    expect(() => Item.create({ ...validProps, name: '' })).toThrow(ValidationError);
  });

  it('should throw if createdAt is invalid', () => {
    expect(() => Item.create({ ...validProps, createdAt: new Date('invalid') })).toThrow(ValidationError);
  });

  it('should throw if version is negative', () => {
    expect(() => Item.create({ ...validProps, version: -1 })).toThrow(ValidationError);
  });

  it('should restore an Item from primitives', () => {
    const now = new Date();
    const item = Item.restore({
      id: 'restored-id',
      name: 'Restored Name',
      createdAt: now.toISOString(),
      version: 3,
    });

    expect(item.id).toBe('restored-id');
    expect(item.name).toBe('Restored Name');
    expect(item.createdAt.toISOString()).toBe(now.toISOString());
    expect(item.version).toBe(3);
  });

  it('should return a renamed item with the same id and createdAt', () => {
    const item = Item.create(validProps);
    const renamed = item.rename('New Name');

    expect(renamed.name).toBe('New Name');
    expect(renamed.id).toBe(item.id);
    expect(renamed.createdAt.toISOString()).toBe(item.createdAt.toISOString());
    expect(renamed.version).toBe(item.version);
  });
});
