import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TransactionService } from '../../domain/services/transaction.service';
import { AccountApiClient } from '../../infrastructure/clients/account-api.client';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import {
  FraudCheckStatus,
  TransactionStatus,
} from '../../domain/types/transaction.types';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly accountApiClient: AccountApiClient,
  ) {}

  @Post()
  async createTransaction(@Body() transactionDto: CreateTransactionDto) {
    const hasSufficientBalance =
      await this.accountApiClient.checkBalanceAndDailyLimit(
        transactionDto.accountId,
        transactionDto.amount,
      );

    if (!hasSufficientBalance) {
      throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
    }

    await this.accountApiClient.reserveBalance(
      transactionDto.accountId,
      transactionDto.amount,
    );

    const transaction = await this.transactionService.createTransaction(
      transactionDto.accountId,
      transactionDto.amount,
      transactionDto.currency,
      transactionDto.transactionType,
    );

    return {
      transactionId: transaction.transactionId,
      status: transaction.status,
    };
  }

  @Get('/account/:accountId')
  async getTransactionsByAccountId(@Param('accountId') accountId: string) {
    const transactions =
      await this.transactionService.findAllTransactionsByAccountId(accountId);
    return transactions;
  }

  @Get('/average-amount')
  async getAverageTransactionAmount(
    @Query('accountId') accountId: string,
    @Query('days') days: number,
  ) {
    return this.transactionService.getAverageTransactionAmount(accountId, days);
  }

  @Get('/recent-failures')
  async getRecentFailures(
    @Query('accountId') accountId: string,
    @Query('hours') hours: number,
  ) {
    return this.transactionService.getRecentFailures(accountId, hours);
  }

  @Get('/recent-count')
  async getRecentTransactionCount(
    @Query('accountId') accountId: string,
    @Query('minutes') minutes: number,
  ) {
    return this.transactionService.getRecentTransactionCount(
      accountId,
      minutes,
    );
  }

  @Get('/last-location')
  async getLastTransactionLocation(@Query('accountId') accountId: string) {
    return this.transactionService.getLastTransactionLocation(accountId);
  }

  @Patch('/:transactionId/status')
  async updateTransactionStatus(
    @Param('transactionId') transactionId: string,
    @Body()
    updateData: {
      fraudCheckStatus: FraudCheckStatus;
      status: TransactionStatus;
    },
  ) {
    return this.transactionService.updateTransactionStatus(
      transactionId,
      updateData.fraudCheckStatus,
      updateData.status,
    );
  }

  @Get('/:transactionId')
  async getTransactionById(@Param('transactionId') transactionId: string) {
    const transaction =
      await this.transactionService.findTransactionById(transactionId);
    return transaction;
  }
}
