import { Module } from '@nestjs/common';
import { ComplianceServiceImpl } from './domain/services/compliance.service.impl';
import { TransactionApiClient } from './infrastructure/clients/transaction-api.client';
import { ComplianceController } from './application/controllers/compliance.controller';
import { TimeZoneService } from './infrastructure/services/timezone.service';
import { AccountApiClient } from './infrastructure/clients/account-api.client';

@Module({
  controllers: [ComplianceController],
  providers: [
    ComplianceServiceImpl,
    TransactionApiClient,
    AccountApiClient,
    {
      provide: 'ITimeZoneService',
      useClass: TimeZoneService,
    },
  ],
})
export class ComplianceModule {}
