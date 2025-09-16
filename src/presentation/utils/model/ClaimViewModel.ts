import { Claim } from '../../../domain';

export class ClaimViewModel {
  static fromDomain(claim: Claim) {
    return {
      claimId: claim.id,
      memberId: claim.memberId,
      provider: claim.provider,
      serviceDate: claim.serviceDate.toISOString(),
      serviceDateEST: new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(claim.serviceDate),
      totalAmount: claim.totalAmount,
      formattedTotalAmount: (claim.totalAmount / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      }),
      diagnosisCodes: claim.diagnosisCodes,
    };
  }
}
