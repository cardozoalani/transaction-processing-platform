import {
  TransactionType,
  TransactionStatus,
  FraudCheckStatus,
} from '../types/transaction.types';

export class Transaction {
  constructor(
    public readonly transactionId: string,
    public readonly accountId: string,
    public amount: number,
    public currency: string,
    public transactionType: TransactionType,
    public status: TransactionStatus = 'pending',
    public fraudCheckStatus: FraudCheckStatus = 'pending',
    public attempts: number = 0,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public metadata?: {
      location?: string;
      timezone?: string;
    },
  ) {}

  updateStatus(newStatus: TransactionStatus) {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  incrementAttempts() {
    this.attempts += 1;
    this.updatedAt = new Date();
  }

  setFraudCheckStatus(status: FraudCheckStatus) {
    this.fraudCheckStatus = status;
    this.updatedAt = new Date();
  }
}
