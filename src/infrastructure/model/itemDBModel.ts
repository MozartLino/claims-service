export type ClaimDBModel = {
  claimId: string;
  memberId: string;
  provider: string;
  serviceDate: string;
  totalAmount: number;
  diagnosisCodes?: string[];
};
