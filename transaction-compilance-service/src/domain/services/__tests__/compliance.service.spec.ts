import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceServiceImpl } from '../compliance.service.impl';
import { TransactionApiClient } from '../../../infrastructure/clients/transaction-api.client';
import { AccountApiClient } from '../../../infrastructure/clients/account-api.client';
import { TransactionComplianceDetails } from '../../types/transaction-compliance.types';

describe('ComplianceServiceImpl', () => {
  let service: ComplianceServiceImpl;
  let transactionApiClient: TransactionApiClient;
  let accountApiClient: AccountApiClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceServiceImpl,
        {
          provide: TransactionApiClient,
          useValue: {
            getTransactionDetails: jest.fn(),
            updateTransactionStatus: jest.fn(),
            getAverageTransactionAmount: jest.fn(),
            getRecentFailures: jest.fn(),
            getRecentTransactionCount: jest.fn(),
            getLastTransactionLocation: jest.fn(),
          },
        },
        {
          provide: AccountApiClient,
          useValue: {
            confirmReservation: jest.fn(),
            revertReservation: jest.fn(),
          },
        },
        {
          provide: 'ITimeZoneService',
          useValue: {
            getLocalHour: jest.fn().mockReturnValue(12),
          },
        },
      ],
    }).compile();

    service = module.get<ComplianceServiceImpl>(ComplianceServiceImpl);
    transactionApiClient =
      module.get<TransactionApiClient>(TransactionApiClient);
    accountApiClient = module.get<AccountApiClient>(AccountApiClient);
  });

  it('should approve a transaction if within limits', async () => {
    const transactionId = 'tx123';
    const transactionDetails: TransactionComplianceDetails = {
      transactionId,
      accountId: 'account123',
      amount: 100,
      currency: 'USD',
      transactionType: 'debit',
    };

    jest
      .spyOn(transactionApiClient, 'getTransactionDetails')
      .mockResolvedValue(transactionDetails);
    jest
      .spyOn(transactionApiClient, 'getAverageTransactionAmount')
      .mockResolvedValue(500);
    jest.spyOn(transactionApiClient, 'getRecentFailures').mockResolvedValue(1);
    jest
      .spyOn(transactionApiClient, 'getRecentTransactionCount')
      .mockResolvedValue(5);
    jest
      .spyOn(transactionApiClient, 'getLastTransactionLocation')
      .mockResolvedValue('New York, USA');

    const result = await service.assessTransactionById(transactionId);

    expect(result).toBe('approved');
    expect(accountApiClient.confirmReservation).toHaveBeenCalledWith(
      'account123',
      100,
    );
    expect(transactionApiClient.updateTransactionStatus).toHaveBeenCalledWith(
      transactionId,
      'approved',
      'completed',
    );
  });

  it('should reject a transaction if it exceeds the limit', async () => {
    const transactionId = 'tx124';
    const transactionDetails: TransactionComplianceDetails = {
      transactionId,
      accountId: 'account123',
      amount: 10000,
      currency: 'USD',
      transactionType: 'debit',
    };

    jest
      .spyOn(transactionApiClient, 'getTransactionDetails')
      .mockResolvedValue(transactionDetails);
    jest
      .spyOn(transactionApiClient, 'getAverageTransactionAmount')
      .mockResolvedValue(500);

    const result = await service.assessTransactionById(transactionId);

    expect(result).toBe('rejected');
    expect(accountApiClient.revertReservation).toHaveBeenCalledWith(
      'account123',
      10000,
    );
    expect(transactionApiClient.updateTransactionStatus).toHaveBeenCalledWith(
      transactionId,
      'rejected',
      'failed',
    );
  });

  it('should skip fraud check if transaction already processed', async () => {
    const transactionId = 'tx125';
    const transactionDetails: TransactionComplianceDetails = {
      transactionId,
      accountId: 'account123',
      amount: 500,
      currency: 'USD',
      transactionType: 'debit',
      fraudCheckStatus: 'approved',
    };

    jest
      .spyOn(transactionApiClient, 'getTransactionDetails')
      .mockResolvedValue(transactionDetails);

    const result = await service.assessTransactionById(transactionId);

    expect(result).toBe('approved');
    expect(transactionApiClient.updateTransactionStatus).not.toHaveBeenCalled();
    expect(accountApiClient.confirmReservation).not.toHaveBeenCalled();
  });

  it('should reject transaction if location is suspicious', async () => {
    const transactionId = 'tx126';
    const transactionDetails: TransactionComplianceDetails = {
      transactionId,
      accountId: 'account123',
      amount: 500,
      currency: 'USD',
      transactionType: 'debit',
      metadata: { location: 'Los Angeles, USA' },
    };

    jest
      .spyOn(transactionApiClient, 'getTransactionDetails')
      .mockResolvedValue(transactionDetails);
    jest
      .spyOn(transactionApiClient, 'getLastTransactionLocation')
      .mockResolvedValue('New York, USA');

    const result = await service.assessTransactionById(transactionId);

    expect(result).toBe('rejected');
    expect(accountApiClient.revertReservation).toHaveBeenCalledWith(
      'account123',
      500,
    );
    expect(transactionApiClient.updateTransactionStatus).toHaveBeenCalledWith(
      transactionId,
      'rejected',
      'failed',
    );
  });
});
