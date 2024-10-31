import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from '../transaction.controller';
import { TransactionService } from '../../../domain/services/transaction.service';
import { AccountApiClient } from '../../../infrastructure/clients/account-api.client';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import {
  FraudCheckStatus,
  TransactionStatus,
} from '../../../domain/types/transaction.types';

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionService: TransactionService;
  let accountApiClient: AccountApiClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            createTransaction: jest.fn().mockResolvedValue({
              transactionId: 'tx123',
              status: 'pending',
            }),
            findAllTransactionsByAccountId: jest
              .fn()
              .mockResolvedValue([
                { transactionId: 'tx123', amount: 100, currency: 'USD' },
              ]),
            findTransactionById: jest.fn().mockResolvedValue({
              transactionId: 'tx123',
              amount: 100,
              currency: 'USD',
            }),
            updateTransactionStatus: jest.fn(),
          },
        },
        {
          provide: AccountApiClient,
          useValue: {
            checkBalanceAndDailyLimit: jest.fn().mockResolvedValue(true),
            reserveBalance: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    transactionService = module.get<TransactionService>(TransactionService);
    accountApiClient = module.get<AccountApiClient>(AccountApiClient);
  });

  it('should create a new transaction', async () => {
    const transactionDto: CreateTransactionDto = {
      accountId: 'account123',
      amount: 100,
      currency: 'USD',
      transactionType: 'debit',
    };

    const result = await controller.createTransaction(transactionDto);
    expect(accountApiClient.checkBalanceAndDailyLimit).toHaveBeenCalledWith(
      'account123',
      100,
    );
    expect(accountApiClient.reserveBalance).toHaveBeenCalledWith(
      'account123',
      100,
    );
    expect(transactionService.createTransaction).toHaveBeenCalledWith(
      'account123',
      100,
      'USD',
      'debit',
    );
    expect(result).toEqual({
      transactionId: 'tx123',
      status: 'pending',
    });
  });

  it('should get all transactions by account ID', async () => {
    const result = await controller.getTransactionsByAccountId('accountId');
    expect(
      transactionService.findAllTransactionsByAccountId,
    ).toHaveBeenCalledWith('accountId');
    expect(result).toEqual([
      { transactionId: 'tx123', amount: 100, currency: 'USD' },
    ]);
  });

  it('should get a transaction by ID', async () => {
    const result = await controller.getTransactionById('tx123');
    expect(transactionService.findTransactionById).toHaveBeenCalledWith(
      'tx123',
    );
    expect(result).toEqual({
      transactionId: 'tx123',
      amount: 100,
      currency: 'USD',
    });
  });

  it('should update transaction status', async () => {
    const updateData = {
      fraudCheckStatus: 'approved' as FraudCheckStatus,
      status: 'completed' as TransactionStatus,
    };
    await controller.updateTransactionStatus('tx123', updateData);
    expect(transactionService.updateTransactionStatus).toHaveBeenCalledWith(
      'tx123',
      'approved',
      'completed',
    );
  });
});
