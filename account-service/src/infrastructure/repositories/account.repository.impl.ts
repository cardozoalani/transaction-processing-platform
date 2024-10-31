import { Injectable } from '@nestjs/common';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { Account } from '../../domain/entities/account.entity';

@Injectable()
export class AccountRepositoryImpl implements AccountRepository {
  private accounts = new Map<string, Account>();

  async findById(accountId: string): Promise<Account | null> {
    return this.accounts.get(accountId) || null;
  }

  async findAll(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async save(account: Account): Promise<void> {
    this.accounts.set(account.accountId, account);
  }

  async update(account: Account): Promise<void> {
    if (!this.accounts.has(account.accountId)) {
      throw new Error('Account not found');
    }
    this.accounts.set(account.accountId, account);
  }

  async getDailySpent(accountId: string): Promise<number> {
    const account = await this.findById(accountId);
    if (!account) throw new Error('Account not found');
    return 500;
  }

  async verifyAccount(accountId: string): Promise<void> {
    const account = await this.findById(accountId);
    if (!account) throw new Error('Account not found');
    const verifiedAccount = account.verifyAccount();
    await this.update(verifiedAccount);
  }

  async reserveBalance(accountId: string, amount: number): Promise<void> {
    const account = await this.findById(accountId);
    if (!account) throw new Error('Account not found');
    const updatedAccount = account.reserveBalance(amount);
    await this.update(updatedAccount);
  }

  async confirmReservation(accountId: string, amount: number): Promise<void> {
    const account = await this.findById(accountId);
    if (!account || account.reservedAmount < amount) {
      throw new Error('Invalid reservation');
    }
    const updatedAccount = account.confirmReservation(amount);
    await this.update(updatedAccount);
  }

  async revertReservation(accountId: string, amount: number): Promise<void> {
    const account = await this.findById(accountId);
    if (!account || account.reservedAmount < amount) {
      throw new Error('Invalid reservation');
    }
    const updatedAccount = account.revertReservation(amount);
    await this.update(updatedAccount);
  }

  async resetDailyLimits(): Promise<void> {
    const accounts = await this.findAll();
    for (const account of accounts) {
      const resetAccount = account.resetDailyLimit();
      await this.update(resetAccount);
    }
  }
}
