import { Account } from '../../../domain/entities/account.entity';
import { AccountRepositoryImpl } from '../account.repository.impl';

describe('AccountRepositoryImpl', () => {
  let repository: AccountRepositoryImpl;

  beforeEach(() => {
    repository = new AccountRepositoryImpl();
  });

  it('should save an account', async () => {
    const account = new Account('account123', 5000, 'user123', 'USD');
    await repository.save(account);

    const savedAccount = await repository.findById('account123');
    expect(savedAccount).toEqual(account);
  });

  it('should update an account balance', async () => {
    const account = new Account('account123', 5000, 'user123', 'USD');
    await repository.save(account);

    const updatedAccount = account.updateBalance(6000);
    await repository.update(updatedAccount);

    const result = await repository.findById('account123');
    expect(result?.balance).toBe(6000);
  });

  it('should throw an error if updating a non-existing account', async () => {
    const account = new Account('account123', 5000, 'user123', 'USD');
    await expect(repository.update(account)).rejects.toThrow(
      'Account not found',
    );
  });

  it('should get daily spent for an account', async () => {
    const account = new Account('account123', 5000, 'user123', 'USD');
    await repository.save(account);

    const dailySpent = await repository.getDailySpent('account123');
    expect(dailySpent).toBe(500);
  });

  it('should verify an account', async () => {
    const account = new Account('account123', 5000, 'user123', 'USD');
    await repository.save(account);

    await repository.verifyAccount('account123');
    const verifiedAccount = await repository.findById('account123');
    expect(verifiedAccount?.isVerified).toBe(true);
  });

  it('should reserve balance on an account', async () => {
    const account = new Account('account123', 5000, 'user123', 'USD');
    await repository.save(account);

    await repository.reserveBalance('account123', 1000);
    const reservedAccount = await repository.findById('account123');
    expect(reservedAccount?.balance).toBe(4000);
    expect(reservedAccount?.reservedAmount).toBe(1000);
  });

  it('should confirm reservation on an account', async () => {
    const account = new Account('account123', 5000, 'user123', 'USD');
    const reservedAccount = account.reserveBalance(1000);
    await repository.save(reservedAccount);

    await repository.confirmReservation('account123', 1000);
    const result = await repository.findById('account123');
    expect(result?.reservedAmount).toBe(0);
  });

  it('should revert reservation on an account', async () => {
    const account = new Account('account123', 5000, 'user123', 'USD');
    const reservedAccount = account.reserveBalance(1000);
    await repository.save(reservedAccount);

    await repository.revertReservation('account123', 1000);
    const revertedAccount = await repository.findById('account123');
    expect(revertedAccount?.balance).toBe(5000);
    expect(revertedAccount?.reservedAmount).toBe(0);
  });

  it('should reset daily limits for all accounts', async () => {
    const account1 = new Account(
      'account123',
      5000,
      'user123',
      'USD',
      'active',
      new Date(),
      new Date(),
      500,
    );
    const account2 = new Account(
      'account456',
      3000,
      'user456',
      'USD',
      'active',
      new Date(),
      new Date(),
      300,
    );
    await repository.save(account1);
    await repository.save(account2);

    await repository.resetDailyLimits();

    const updatedAccount1 = await repository.findById('account123');
    const updatedAccount2 = await repository.findById('account456');
    expect(updatedAccount1?.dailyLimit).toBe(500);
    expect(updatedAccount2?.dailyLimit).toBe(300);
  });
});
