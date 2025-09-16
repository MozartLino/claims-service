import { ValidationError } from '../errors';
import { ClaimPrimitives, ClaimProps } from './types';

export class Claim {
  private readonly idValue: string;
  private readonly memberIdValue: string;
  private readonly providerValue: string;
  private readonly serviceDateValue: Date;
  private readonly totalAmountValue: number;
  private readonly diagnosisCodesValue?: string[];

  private constructor(props: ClaimProps) {
    this.idValue = props.id;
    this.memberIdValue = props.memberId;
    this.providerValue = props.provider;
    this.serviceDateValue = props.serviceDate;
    this.totalAmountValue = props.totalAmount;
    this.diagnosisCodesValue = props.diagnosisCodes;
  }

  public static create(props: ClaimProps): Claim {
    if (!props.id) {
      throw ValidationError.forField('claimId', 'Missing claimId');
    }
    if (!props.memberId) {
      throw ValidationError.forField('memberId', 'Missing memberId');
    }
    if (!props.provider) {
      throw ValidationError.forField('provider', 'Missing provider');
    }
    if (!props.totalAmount && props.totalAmount !== 0) {
      throw ValidationError.forField('totalAmount', 'Missing totalAmount');
    }
    if (!props.serviceDate) {
      throw ValidationError.forField('serviceDate', 'Missing serviceDate');
    }
    if (!(props.serviceDate instanceof Date) || isNaN(props.serviceDate.getTime())) {
      throw ValidationError.forField('serviceDate', 'Invalid date format');
    }
    if (props.serviceDate > new Date()) {
      throw ValidationError.forField('serviceDate', 'serviceDate cannot be in the future');
    }
    if (!Number.isInteger(props.totalAmount) || props.totalAmount < 0) {
      throw ValidationError.forField('totalAmount', 'Invalid totalAmount (must be a non-negative integer)');
    }
    if (props.diagnosisCodes && !Array.isArray(props.diagnosisCodes)) {
      throw ValidationError.forField('diagnosisCodes', 'Invalid format for diagnosisCodes');
    }

    return new Claim(props);
  }

  public static fromCsvRow(row: ClaimPrimitives): Claim {
    const diagnosisCodesArray = row.diagnosisCodes ? row.diagnosisCodes.split(';') : undefined;

    const serviceDate = new Date(row.serviceDate);

    const totalAmount = parseInt(row.totalAmount, 10);

    return Claim.create({
      id: row.claimId,
      memberId: row.memberId,
      provider: row.provider,
      serviceDate: serviceDate,
      totalAmount: totalAmount,
      diagnosisCodes: diagnosisCodesArray,
    });
  }

  public get id(): string {
    return this.idValue;
  }
  public get memberId(): string {
    return this.memberIdValue;
  }
  public get provider(): string {
    return this.providerValue;
  }
  public get serviceDate(): Date {
    return this.serviceDateValue;
  }
  public get totalAmount(): number {
    return this.totalAmountValue;
  }
  public get diagnosisCodes(): string[] | undefined {
    return this.diagnosisCodesValue;
  }

  public toJson() {
    return {
      claimId: this.idValue,
      memberId: this.memberIdValue,
      provider: this.providerValue,
      serviceDate: this.serviceDateValue.toISOString(),
      totalAmount: this.totalAmountValue,
      diagnosisCodes: this.diagnosisCodesValue,
    };
  }

  // Note: this is where I would place business rules if needed
  // Example: a method to calculate the total amount with a discount
  // public calculateDiscountedTotal(discount: number): number { ... }
}
