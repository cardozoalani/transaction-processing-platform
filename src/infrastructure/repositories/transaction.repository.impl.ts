import { TransactionRepository } from '../../domain/repositories/transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';

export class TransactionRepositoryImpl implements TransactionRepository {
  private transactions: Map<string, Transaction> = new Map();

  async save(transaction: Transaction): Promise<void> {
    this.transactions.set(transaction.transactionId, transaction);
  }

  async update(transaction: Transaction): Promise<void> {
    if (!this.transactions.has(transaction.transactionId)) {
      throw new Error('Transaction not found');
    }
    this.transactions.set(transaction.transactionId, transaction);
  }

  async findById(transactionId: string): Promise<Transaction | null> {
    return this.transactions.get(transactionId) || null;
  }

  async findAllByAccountId(accountId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.accountId === accountId,
    );
  }
}
