import { AccountRepositoryImpl } from '../account.repository.impl';
import { Account } from '../../../domain/entities/account.entity';

describe('AccountRepositoryImpl', () => {
  let repository: AccountRepositoryImpl;

  beforeEach(() => {
    repository = new AccountRepositoryImpl();
  });

  it('should find an account by ID', async () => {
    const account = await repository.findById('acc123');
    expect(account).toBeInstanceOf(Account);
    expect(account?.accountId).toBe('acc123');
  });

  it('should return null if account is not found', async () => {
    const account = await repository.findById('nonexistent');
    expect(account).toBeNull();
  });

  it('should reserve amount if account exists and has sufficient balance', async () => {
    const account = await repository.findById('acc123');
    const initialBalance = account?.balance;

    await repository.reserveAmount('acc123', 1000);

    const updatedAccount = await repository.findById('acc123');
    expect(updatedAccount?.balance).toBe(initialBalance! - 1000);
  });

  it('should throw error when reserving amount on a nonexistent account', async () => {
    await expect(repository.reserveAmount('nonexistent', 1000)).rejects.toThrow(
      'Account not found',
    );
  });

  it('should get daily spent amount', async () => {
    const dailySpent = await repository.getDailySpent('acc123');
    expect(dailySpent).toBe(500);
  });

  it('should get average transaction amount over a specified period', async () => {
    const averageAmount = await repository.getAverageTransactionAmount(
      'acc123',
      30,
    );
    expect(averageAmount).toBe(200);
  });

  it('should get recent failures count within specified hours', async () => {
    const recentFailures = await repository.getRecentFailures('acc123', 24);
    expect(recentFailures).toBe(1);
  });

  it('should get recent transaction count within specified minutes', async () => {
    const recentTransactions = await repository.getRecentTransactionCount(
      'acc123',
      10,
    );
    expect(recentTransactions).toBe(2);
  });

  it('should get the last transaction location', async () => {
    const location = await repository.getLastTransactionLocation('acc123');
    expect(location).toBe('New York, USA');
  });

  it('should return null for the last transaction location if account does not exist', async () => {
    const location = await repository.getLastTransactionLocation('nonexistent');
    expect(location).toBeNull();
  });
});
