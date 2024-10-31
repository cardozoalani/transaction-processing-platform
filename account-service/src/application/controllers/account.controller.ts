import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AccountService } from '../../domain/services/account.service';
import { CreateAccountDto } from '../dto/create-account.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    const account = await this.accountService.createAccount(
      createAccountDto.balance,
      createAccountDto.owner,
      createAccountDto.currency,
    );
    return { accountId: account.accountId, status: account.status };
  }

  @Get(':accountId')
  async getAccountById(@Param('accountId') accountId: string) {
    const account = await this.accountService.findAccountById(accountId);
    if (!account) {
      return { message: 'Account not found' };
    }
    return account;
  }

  @Patch('/:accountId/balance')
  async updateAccountBalance(
    @Param('accountId') accountId: string,
    @Body()
    updateData: { amount: number; action: 'reserve' | 'confirm' | 'revert' },
  ) {
    const { amount, action } = updateData;
    if (action === 'reserve') {
      return this.accountService.reserveBalance(accountId, amount);
    } else if (action === 'confirm') {
      return this.accountService.confirmReservation(accountId, amount);
    } else if (action === 'revert') {
      return this.accountService.revertReservation(accountId, amount);
    }
  }

  @Get('/:accountId/balance')
  async getBalanceAndDailySpend(@Param('accountId') accountId: string) {
    const account = await this.accountService.findAccountById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    return {
      balance: account.balance,
      dailyLimit: account.dailyLimit,
    };
  }
}
