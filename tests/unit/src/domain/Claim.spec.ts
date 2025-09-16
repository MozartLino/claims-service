import { Claim } from '../../../../src/domain/models/Claim';
import { ValidationError } from '../../../../src/domain/errors';

describe('Claim', () => {
  const validProps = {
    id: 'clm-1',
    memberId: 'mbr-1',
    provider: 'Test Provider',
    serviceDate: new Date('2025-01-01'),
    totalAmount: 1000,
    diagnosisCodes: ['R51'],
  };

  it('should create a valid Claim instance', () => {
    const claim = Claim.create(validProps);
    expect(claim.id).toBe(validProps.id);
    expect(claim.memberId).toBe(validProps.memberId);
    expect(claim.provider).toBe(validProps.provider);
    expect(claim.serviceDate).toBeInstanceOf(Date);
    expect(claim.totalAmount).toBe(1000);
    expect(claim.diagnosisCodes).toEqual(['R51']);
  });

  it('should throw if claimId is missing', () => {
    expect(() => Claim.create({ ...validProps, id: '' })).toThrow(ValidationError);
  });

  it('should throw if memberId is missing', () => {
    expect(() => Claim.create({ ...validProps, memberId: '' })).toThrow(ValidationError);
  });

  it('should throw if provider is missing', () => {
    expect(() => Claim.create({ ...validProps, provider: '' })).toThrow(ValidationError);
  });

  it('should throw if totalAmount is missing', () => {
    expect(() => Claim.create({ ...validProps, totalAmount: undefined as any })).toThrow(ValidationError);
  });

  it('should throw if serviceDate is missing', () => {
    expect(() => Claim.create({ ...validProps, serviceDate: undefined as any })).toThrow(ValidationError);
  });

  it('should throw if serviceDate is invalid', () => {
    expect(() => Claim.create({ ...validProps, serviceDate: new Date('invalid') })).toThrow(ValidationError);
  });

  it('should throw if serviceDate is in the future', () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
    expect(() => Claim.create({ ...validProps, serviceDate: futureDate })).toThrow(ValidationError);
  });

  it('should throw if totalAmount is not an integer', () => {
    expect(() => Claim.create({ ...validProps, totalAmount: 100.5 as any })).toThrow(ValidationError);
  });

  it('should throw if totalAmount is negative', () => {
    expect(() => Claim.create({ ...validProps, totalAmount: -1000 })).toThrow(ValidationError);
  });

  it('should throw if diagnosisCodes is not an array', () => {
    expect(() => Claim.create({ ...validProps, diagnosisCodes: 'R51' as any })).toThrow(ValidationError);
  });

  describe('fromCsvRow', () => {
    it('should create a Claim from valid CSV row', () => {
      const row = {
        claimId: 'clm-100',
        memberId: 'mbr-100',
        provider: 'Clinic Test',
        serviceDate: '2025-01-10',
        totalAmount: '2500',
        diagnosisCodes: 'R51;M54.5',
      };

      const claim = Claim.fromCsvRow(row);

      expect(claim.id).toBe('clm-100');
      expect(claim.totalAmount).toBe(2500);
      expect(claim.diagnosisCodes).toEqual(['R51', 'M54.5']);
    });

    it('should throw ValidationError if serviceDate is invalid', () => {
      const row = {
        claimId: 'clm-101',
        memberId: 'mbr-101',
        provider: 'Clinic Test',
        serviceDate: 'invalid-date',
        totalAmount: '3000',
        diagnosisCodes: '',
      };

      expect(() => Claim.fromCsvRow(row)).toThrow(ValidationError);
    });

    it('should throw ValidationError if totalAmount is not a valid integer', () => {
      const row = {
        claimId: 'clm-102',
        memberId: 'mbr-102',
        provider: 'Clinic Test',
        serviceDate: '2025-01-12',
        totalAmount: 'not-a-number',
        diagnosisCodes: '',
      };

      expect(() => Claim.fromCsvRow(row)).toThrow(ValidationError);
    });

    it('should allow empty diagnosisCodes', () => {
      const row = {
        claimId: 'clm-103',
        memberId: 'mbr-103',
        provider: 'Clinic Test',
        serviceDate: '2025-01-15',
        totalAmount: '4000',
        diagnosisCodes: '',
      };

      const claim = Claim.fromCsvRow(row);
      expect(claim.diagnosisCodes).toBeUndefined();
    });
  });

  it('should serialize to JSON correctly', () => {
    const claim = Claim.create(validProps);
    const json = claim.toJson();

    expect(json.claimId).toBe('clm-1');
    expect(json.memberId).toBe('mbr-1');
    expect(json.provider).toBe('Test Provider');
    expect(json.totalAmount).toBe(1000);
    expect(json.diagnosisCodes).toEqual(['R51']);
    expect(json.serviceDate).toMatch(/2025-01-01/);
  });
});
