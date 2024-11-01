export type ComplianceResult = 'approved' | 'rejected';

export interface TransactionComplianceDetails {
  transactionId: string;
  accountId: string;
  amount: number;
  currency: string;
  transactionType: 'debit' | 'credit';
  fraudCheckStatus?: ComplianceResult;
  metadata?: {
    location?: string;
    timezone?: string;
  };
}
