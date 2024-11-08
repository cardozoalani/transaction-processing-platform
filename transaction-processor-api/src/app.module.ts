import { Module } from '@nestjs/common';
import { TransactionModule } from './transaction.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [TransactionModule, MetricsModule],
})
export class AppModule {}
