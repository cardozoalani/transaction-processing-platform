import { Account } from '../account.entity';

describe('Account Entity', () => {
  it('should create an account with default values', () => {
    const account = new Account('acc456', 500, 'user123', 'USD');
    expect(account.accountId).toBe('acc456');
    expect(account.balance).toBe(500);
    expect(account.currency).toBe('USD');
    expect(account.status).toBe('active');
    expect(account.dailyLimit).toBe(1000);
    expect(account.isVerified).toBe(false);
  });

  it('should update the account balance', () => {
    const account = new Account('acc456', 500, 'user123', 'USD');
    account.updateBalance(750);
    expect(account.balance).toBe(750);
    expect(account.updatedAt).toBeInstanceOf(Date);
  });

  it('should change the account status', () => {
    const account = new Account('acc456', 500, 'user123', 'USD');
    account.changeStatus('suspended');
    expect(account.status).toBe('suspended');
    expect(account.updatedAt).toBeInstanceOf(Date);
  });

  it('should verify the account', () => {
    const account = new Account('acc456', 500, 'user123', 'USD');
    account.verifyAccount();
    expect(account.isVerified).toBe(true);
    expect(account.updatedAt).toBeInstanceOf(Date);
  });
});
