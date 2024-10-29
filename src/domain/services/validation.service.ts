import { Transaction } from '../entities/transaction.entity';

export interface ValidationService {
  validateBalance(accountId: string, amount: number): Promise<boolean>;
  detectFraud(transaction: Transaction): Promise<'pass' | 'fail'>;
}
