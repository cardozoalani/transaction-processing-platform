import { Account } from '../account.entity';
import { AccountStatus } from '../../types/account.types';

describe('Account Entity', () => {
  it('should create an account with default values', () => {
    const account = new Account('account123', 5000, 10000, 'user123', 'USD');
    expect(account.accountId).toBe('account123');
    expect(account.balance).toBe(5000);
    expect(account.owner).toBe('user123');
    expect(account.currency).toBe('USD');
    expect(account.status).toBe('active');
    expect(account.isVerified).toBe(false);
  });

  it('should update balance and return a new account instance', () => {
    const account = new Account('account123', 5000, 10000, 'user123', 'USD');
    const updatedAccount = account.updateBalance(6000);

    expect(updatedAccount.balance).toBe(6000);
    expect(updatedAccount.updatedAt).not.toBe(account.updatedAt);
    expect(updatedAccount).not.toBe(account);
  });

  it('should change account status and return a new account instance', () => {
    const account = new Account('account123', 5000, 121221, 'user123', 'USD');
    const suspendedAccount = account.changeStatus('suspended' as AccountStatus);

    expect(suspendedAccount.status).toBe('suspended');
    expect(suspendedAccount.updatedAt).not.toBe(account.updatedAt);
    expect(suspendedAccount).not.toBe(account);
  });

  it('should verify the account and return a new account instance', () => {
    const account = new Account('account123', 5000, 110000, 'user123', 'USD');
    const verifiedAccount = account.verifyAccount();

    expect(verifiedAccount.isVerified).toBe(true);
    expect(verifiedAccount.updatedAt).not.toBe(account.updatedAt);
    expect(verifiedAccount).not.toBe(account);
  });

  it('should reserve balance and return a new account instance with updated balance and reservedAmount', () => {
    const account = new Account('account123', 5000, 10000, 'user123', 'USD');
    const reservedAccount = account.reserveBalance(1000);

    expect(reservedAccount.balance).toBe(4000);
    expect(reservedAccount.reservedAmount).toBe(1000);
    expect(reservedAccount).not.toBe(account);
  });

  it('should confirm reservation and return a new account instance with updated reservedAmount', () => {
    const account = new Account(
      'account123',
      5000,
      1000,
      'user123',
      'USD',
      'active',
      new Date(),
      new Date(),
      false,
      {},
      1000,
    );
    const confirmedAccount = account.confirmReservation(1000);

    expect(confirmedAccount.reservedAmount).toBe(0);
    expect(confirmedAccount).not.toBe(account);
  });

  it('should revert reservation and return a new account instance with restored balance and reservedAmount', () => {
    const account = new Account(
      'account123',
      4000,
      900,
      'user123',
      'USD',
      'active',
      new Date(),
      new Date(),
      false,
      {},
      1000,
    );
    const revertedAccount = account.revertReservation(1000);

    expect(revertedAccount.balance).toBe(5000);
    expect(revertedAccount.reservedAmount).toBe(0);
    expect(revertedAccount).not.toBe(account);
  });

  it('should reset daily limit and return a new account instance with initial daily limit', () => {
    const account = new Account(
      'account123',
      5000,
      500,
      'user123',
      'USD',
      'active',
      new Date(),
      new Date(),
      true,
      {},
      500,
    );
    const resetAccount = account.resetDailyLimit();

    expect(resetAccount.dailyLimit).toBe(500);
    expect(resetAccount).not.toBe(account);
  });
});
