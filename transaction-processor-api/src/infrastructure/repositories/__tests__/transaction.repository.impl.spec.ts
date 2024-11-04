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

  it('should update a transaction status', async () => {
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

  it('should calculate the average transaction amount', async () => {
    const transaction1 = new Transaction(
      'tx123',
      'acc123',
      100,
      'USD',
      'debit',
      'completed',
      'approved',
    );
    const transaction2 = new Transaction(
      'tx124',
      'acc123',
      300,
      'USD',
      'credit',
      'completed',
      'approved',
    );
    await repository.save(transaction1);
    await repository.save(transaction2);

    const averageAmount = await repository.calculateAverageTransactionAmount(
      'acc123',
      30,
    );
    expect(averageAmount).toBe(200);
  });

  it('should count recent failures within the specified hours', async () => {
    const failedTransaction1 = new Transaction(
      'tx123',
      'acc123',
      100,
      'USD',
      'debit',
      'failed',
    );
    const failedTransaction2 = new Transaction(
      'tx124',
      'acc123',
      200,
      'USD',
      'debit',
      'failed',
    );
    const successTransaction = new Transaction(
      'tx125',
      'acc123',
      300,
      'USD',
      'debit',
      'completed',
    );

    await repository.save(failedTransaction1);
    await repository.save(failedTransaction2);
    await repository.save(successTransaction);

    const recentFailures = await repository.countRecentFailures('acc123', 24);
    expect(recentFailures).toBe(2);
  });

  it('should count recent transactions within the specified minutes', async () => {
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
      'completed',
    );
    const transaction3 = new Transaction(
      'tx125',
      'acc123',
      300,
      'USD',
      'debit',
      'completed',
    );

    await repository.save(transaction1);
    await repository.save(transaction2);
    await repository.save(transaction3);

    const recentTransactionCount = await repository.countRecentTransactions(
      'acc123',
      60,
    );
    expect(recentTransactionCount).toBe(3);
  });

  it('should find the last transaction location for an account', async () => {
    const transaction1 = new Transaction(
      'tx123',
      'acc123',
      100,
      'USD',
      'debit',
      'completed',
      'approved',
      0,
      new Date(Date.now() - 10000),
      new Date(Date.now() - 10000),
      { location: 'New York, USA' },
    );
    const transaction2 = new Transaction(
      'tx124',
      'acc123',
      200,
      'USD',
      'credit',
      'completed',
      'approved',
      0,
      new Date(),
      new Date(),
      { location: 'Los Angeles, USA' },
    );

    await repository.save(transaction1);
    await repository.save(transaction2);

    const lastLocation = await repository.findLastTransactionLocation('acc123');
    expect(lastLocation).toBe('Los Angeles, USA');
  });
});
