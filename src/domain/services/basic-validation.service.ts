import { ValidationService } from './validation.service';
import { Transaction } from '../entities/transaction.entity';
import { AccountRepository } from '../repositories/account.repository';
import { ITimeZoneService } from 'src/infrastructure/services/timezone.service.interface';

export class BasicValidationService implements ValidationService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly timeZoneService: ITimeZoneService,
  ) {}

  async validateBalance(accountId: string, amount: number): Promise<boolean> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    if (account.balance < amount) {
      return false;
    }

    const dailySpent = await this.accountRepository.getDailySpent(accountId);
    if (dailySpent + amount > account.dailyLimit) {
      return false;
    }

    await this.accountRepository.reserveAmount(accountId, amount);
    return true;
  }

  async detectFraud(transaction: Transaction): Promise<'pass' | 'fail'> {
    const { accountId, amount, transactionType, metadata } = transaction;
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    if (!account.isVerified && amount > 5000) {
      return 'fail';
    }

    const averageTransaction =
      await this.accountRepository.getAverageTransactionAmount(accountId, 30);
    if (amount > averageTransaction * 5) {
      return 'fail';
    }

    const recentFailures = await this.accountRepository.getRecentFailures(
      accountId,
      24,
    );
    if (recentFailures >= 3) {
      return 'fail';
    }

    const recentTransactions =
      await this.accountRepository.getRecentTransactionCount(accountId, 10);
    if (recentTransactions >= 10) {
      return 'fail';
    }

    if (await this.isSuspiciousLocation(accountId, transaction)) {
      return 'fail';
    }

    const timezone = metadata?.timezone || 'UTC';
    const transactionHour = this.timeZoneService.getLocalHour(
      new Date(),
      timezone,
    );
    if (transactionHour >= 0 && transactionHour < 6) return 'fail';

    return 'pass';
  }

  private async isSuspiciousLocation(
    accountId: string,
    transaction: Transaction,
  ): Promise<boolean> {
    const lastKnownLocation =
      await this.accountRepository.getLastTransactionLocation(accountId);
    const currentLocation = transaction.metadata?.location;

    if (
      lastKnownLocation &&
      currentLocation &&
      lastKnownLocation !== currentLocation
    ) {
      return true;
    }
    return false;
  }
}
