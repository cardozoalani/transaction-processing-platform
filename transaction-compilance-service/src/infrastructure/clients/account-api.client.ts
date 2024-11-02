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

  async confirmReservation(accountId: string, amount: number): Promise<void> {
    try {
      await axios.patch(`${this.baseUrl}/accounts/${accountId}/balance`, {
        amount,
        action: 'confirm',
      });
    } catch (error) {
      console.error('Failed to confirm reservation:', error);
      throw new HttpException(
        'Failed to confirm reservation',
        error.response?.status || 500,
      );
    }
  }

  async revertReservation(accountId: string, amount: number): Promise<void> {
    try {
      await axios.patch(`${this.baseUrl}/accounts/${accountId}/balance`, {
        amount,
        action: 'revert',
      });
    } catch (error) {
      console.error('Failed to revert reservation:', error);
      throw new HttpException(
        'Failed to revert reservation',
        error.response?.status || 500,
      );
    }
  }
}
