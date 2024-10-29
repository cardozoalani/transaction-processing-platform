import { AccountStatus } from '../types/account.types';

export class Account {
  constructor(
    public readonly accountId: string,
    public balance: number,
    public readonly owner: string,
    public currency: string,
    public status: AccountStatus = 'active',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public dailyLimit: number = 1000,
    public isVerified: boolean = false,
    public metadata?: Record<string, any>,
  ) {}

  updateBalance(newBalance: number) {
    this.balance = newBalance;
    this.updatedAt = new Date();
  }

  changeStatus(newStatus: AccountStatus) {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  verifyAccount() {
    this.isVerified = true;
    this.updatedAt = new Date();
  }
}
