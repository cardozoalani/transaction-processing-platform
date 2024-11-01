import { Controller, Post, Param } from '@nestjs/common';
import { ComplianceServiceImpl } from '../../domain/services/compliance.service.impl';
import { ComplianceResult } from '../../domain/types/transaction-compliance.types';

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceServiceImpl) {}

  @Post('validate/:transactionId')
  async validateTransaction(
    @Param('transactionId') transactionId: string,
  ): Promise<{ result: ComplianceResult }> {
    const result =
      await this.complianceService.assessTransactionById(transactionId);
    return { result };
  }
}
