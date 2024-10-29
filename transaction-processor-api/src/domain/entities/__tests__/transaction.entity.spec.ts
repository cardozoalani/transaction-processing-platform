import { Transaction } from '../transaction.entity';

describe('Transaction Entity', () => {
  it('should create a transaction with default values', () => {
    const transaction = new Transaction(
      'tx123',
      'acc456',
      100,
      'USD',
      'debit',
      'pending',
    );
    expect(transaction.transactionId).toBe('tx123');
    expect(transaction.status).toBe('pending');
    expect(transaction.fraudCheckStatus).toBe('pending');
    expect(transaction.attempts).toBe(0);
  });

  it('should update the status of the transaction', () => {
    const transaction = new Transaction(
      'tx123',
      'acc456',
      100,
      'USD',
      'debit',
      'pending',
    );
    transaction.updateStatus('completed');
    expect(transaction.status).toBe('completed');
    expect(transaction.updatedAt).toBeInstanceOf(Date);
  });

  it('should increment attempts', () => {
    const transaction = new Transaction(
      'tx123',
      'acc456',
      100,
      'USD',
      'debit',
      'pending',
    );
    transaction.incrementAttempts();
    expect(transaction.attempts).toBe(1);
  });
});
