import { Test, TestingModule } from '@nestjs/testing';
import { Account } from '../../entities/account.entity';
import { AccountRepository } from '../../repositories/account.repository';
import { AccountService } from '../account.service';
import { ACCOUNT_REPOSITORY_TOKEN } from '../../constants/account.constants';

class MockAccountRepository implements AccountRepository {
  private accounts = new Map<string, Account>();

  async findById(accountId: string): Promise<Account | null> {
    return this.accounts.get(accountId) || null;
  }

  async findAll(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async save(account: Account): Promise<void> {
    this.accounts.set(account.accountId, account);
  }

  async update(account: Account): Promise<void> {
    if (!this.accounts.has(account.accountId)) {
      throw new Error('Account not found');
    }
    this.accounts.set(account.accountId, account);
  }

  async getDailySpent(accountId: string): Promise<number> {
    return 1000;
  }

  async reserveBalance(accountId: string, amount: number): Promise<void> {
    const account = this.accounts.get(accountId);
    if (!account) throw new Error('Account not found');
    const updatedAccount = account.reserveBalance(amount);
    this.accounts.set(accountId, updatedAccount);
  }

  async confirmReservation(accountId: string, amount: number): Promise<void> {
    const account = this.accounts.get(accountId);
    if (!account) throw new Error('Account not found');
    const updatedAccount = account.confirmReservation(amount);
    this.accounts.set(accountId, updatedAccount);
  }

  async revertReservation(accountId: string, amount: number): Promise<void> {
    const account = this.accounts.get(accountId);
    if (!account) throw new Error('Account not found');
    const updatedAccount = account.revertReservation(amount);
    this.accounts.set(accountId, updatedAccount);
  }

  async verifyAccount(accountId: string): Promise<void> {
    const account = this.accounts.get(accountId);
    if (!account) throw new Error('Account not found');
    const verifiedAccount = account.verifyAccount();
    this.accounts.set(accountId, verifiedAccount);
  }

  async resetDailyLimits(): Promise<void> {
    for (const account of this.accounts.values()) {
      const resetAccount = account.resetDailyLimit();
      this.accounts.set(account.accountId, resetAccount);
    }
  }
}

describe('AccountService', () => {
  let service: AccountService;
  let repository: AccountRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: ACCOUNT_REPOSITORY_TOKEN,
          useClass: MockAccountRepository,
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    repository = module.get<AccountRepository>(ACCOUNT_REPOSITORY_TOKEN);
  });

  it('should create a new account', async () => {
    const account = await service.createAccount(5000, 'user123', 'USD');
    expect(account).toBeInstanceOf(Account);
    expect(account.balance).toBe(5000);
  });

  it('should reserve balance on the account', async () => {
    const account = new Account('account123', 5000, 'user123', 'USD');
    await repository.save(account);
    await service.reserveBalance('account123', 1000);

    const updatedAccount = await repository.findById('account123');
    expect(updatedAccount?.balance).toBe(4000);
    expect(updatedAccount?.reservedAmount).toBe(1000);
  });

  it('should confirm reservation', async () => {
    const account = new Account('account123', 5000, 'user123', 'USD');
    await repository.save(account);
    await service.reserveBalance('account123', 1000);
    await service.confirmReservation('account123', 1000);

    const updatedAccount = await repository.findById('account123');
    expect(updatedAccount?.reservedAmount).toBe(0);
  });

  it('should revert reservation', async () => {
    const account = new Account('account123', 5000, 'user123', 'USD');
    await repository.save(account);
    await service.reserveBalance('account123', 1000);
    await service.revertReservation('account123', 1000);

    const updatedAccount = await repository.findById('account123');
    expect(updatedAccount?.balance).toBe(5000);
    expect(updatedAccount?.reservedAmount).toBe(0);
  });

  it('should reset daily limits for all accounts', async () => {
    const account1 = new Account(
      'account123',
      5000,
      'user123',
      'USD',
      'active',
      new Date(),
      new Date(),
      500,
    );
    const account2 = new Account(
      'account456',
      7000,
      'user456',
      'USD',
      'active',
      new Date(),
      new Date(),
      500,
    );

    await repository.save(account1);
    await repository.save(account2);

    await service.resetAllDailyLimits();

    const allAccounts = await repository.findAll();
    allAccounts.forEach((account) => {
      expect(account.dailyLimit).toBe(500);
    });
  });
});
