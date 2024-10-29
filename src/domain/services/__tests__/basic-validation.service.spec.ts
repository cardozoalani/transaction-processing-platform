import { BasicValidationService } from '../basic-validation.service';
import { AccountRepository } from '../../repositories/account.repository';
import { Transaction } from '../../entities/transaction.entity';
import { Account } from '../../entities/account.entity';
import { ITimeZoneService } from '../../../infrastructure/services/timezone.service.interface';
import { TimeZoneService } from '../../../infrastructure/services/timezone.service';

class MockAccountRepository implements AccountRepository {
  private accounts: Map<string, Account> = new Map();

  constructor() {
    this.accounts.set(
      'acc123',
      new Account(
        'acc123',
        5000,
        'user123',
        'USD',
        'active',
        new Date(),
        new Date(),
        1000,
        true,
      ),
    );
  }

  async findById(accountId: string): Promise<Account | null> {
    return this.accounts.get(accountId) || null;
  }

  async reserveAmount(accountId: string, amount: number): Promise<void> {
    const account = this.accounts.get(accountId);
    if (account) account.updateBalance(account.balance - amount);
  }

  async getDailySpent(accountId: string): Promise<number> {
    return 500;
  }

  async getAverageTransactionAmount(
    accountId: string,
    days: number,
  ): Promise<number> {
    return 200;
  }

  async getRecentFailures(accountId: string, hours: number): Promise<number> {
    return 1;
  }

  async getRecentTransactionCount(
    accountId: string,
    minutes: number,
  ): Promise<number> {
    return 2;
  }

  async getLastTransactionLocation(accountId: string): Promise<string | null> {
    return 'New York, USA';
  }
}

describe('BasicValidationService', () => {
  let timeZoneService: ITimeZoneService;
  let service: BasicValidationService;
  let accountRepository: AccountRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    accountRepository = new MockAccountRepository();
    timeZoneService = new TimeZoneService();
    service = new BasicValidationService(accountRepository, timeZoneService);
  });

  it('should validate balance if sufficient', async () => {
    const result = await service.validateBalance('acc123', 500);
    expect(result).toBe(true);
  });

  it('should fail balance validation if insufficient', async () => {
    const result = await service.validateBalance('acc123', 6000);
    expect(result).toBe(false);
  });

  it('should fail validation if daily limit exceeded', async () => {
    jest.spyOn(accountRepository, 'getDailySpent').mockResolvedValue(900);
    const result = await service.validateBalance('acc123', 200);
    expect(result).toBe(false);
  });

  it('should pass fraud detection for low transaction amount', async () => {
    const transaction = new Transaction(
      'tx123',
      'acc123',
      1000,
      'USD',
      'debit',
      'pending',
    );
    const result = await service.detectFraud(transaction);
    expect(result).toBe('pass');
  });

  it('should fail fraud detection for high transaction amount in unverified account', async () => {
    jest
      .spyOn(accountRepository, 'findById')
      .mockResolvedValue(
        new Account(
          'acc123',
          5000,
          'user123',
          'USD',
          'active',
          new Date(),
          new Date(),
          1000,
          false,
        ),
      );
    const transaction = new Transaction(
      'tx124',
      'acc123',
      6000,
      'USD',
      'debit',
      'pending',
    );
    const result = await service.detectFraud(transaction);
    expect(result).toBe('fail');
  });

  it('should detect fraud if recent transaction frequency is high', async () => {
    jest
      .spyOn(accountRepository, 'getRecentTransactionCount')
      .mockResolvedValue(10);
    const transaction = new Transaction(
      'tx125',
      'acc123',
      1000,
      'USD',
      'debit',
      'pending',
    );
    const result = await service.detectFraud(transaction);
    expect(result).toBe('fail');
  });

  it('should detect fraud if transaction amount is significantly above average', async () => {
    jest
      .spyOn(accountRepository, 'getAverageTransactionAmount')
      .mockResolvedValue(100);
    const transaction = new Transaction(
      'tx126',
      'acc123',
      600,
      'USD',
      'debit',
      'pending',
    );
    const result = await service.detectFraud(transaction);
    expect(result).toBe('fail');
  });

  it('should detect fraud if location is suspicious', async () => {
    jest
      .spyOn(accountRepository, 'getLastTransactionLocation')
      .mockResolvedValue('New York, USA');
    const transaction = new Transaction(
      'tx127',
      'acc123',
      500,
      'USD',
      'debit',
      'pending',
      'pass',
      0,
      new Date(),
      new Date(),
      { location: 'Los Angeles, USA' },
    );
    const result = await service.detectFraud(transaction);
    expect(result).toBe('fail');
  });
});
