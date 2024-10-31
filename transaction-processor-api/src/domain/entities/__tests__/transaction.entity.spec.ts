import { Transaction } from '../transaction.entity';
import {
  TransactionStatus,
  FraudCheckStatus,
} from '../../types/transaction.types';

describe('Transaction Entity', () => {
  it('should create a transaction with default values', () => {
    const transaction = new Transaction(
      'tx123',
      'account123',
      100,
      'USD',
      'debit',
    );
    expect(transaction.status).toBe('pending');
    expect(transaction.fraudCheckStatus).toBe('pending');
    expect(transaction.attempts).toBe(0);
    expect(transaction.amount).toBe(100);
    expect(transaction.currency).toBe('USD');
    expect(transaction.transactionType).toBe('debit');
  });

  it('should update the transaction status and updatedAt field', () => {
    const transaction = new Transaction(
      'tx123',
      'account123',
      100,
      'USD',
      'debit',
    );
    const initialUpdatedAt = transaction.updatedAt;

    transaction.updateStatus('completed' as TransactionStatus);
    expect(transaction.status).toBe('completed');
    expect(transaction.updatedAt).not.toBe(initialUpdatedAt);
  });

  it('should increment attempts and update updatedAt', () => {
    const transaction = new Transaction(
      'tx123',
      'account123',
      100,
      'USD',
      'debit',
    );
    transaction.incrementAttempts();

    expect(transaction.attempts).toBe(1);
    const firstUpdatedAt = transaction.updatedAt;

    transaction.incrementAttempts();
    expect(transaction.attempts).toBe(2);
    expect(transaction.updatedAt).not.toBe(firstUpdatedAt);
  });

  it('should set fraud check status and update updatedAt', () => {
    const transaction = new Transaction(
      'tx123',
      'account123',
      100,
      'USD',
      'debit',
    );
    const initialUpdatedAt = transaction.updatedAt;

    transaction.setFraudCheckStatus('rejected' as FraudCheckStatus);
    expect(transaction.fraudCheckStatus).toBe('rejected');
    expect(transaction.updatedAt).not.toBe(initialUpdatedAt);
  });

  it('should set metadata if provided', () => {
    const metadata = { location: 'New York', timezone: 'EST' };
    const transaction = new Transaction(
      'tx123',
      'account123',
      100,
      'USD',
      'debit',
      'pending',
      'pending',
      0,
      new Date(),
      new Date(),
      metadata,
    );

    expect(transaction.metadata?.location).toBe('New York');
    expect(transaction.metadata?.timezone).toBe('EST');
  });
});
