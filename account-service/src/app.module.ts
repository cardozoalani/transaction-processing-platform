import { Module } from '@nestjs/common';
import { AccountModule } from './account.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [ScheduleModule.forRoot(), AccountModule, MetricsModule],
})
export class AppModule {}
