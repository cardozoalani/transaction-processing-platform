import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AccountRepository } from '../repositories/account.repository';
import { Account } from '../entities/account.entity';
import { ACCOUNT_REPOSITORY_TOKEN } from '../constants/account.constants';
import { AccountStatus } from '../types/account.types';

@Injectable()
export class AccountService {
  constructor(
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly accountRepository: AccountRepository,
  ) {}

  async createAccount(
    balance: number,
    dailyLimit: number,
    owner: string,
    currency: string,
  ): Promise<Account> {
    const accountId = uuidv4();
    const account = new Account(
      accountId,
      balance,
      dailyLimit,
      owner,
      currency,
    );
    await this.accountRepository.save(account);
    return account;
  }

  async findAccountById(accountId: string): Promise<Account | null> {
    return this.accountRepository.findById(accountId);
  }

  async updateBalance(accountId: string, newBalance: number): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) throw new Error('Account not found');

    const updatedAccount = account.updateBalance(newBalance);
    await this.accountRepository.update(updatedAccount);
  }

  async verifyAccount(accountId: string): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) throw new Error('Account not found');

    const verifiedAccount = account.verifyAccount();
    await this.accountRepository.update(verifiedAccount);
  }

  async changeAccountStatus(
    accountId: string,
    status: AccountStatus,
  ): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) throw new Error('Account not found');

    const updatedAccount = account.changeStatus(status);
    await this.accountRepository.update(updatedAccount);
  }

  async reserveBalance(accountId: string, amount: number): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) throw new Error('Account not found');
    if (account.balance < amount) throw new Error('Insufficient balance');
    if (account.dailyLimit < amount) throw new Error('Daily limit exceeded');

    const reservedAccount = account.reserveBalance(amount);
    await this.accountRepository.update(reservedAccount);
  }

  async confirmReservation(accountId: string, amount: number): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (!account || account.reservedAmount < amount) {
      throw new Error('Invalid reservation');
    }

    const confirmedAccount = account.confirmReservation(amount);
    await this.accountRepository.update(confirmedAccount);
  }

  async revertReservation(accountId: string, amount: number): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (!account || account.reservedAmount < amount) {
      throw new Error('Invalid reservation');
    }

    const revertedAccount = account.revertReservation(amount);
    await this.accountRepository.update(revertedAccount);
  }

  async resetAllDailyLimits(): Promise<void> {
    const accounts = await this.accountRepository.findAll();
    for (const account of accounts) {
      const resetAccount = account.resetDailyLimit();
      await this.accountRepository.update(resetAccount);
    }
  }
}
