import { TransactionRepository } from '../../domain/repositories/transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
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

  async calculateAverageTransactionAmount(
    accountId: string,
    days: number,
  ): Promise<number> {
    const now = new Date();
    const relevantTransactions = Array.from(this.transactions.values()).filter(
      (transaction) =>
        transaction.accountId === accountId &&
        transaction.fraudCheckStatus === 'approved' &&
        transaction.status === 'completed' &&
        this.isWithinDays(transaction.createdAt, now, days),
    );

    const totalAmount = relevantTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0,
    );

    return relevantTransactions.length
      ? totalAmount / relevantTransactions.length
      : 0;
  }

  async countRecentFailures(accountId: string, hours: number): Promise<number> {
    const cutoffDate = this.subtractHours(new Date(), hours);
    return Array.from(this.transactions.values()).filter(
      (transaction) =>
        transaction.accountId === accountId &&
        transaction.status === 'failed' &&
        transaction.createdAt >= cutoffDate,
    ).length;
  }

  async countRecentTransactions(
    accountId: string,
    minutes: number,
  ): Promise<number> {
    const cutoffDate = this.subtractMinutes(new Date(), minutes);
    return Array.from(this.transactions.values()).filter(
      (transaction) =>
        transaction.accountId === accountId &&
        transaction.createdAt >= cutoffDate,
    ).length;
  }

  async findLastTransactionLocation(accountId: string): Promise<string | null> {
    const transactionsForAccount = Array.from(this.transactions.values())
      .filter((transaction) => transaction.accountId === accountId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return transactionsForAccount.length
      ? transactionsForAccount[0]?.metadata?.location || null
      : null;
  }

  private isWithinDays(date: Date, now: Date, days: number): boolean {
    const cutoffDate = new Date(now);
    cutoffDate.setDate(now.getDate() - days);
    return date >= cutoffDate;
  }

  private subtractHours(date: Date, hours: number): Date {
    const newDate = new Date(date);
    newDate.setHours(date.getHours() - hours);
    return newDate;
  }

  private subtractMinutes(date: Date, minutes: number): Date {
    const newDate = new Date(date);
    newDate.setMinutes(date.getMinutes() - minutes);
    return newDate;
  }
}
