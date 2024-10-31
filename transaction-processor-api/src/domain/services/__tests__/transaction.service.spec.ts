import { Test, TestingModule } from '@nestjs/testing';
import { Transaction } from '../../entities/transaction.entity';
import { TransactionRepository } from '../../repositories/transaction.repository';
import { TransactionService } from '../transaction.service';
import {
  FraudCheckStatus,
  TransactionStatus,
} from '../../types/transaction.types';
import { TRANSACTION_REPOSITORY_TOKEN } from '../../constants/transaction.constants';

class MockTransactionRepository implements TransactionRepository {
  private transactions = new Map<string, Transaction>();

  async save(transaction: Transaction): Promise<void> {
    this.transactions.set(transaction.transactionId, transaction);
  }

  async findById(transactionId: string): Promise<Transaction | null> {
    return this.transactions.get(transactionId) || null;
  }

  async update(transaction: Transaction): Promise<void> {
    this.transactions.set(transaction.transactionId, transaction);
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
    return 100;
  }

  async countRecentFailures(accountId: string, hours: number): Promise<number> {
    return 2;
  }

  async countRecentTransactions(
    accountId: string,
    minutes: number,
  ): Promise<number> {
    return 5;
  }

  async findLastTransactionLocation(accountId: string): Promise<string | null> {
    return 'New York, USA';
  }
}

describe('TransactionService', () => {
  let service: TransactionService;
  let repository: TransactionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: TRANSACTION_REPOSITORY_TOKEN,
          useClass: MockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    repository = module.get<TransactionRepository>(
      TRANSACTION_REPOSITORY_TOKEN,
    );
  });

  it('should create a new transaction with default values and generate transactionId', async () => {
    const transaction = await service.createTransaction(
      'account123',
      100,
      'USD',
      'debit',
    );
    expect(transaction.transactionId).toBeDefined();
    expect(transaction.status).toBe('pending');
    expect(transaction.fraudCheckStatus).toBe('pending');
    expect(transaction.attempts).toBe(0);
    expect(transaction.amount).toBe(100);
    expect(transaction.currency).toBe('USD');
    expect(transaction.transactionType).toBe('debit');
  });

  it('should update the transaction status', async () => {
    const transaction = await service.createTransaction(
      'account123',
      100,
      'USD',
      'debit',
    );
    await service.updateTransactionStatus(
      transaction.transactionId,
      'approved' as FraudCheckStatus,
      'completed' as TransactionStatus,
    );
    const updatedTransaction = await repository.findById(
      transaction.transactionId,
    );
    expect(updatedTransaction?.status).toBe('completed');
  });

  it('should increment attempts and update updatedAt', async () => {
    const transaction = await service.createTransaction(
      'account123',
      100,
      'USD',
      'debit',
    );
    await service.incrementAttempts(transaction.transactionId);
    const updatedTransaction = await repository.findById(
      transaction.transactionId,
    );
    expect(updatedTransaction?.attempts).toBe(1);
  });

  it('should set fraud check status', async () => {
    const transaction = await service.createTransaction(
      'account123',
      100,
      'USD',
      'debit',
    );
    await service.setFraudCheckStatus(
      transaction.transactionId,
      'rejected' as FraudCheckStatus,
    );
    const updatedTransaction = await repository.findById(
      transaction.transactionId,
    );
    expect(updatedTransaction?.fraudCheckStatus).toBe('rejected');
  });

  it('should retrieve all transactions by account ID', async () => {
    const accountId = 'account123';
    const transaction1 = await service.createTransaction(
      accountId,
      100,
      'USD',
      'debit',
    );
    const transaction2 = await service.createTransaction(
      accountId,
      200,
      'USD',
      'credit',
    );
    await service.createTransaction('account456', 50, 'USD', 'debit');

    const transactions =
      await service.findAllTransactionsByAccountId(accountId);
    expect(transactions).toHaveLength(2);
    expect(transactions).toEqual([transaction1, transaction2]);
  });

  it('should calculate average transaction amount', async () => {
    const accountId = 'account123';
    const result = await service.getAverageTransactionAmount(accountId, 30);
    expect(result).toBe(100);
  });

  it('should count recent failures', async () => {
    const accountId = 'account123';
    const result = await service.getRecentFailures(accountId, 24);
    expect(result).toBe(2);
  });

  it('should count recent transactions', async () => {
    const accountId = 'account123';
    const result = await service.getRecentTransactionCount(accountId, 10);
    expect(result).toBe(5);
  });

  it('should get last transaction location', async () => {
    const accountId = 'account123';
    const result = await service.getLastTransactionLocation(accountId);
    expect(result).toBe('New York, USA');
  });
});
