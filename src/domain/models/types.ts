export interface ClaimPrimitives {
  claimId: string;
  memberId: string;
  provider: string;
  serviceDate: string;
  totalAmount: string;
  diagnosisCodes?: string;
}

export interface ClaimProps {
  id: string;
  memberId: string;
  provider: string;
  serviceDate: Date;
  totalAmount: number;
  diagnosisCodes?: string[];
}
