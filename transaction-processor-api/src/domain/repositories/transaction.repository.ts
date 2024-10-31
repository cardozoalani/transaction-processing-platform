import { Transaction } from '../entities/transaction.entity';

export interface TransactionRepository {
  save(transaction: Transaction): Promise<void>;
  update(transaction: Transaction): Promise<void>;
  findById(transactionId: string): Promise<Transaction | null>;
  findAllByAccountId(accountId: string): Promise<Transaction[]>;
  calculateAverageTransactionAmount(
    accountId: string,
    days: number,
  ): Promise<number>;
  countRecentFailures(accountId: string, hours: number): Promise<number>;
  countRecentTransactions(accountId: string, minutes: number): Promise<number>;
  findLastTransactionLocation(accountId: string): Promise<string | null>;
}
