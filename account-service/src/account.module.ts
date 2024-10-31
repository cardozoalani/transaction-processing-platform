import { Module } from '@nestjs/common';
import { AccountService } from './domain/services/account.service';
import { AccountRepositoryImpl } from './infrastructure/repositories/account.repository.impl';
import { ACCOUNT_REPOSITORY_TOKEN } from './domain/constants/account.constants';
import { AccountController } from './application/controllers/account.controller';
import { AccountCronService } from './application/services/account-cron.service';

@Module({
  controllers: [AccountController],
  providers: [
    AccountService,
    AccountCronService,
    {
      provide: ACCOUNT_REPOSITORY_TOKEN,
      useClass: AccountRepositoryImpl,
    },
  ],
  exports: [ACCOUNT_REPOSITORY_TOKEN],
})
export class AccountModule {}
