import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AccountApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.ACCOUNT_SERVICE_URL ||
      'http://account-service.default.svc.cluster.local:3001';
  }

  async checkBalanceAndDailyLimit(
    accountId: string,
    amount: number,
  ): Promise<boolean> {
    try {
      const response = await axios.get<{
        balance: number;
        dailyLimit: number;
      }>(`${this.baseUrl}/accounts/${accountId}/balance`);

      const { balance, dailyLimit } = response.data;

      const hasSufficientBalance = balance >= amount;
      const withinDailyLimit = dailyLimit >= amount;

      return hasSufficientBalance && withinDailyLimit;
    } catch (error) {
      console.error('Failed to check balance and daily limit:', error);
      throw new HttpException(
        'Failed to check balance and daily limit',
        error.response?.status || 500,
      );
    }
  }

  async reserveBalance(accountId: string, amount: number): Promise<void> {
    try {
      await axios.patch(`${this.baseUrl}/accounts/${accountId}/balance`, {
        amount,
        action: 'reserve',
      });
    } catch (error) {
      console.error('Failed to reserve balance:', error);
      throw new HttpException(
        'Failed to reserve balance',
        error.response?.status || 500,
      );
    }
  }
}
