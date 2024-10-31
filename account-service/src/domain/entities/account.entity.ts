import { AccountStatus } from '../types/account.types';

export class Account {
  private initialDailyLimit: number;
  constructor(
    public readonly accountId: string,
    public readonly balance: number,
    public readonly owner: string,
    public readonly currency: string,
    public readonly status: AccountStatus = 'active',
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly dailyLimit: number = 1000,
    public readonly isVerified: boolean = false,
    public readonly metadata?: Record<string, any>,
    public readonly reservedAmount: number = 0,
  ) {
    this.initialDailyLimit = dailyLimit;
  }

  updateBalance(newBalance: number): Account {
    return new Account(
      this.accountId,
      newBalance,
      this.owner,
      this.currency,
      this.status,
      this.createdAt,
      new Date(),
      this.dailyLimit,
      this.isVerified,
      this.metadata,
      this.reservedAmount,
    );
  }

  changeStatus(newStatus: AccountStatus): Account {
    return new Account(
      this.accountId,
      this.balance,
      this.owner,
      this.currency,
      newStatus,
      this.createdAt,
      new Date(),
      this.dailyLimit,
      this.isVerified,
      this.metadata,
      this.reservedAmount,
    );
  }

  verifyAccount(): Account {
    return new Account(
      this.accountId,
      this.balance,
      this.owner,
      this.currency,
      this.status,
      this.createdAt,
      new Date(),
      this.dailyLimit,
      true,
      this.metadata,
      this.reservedAmount,
    );
  }

  reserveBalance(amount: number): Account {
    return new Account(
      this.accountId,
      this.balance - amount,
      this.owner,
      this.currency,
      this.status,
      this.createdAt,
      new Date(),
      this.dailyLimit - amount,
      this.isVerified,
      this.metadata,
      this.reservedAmount + amount,
    );
  }

  confirmReservation(amount: number): Account {
    return new Account(
      this.accountId,
      this.balance,
      this.owner,
      this.currency,
      this.status,
      this.createdAt,
      new Date(),
      this.dailyLimit,
      this.isVerified,
      this.metadata,
      this.reservedAmount - amount,
    );
  }

  revertReservation(amount: number): Account {
    return new Account(
      this.accountId,
      this.balance + amount,
      this.owner,
      this.currency,
      this.status,
      this.createdAt,
      new Date(),
      this.dailyLimit + amount,
      this.isVerified,
      this.metadata,
      this.reservedAmount - amount,
    );
  }

  resetDailyLimit(): Account {
    return new Account(
      this.accountId,
      this.balance,
      this.owner,
      this.currency,
      this.status,
      this.createdAt,
      new Date(),
      this.initialDailyLimit,
      this.isVerified,
      this.metadata,
      this.reservedAmount,
    );
  }
}
