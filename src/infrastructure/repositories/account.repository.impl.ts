import { AccountRepository } from '../../domain/repositories/account.repository';
import { Account } from '../../domain/entities/account.entity';

export class AccountRepositoryImpl implements AccountRepository {
  private accounts: Map<string, Account> = new Map();

  constructor() {
    this.accounts.set('acc123', new Account('acc123', 5000, 'user123', 'USD'));
  }

  async findById(accountId: string): Promise<Account | null> {
    return this.accounts.get(accountId) || null;
  }

  async reserveAmount(accountId: string, amount: number): Promise<void> {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    account.updateBalance(account.balance - amount);
  }

  async getDailySpent(accountId: string): Promise<number> {
    return 500;
  }

  async getAverageTransactionAmount(
    accountId: string,
    days: number,
  ): Promise<number> {
    return 200;
  }

  async getRecentFailures(accountId: string, hours: number): Promise<number> {
    return 1;
  }

  async getRecentTransactionCount(
    accountId: string,
    minutes: number,
  ): Promise<number> {
    return 2;
  }

  async getLastTransactionLocation(accountId: string): Promise<string | null> {
    const account = await this.findById(accountId);
    if (!account) {
      return null;
    }
    return 'New York, USA';
  }
}
