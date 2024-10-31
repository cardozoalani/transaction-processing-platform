import { Inject, Injectable } from '@nestjs/common';
import { TransactionRepository } from '../repositories/transaction.repository';
import { Transaction } from '../entities/transaction.entity';
import {
  TransactionStatus,
  FraudCheckStatus,
} from '../types/transaction.types';
import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_REPOSITORY_TOKEN } from '../constants/transaction.constants';

@Injectable()
export class TransactionService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY_TOKEN)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async createTransaction(
    accountId: string,
    amount: number,
    currency: string,
    transactionType: 'debit' | 'credit',
  ): Promise<Transaction> {
    const transactionId = uuidv4();
    const transaction = new Transaction(
      transactionId,
      accountId,
      amount,
      currency,
      transactionType,
    );
    await this.transactionRepository.save(transaction);
    return transaction;
  }

  async findAllTransactionsByAccountId(
    accountId: string,
  ): Promise<Transaction[]> {
    return this.transactionRepository.findAllByAccountId(accountId);
  }

  async updateTransactionStatus(
    transactionId: string,
    fraudCheckStatus: FraudCheckStatus,
    status: TransactionStatus,
  ): Promise<void> {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    transaction.fraudCheckStatus = fraudCheckStatus;
    transaction.status = status;
    await this.transactionRepository.update(transaction);
  }

  async incrementAttempts(transactionId: string): Promise<void> {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) throw new Error('Transaction not found');
    transaction.incrementAttempts();
    await this.transactionRepository.update(transaction);
  }

  async setFraudCheckStatus(
    transactionId: string,
    status: FraudCheckStatus,
  ): Promise<void> {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) throw new Error('Transaction not found');
    transaction.setFraudCheckStatus(status);
    await this.transactionRepository.update(transaction);
  }

  async findTransactionById(
    transactionId: string,
  ): Promise<Transaction | null> {
    return this.transactionRepository.findById(transactionId);
  }

  async getAverageTransactionAmount(accountId: string, days: number) {
    return this.transactionRepository.calculateAverageTransactionAmount(
      accountId,
      days,
    );
  }

  async getRecentFailures(accountId: string, hours: number) {
    return this.transactionRepository.countRecentFailures(accountId, hours);
  }

  async getRecentTransactionCount(accountId: string, minutes: number) {
    return this.transactionRepository.countRecentTransactions(
      accountId,
      minutes,
    );
  }

  async getLastTransactionLocation(accountId: string) {
    return this.transactionRepository.findLastTransactionLocation(accountId);
  }
}
