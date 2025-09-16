import { formatCurrency } from '../../../../../src/presentation/utils/formatCurrency';

describe('formatCurrency', () => {
  it('should format positive cents as USD currency', () => {
    expect(formatCurrency(12500)).toBe('$125.00');
    expect(formatCurrency(999)).toBe('$9.99');
  });

  it('should format zero as $0.00', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format large amounts correctly', () => {
    expect(formatCurrency(123456789)).toBe('$1,234,567.89');
  });

  it('should format negative amounts with minus sign', () => {
    expect(formatCurrency(-5000)).toBe('-$50.00');
  });
});
