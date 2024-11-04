import { Module } from '@nestjs/common';
import { ComplianceModule } from './compliance.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [ComplianceModule, MetricsModule],
})
export class AppModule {}
