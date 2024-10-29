export type TransactionType = 'debit' | 'credit';
export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type FraudCheckStatus = 'pass' | 'fail' | 'pending';

export const TRANSACTION_TYPES: TransactionType[] = ['debit', 'credit'];
export const TRANSACTION_STATUSES: TransactionStatus[] = [
  'pending',
  'completed',
  'failed',
];
export const FRAUD_CHECK_STATUSES: FraudCheckStatus[] = [
  'pass',
  'fail',
  'pending',
];
