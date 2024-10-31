import { Test, TestingModule } from '@nestjs/testing';
import { Account } from '../../../domain/entities/account.entity';
import { AccountController } from '../account.controller';
import { AccountService } from '../../../domain/services/account.service';
import { CreateAccountDto } from '../../dto/create-account.dto';

class MockAccountService {
  async createAccount(balance: number, owner: string, currency: string) {
    return new Account('account123', balance, owner, currency);
  }

  async findAccountById(accountId: string) {
    if (accountId === 'account123') {
      return new Account(accountId, 5000, 'user123', 'USD');
    }
    return null;
  }

  async reserveBalance(accountId: string, amount: number) {
    return { message: `Reserved ${amount} from account ${accountId}` };
  }

  async confirmReservation(accountId: string, amount: number) {
    return {
      message: `Confirmed reservation of ${amount} for account ${accountId}`,
    };
  }

  async revertReservation(accountId: string, amount: number) {
    return { message: `Reverted ${amount} to account ${accountId}` };
  }
}

describe('AccountController', () => {
  let controller: AccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useClass: MockAccountService,
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
  });

  it('should create a new account and return accountId and status', async () => {
    const dto: CreateAccountDto = {
      balance: 5000,
      owner: 'user123',
      currency: 'USD',
    };

    const result = await controller.createAccount(dto);
    expect(result).toEqual({ accountId: 'account123', status: 'active' });
  });

  it('should return account details when account exists', async () => {
    const result = await controller.getAccountById('account123');
    expect(result).toEqual(
      expect.objectContaining({ accountId: 'account123', balance: 5000 }),
    );
  });

  it('should return a message when account does not exist', async () => {
    const result = await controller.getAccountById('nonexistent');
    expect(result).toEqual({ message: 'Account not found' });
  });

  it('should reserve balance for the account', async () => {
    const result = await controller.updateAccountBalance('account123', {
      amount: 1000,
      action: 'reserve',
    });
    expect(result).toEqual({
      message: 'Reserved 1000 from account account123',
    });
  });

  it('should confirm reservation for the account', async () => {
    const result = await controller.updateAccountBalance('account123', {
      amount: 1000,
      action: 'confirm',
    });
    expect(result).toEqual({
      message: 'Confirmed reservation of 1000 for account account123',
    });
  });

  it('should revert reservation for the account', async () => {
    const result = await controller.updateAccountBalance('account123', {
      amount: 1000,
      action: 'revert',
    });
    expect(result).toEqual({
      message: 'Reverted 1000 to account account123',
    });
  });

  it('should get balance and daily limit for the account', async () => {
    const result = await controller.getBalanceAndDailySpend('account123');
    expect(result).toEqual({
      balance: 5000,
      dailyLimit: 1000,
    });
  });

  it('should return an error if account is not found for balance and daily limit', async () => {
    await expect(
      controller.getBalanceAndDailySpend('nonexistent'),
    ).rejects.toThrow('Account not found');
  });
});
