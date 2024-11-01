import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceController } from '../compliance.controller';
import { ComplianceServiceImpl } from '../../../domain/services/compliance.service.impl';

describe('ComplianceController', () => {
  let controller: ComplianceController;
  let service: ComplianceServiceImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplianceController],
      providers: [
        {
          provide: ComplianceServiceImpl,
          useValue: {
            assessTransactionById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ComplianceController>(ComplianceController);
    service = module.get<ComplianceServiceImpl>(ComplianceServiceImpl);
  });

  it('should validate and approve a transaction within limits by transactionId', async () => {
    const transactionId = 'tx123';

    jest.spyOn(service, 'assessTransactionById').mockResolvedValue('approved');

    const result = await controller.validateTransaction(transactionId);
    expect(result).toEqual({ result: 'approved' });
  });

  it('should validate and reject a transaction that exceeds the limit by transactionId', async () => {
    const transactionId = 'tx124';

    jest.spyOn(service, 'assessTransactionById').mockResolvedValue('rejected');

    const result = await controller.validateTransaction(transactionId);
    expect(result).toEqual({ result: 'rejected' });
  });
});
