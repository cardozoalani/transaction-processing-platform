import {
  TransactionType,
  TransactionStatus,
  FraudCheckStatus,
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  FRAUD_CHECK_STATUSES,
} from '../transaction.types';

describe('Transaction Types', () => {
  it('should have valid transaction types', () => {
    const validTypes: TransactionType[] = ['debit', 'credit'];
    expect(TRANSACTION_TYPES).toEqual(validTypes);
  });

  it('should have valid transaction statuses', () => {
    const validStatuses: TransactionStatus[] = [
      'pending',
      'completed',
      'failed',
    ];
    expect(TRANSACTION_STATUSES).toEqual(validStatuses);
  });

  it('should have valid fraud check statuses', () => {
    const validFraudStatuses: FraudCheckStatus[] = [
      'approved',
      'rejected',
      'pending',
    ];
    expect(FRAUD_CHECK_STATUSES).toEqual(validFraudStatuses);
  });
});
