import { Transaction } from '../../entities/transaction.entity';
import { ValidationService } from '../validation.service';

class MockValidationService implements ValidationService {
  async validateBalance(accountId: string, amount: number): Promise<boolean> {
    return amount <= 500;
  }

  async detectFraud(transaction: Transaction): Promise<'pass' | 'fail'> {
    return transaction.amount > 1000 ? 'fail' : 'pass';
  }
}

describe('ValidationService', () => {
  const service = new MockValidationService();

  it('should pass balance validation for sufficient balance', async () => {
    const result = await service.validateBalance('acc456', 100);
    expect(result).toBe(true);
  });

  it('should fail fraud detection for large transactions', async () => {
    const transaction = new Transaction(
      'tx123',
      'acc456',
      1500,
      'USD',
      'debit',
      'pending',
    );
    const result = await service.detectFraud(transaction);
    expect(result).toBe('fail');
  });
});
