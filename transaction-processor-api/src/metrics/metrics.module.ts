import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsMiddleware } from './metrics.middleware';
import * as client from 'prom-client';

@Module({
  controllers: [MetricsController],
})
export class MetricsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    client.collectDefaultMetrics();
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
