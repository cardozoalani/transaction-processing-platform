import { Module } from '@nestjs/common';
import { AccountModule } from './account.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(), AccountModule],
})
export class AppModule {}
