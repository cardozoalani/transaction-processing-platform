import { NestFactory } from '@nestjs/core';
import { ComplianceModule } from './compliance.module';

async function bootstrap() {
  const app = await NestFactory.create(ComplianceModule);
  await app.listen(process.env.PORT || 3002);
  console.log('Transaction Compliance Service is running on port 3002');
}

bootstrap();
