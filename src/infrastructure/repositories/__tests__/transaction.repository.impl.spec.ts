import { TransactionRepositoryImpl } from '../transaction.repository.impl';
import { Transaction } from '../../../domain/entities/transaction.entity';

describe('TransactionRepositoryImpl', () => {
  let repository: TransactionRepositoryImpl;

  beforeEach(() => {
    repository = new TransactionRepositoryImpl();
  });

  it('should save a transaction', async () => {
    const transaction = new Transaction(
      'tx123',
      'acc123',
      100,
      'USD',
      'debit',
      'pending',
    );
    await repository.save(transaction);
    const foundTransaction = await repository.findById('tx123');
    expect(foundTransaction).toEqual(transaction);
  });

  it('should update a transaction', async () => {
    const transaction = new Transaction(
      'tx123',
      'acc123',
      100,
      'USD',
      'debit',
      'pending',
    );
    await repository.save(transaction);

    transaction.updateStatus('completed');
    await repository.update(transaction);

    const updatedTransaction = await repository.findById('tx123');
    expect(updatedTransaction?.status).toBe('completed');
  });

  it('should throw error when updating a non-existent transaction', async () => {
    const transaction = new Transaction(
      'tx123',
      'acc123',
      100,
      'USD',
      'debit',
      'pending',
    );
    await expect(repository.update(transaction)).rejects.toThrow(
      'Transaction not found',
    );
  });

  it('should find all transactions by account ID', async () => {
    const transaction1 = new Transaction(
      'tx123',
      'acc123',
      100,
      'USD',
      'debit',
      'pending',
    );
    const transaction2 = new Transaction(
      'tx124',
      'acc123',
      200,
      'USD',
      'credit',
      'pending',
    );
    const transaction3 = new Transaction(
      'tx125',
      'acc456',
      300,
      'USD',
      'debit',
      'pending',
    );

    await repository.save(transaction1);
    await repository.save(transaction2);
    await repository.save(transaction3);

    const accountTransactions = await repository.findAllByAccountId('acc123');
    expect(accountTransactions.length).toBe(2);
    expect(accountTransactions).toContainEqual(transaction1);
    expect(accountTransactions).toContainEqual(transaction2);
  });

  it('should return null if transaction not found', async () => {
    const transaction = await repository.findById('nonexistent');
    expect(transaction).toBeNull();
  });
});
