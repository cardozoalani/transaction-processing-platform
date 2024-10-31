import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AccountService } from '../../domain/services/account.service';

@Injectable()
export class AccountCronService {
  constructor(private readonly accountService: AccountService) {}

  @Cron('0 0 * * *')
  async resetDailyLimits(): Promise<void> {
    console.log('Executing daily limit reset for all accounts');
    await this.accountService.resetAllDailyLimits();
  }
}
