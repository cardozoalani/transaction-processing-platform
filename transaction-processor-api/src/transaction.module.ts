import { Module } from '@nestjs/common';
import { TransactionController } from './application/controllers/transaction.controller';
import { TransactionService } from './domain/services/transaction.service';
import { TRANSACTION_REPOSITORY_TOKEN } from './domain/constants/transaction.constants';
import { TransactionRepositoryImpl } from './infrastructure/repositories/transaction.repository.impl';
import { AccountApiClient } from './infrastructure/clients/account-api.client';

@Module({
  controllers: [TransactionController],
  providers: [
    TransactionService,
    AccountApiClient,
    {
      provide: TRANSACTION_REPOSITORY_TOKEN,
      useClass: TransactionRepositoryImpl,
    },
  ],
  exports: [TRANSACTION_REPOSITORY_TOKEN],
})
export class TransactionModule {}
