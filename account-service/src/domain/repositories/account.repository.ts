import { Account } from '../entities/account.entity';

export interface AccountRepository {
  findById(accountId: string): Promise<Account | null>;
  findAll(): Promise<Account[]>;
  save(account: Account): Promise<void>;
  update(account: Account): Promise<void>;
  getDailySpent(accountId: string): Promise<number>;

  reserveBalance(accountId: string, amount: number): Promise<void>;
  confirmReservation(accountId: string, amount: number): Promise<void>;
  revertReservation(accountId: string, amount: number): Promise<void>;

  verifyAccount(accountId: string): Promise<void>;
  resetDailyLimits(): Promise<void>;
}
