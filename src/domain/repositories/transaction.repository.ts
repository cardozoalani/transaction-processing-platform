import { Transaction } from '../entities/transaction.entity';

export interface TransactionRepository {
  save(transaction: Transaction): Promise<void>;
  update(transaction: Transaction): Promise<void>;
  findById(transactionId: string): Promise<Transaction | null>;
  findAllByAccountId(accountId: string): Promise<Transaction[]>;
}
