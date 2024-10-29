import { Account } from '../entities/account.entity';

export interface AccountRepository {
  findById(accountId: string): Promise<Account | null>;
  reserveAmount(accountId: string, amount: number): Promise<void>;
  getDailySpent(accountId: string): Promise<number>;
  getAverageTransactionAmount(accountId: string, days: number): Promise<number>;
  getRecentFailures(accountId: string, hours: number): Promise<number>;
  getRecentTransactionCount(
    accountId: string,
    minutes: number,
  ): Promise<number>;
  getLastTransactionLocation(accountId: string): Promise<string | null>;
}
