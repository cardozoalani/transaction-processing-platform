import { Inject, Injectable } from '@nestjs/common';
import { ComplianceService } from '../interfaces/compliance.service';
import { TransactionComplianceDetails } from '../types/transaction-compliance.types';
import { TransactionApiClient } from '../../infrastructure/clients/transaction-api.client';
import { ITimeZoneService } from '../../infrastructure/services/timezone.service.interface';
import { AccountApiClient } from '../../infrastructure/clients/account-api.client';

@Injectable()
export class ComplianceServiceImpl implements ComplianceService {
  constructor(
    private readonly transactionApiClient: TransactionApiClient,
    private readonly accountApiClient: AccountApiClient,
    @Inject('ITimeZoneService')
    private readonly timeZoneService: ITimeZoneService,
  ) {}

  async assessTransactionById(
    transactionId: string,
  ): Promise<'approved' | 'rejected'> {
    const transaction =
      await this.transactionApiClient.getTransactionDetails(transactionId);
    console.log(transaction);

    if (
      transaction.fraudCheckStatus === 'approved' ||
      transaction.fraudCheckStatus === 'rejected'
    ) {
      console.log(
        `Transaction ${transactionId} already processed with status: ${transaction.fraudCheckStatus}`,
      );
      return transaction.fraudCheckStatus === 'approved'
        ? 'approved'
        : 'rejected';
    }

    const result = await this.detectFraud(transaction);

    if (result === 'approved') {
      await this.accountApiClient.confirmReservation(
        transaction.accountId,
        transaction.amount,
      );
    } else {
      await this.accountApiClient.revertReservation(
        transaction.accountId,
        transaction.amount,
      );
    }

    await this.transactionApiClient.updateTransactionStatus(
      transactionId,
      result === 'approved' ? 'approved' : 'rejected',
      result === 'approved' ? 'completed' : 'failed',
    );

    return result;
  }

  private async detectFraud(
    transaction: TransactionComplianceDetails,
  ): Promise<'approved' | 'rejected'> {
    console.log(transaction);
    const { accountId, amount, metadata } = transaction;

    if (await this.isExcessiveAmountComparedToAverage(accountId, amount)) {
      console.log(
        `Transaction rejected: amount ${amount} is excessive compared to average for account ${accountId}.`,
      );
      return 'rejected';
    }

    if (await this.hasRecentFailures(accountId)) {
      console.log(
        `Transaction rejected: account ${accountId} has too many recent failures.`,
      );
      return 'rejected';
    }

    if (await this.hasHighRecentTransactionFrequency(accountId)) {
      console.log(
        `Transaction rejected: account ${accountId} has high recent transaction frequency.`,
      );
      return 'rejected';
    }

    if (await this.isSuspiciousLocation(accountId, transaction)) {
      console.log(
        `Transaction rejected: suspicious location for account ${accountId}.`,
      );
      return 'rejected';
    }

    if (await this.isUnusualSpendingPattern(accountId, amount)) {
      console.log(
        `Transaction rejected: unusual spending pattern detected for account ${accountId}.`,
      );
      return 'rejected';
    }

    const transactionHour = this.getTransactionHour(
      metadata?.timezone || 'America/Argentina/Buenos_Aires',
    );
    if (transactionHour >= 2 && transactionHour < 6) {
      console.log(
        `Transaction rejected: transaction made at high-risk hour ${transactionHour} (0-6) in timezone ${metadata?.timezone || 'UTC'}.`,
      );
      return 'rejected';
    }

    console.log(`Transaction approved for account ${accountId}.`);
    return 'approved';
  }

  private async isExcessiveAmountComparedToAverage(
    accountId: string,
    amount: number,
  ): Promise<boolean> {
    const averageTransaction =
      await this.transactionApiClient.getAverageTransactionAmount(
        accountId,
        30,
      );

    if (averageTransaction === 0) {
      console.log(
        `First transaction for account ${accountId}. Skipping excessive amount check.`,
      );
      return false;
    }

    return amount > averageTransaction * 5;
  }

  private async hasRecentFailures(accountId: string): Promise<boolean> {
    const recentFailures = await this.transactionApiClient.getRecentFailures(
      accountId,
      24,
    );
    return recentFailures >= 3;
  }

  private async hasHighRecentTransactionFrequency(
    accountId: string,
  ): Promise<boolean> {
    const recentTransactions =
      await this.transactionApiClient.getRecentTransactionCount(accountId, 10);
    return recentTransactions >= 10;
  }

  private async isSuspiciousLocation(
    accountId: string,
    transaction: TransactionComplianceDetails,
  ): Promise<boolean> {
    const lastKnownLocation =
      await this.transactionApiClient.getLastTransactionLocation(accountId);
    const currentLocation = transaction.metadata?.location;
    return (
      lastKnownLocation &&
      currentLocation &&
      lastKnownLocation !== currentLocation
    );
  }

  private async isUnusualSpendingPattern(
    accountId: string,
    amount: number,
  ): Promise<boolean> {
    const averageTransaction =
      await this.transactionApiClient.getAverageTransactionAmount(
        accountId,
        30,
      );
    if (averageTransaction === 0) {
      console.log(
        `First transaction for account ${accountId}. Skipping excessive amount check.`,
      );
      return false;
    }
    if (amount > averageTransaction * 5) return true;

    const recentTransactionCount =
      await this.transactionApiClient.getRecentTransactionCount(accountId, 60);
    if (recentTransactionCount >= 10) return true;
  }

  private getTransactionHour(timezone: string): number {
    return this.timeZoneService.getLocalHour(new Date(), timezone);
  }
}
