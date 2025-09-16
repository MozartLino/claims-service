export interface ClaimApplicationModel {
  id: string;
  memberId: string;
  provider: string;
  serviceDate: Date;
  totalAmount: number;
  diagnosisCodes?: string[];
}

export interface RecordError {
  row: number;
  message: string;
}

export type ProcessRecordResult = { ok: true } | ({ ok: false } & RecordError);

export interface ProcessClaimsResult {
  successCount: number;
  errorCount: number;
  errors: RecordError[];
}

export interface ClaimQueryApplicationFilters {
  memberId: string;
  startDate: string;
  endDate: string;
}
