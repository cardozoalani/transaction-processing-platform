import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { TransactionComplianceDetails } from '../../domain/types/transaction-compliance.types';

@Injectable()
export class TransactionApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3000';
  }

  async getTransactionDetails(
    transactionId: string,
  ): Promise<TransactionComplianceDetails> {
    try {
      const response = await axios.get<TransactionComplianceDetails>(
        `${this.baseUrl}/transactions/${transactionId}`,
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to fetch transaction details from transaction service',
        error.response?.status || 500,
      );
    }
  }

  async getAverageTransactionAmount(
    accountId: string,
    days: number,
  ): Promise<number> {
    try {
      const response = await axios.get<number>(
        `${this.baseUrl}/transactions/average-amount?accountId=${accountId}&days=${days}`,
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to fetch average transaction amount',
        error.response?.status || 500,
      );
    }
  }

  async getRecentFailures(accountId: string, hours: number): Promise<number> {
    try {
      const response = await axios.get<number>(
        `${this.baseUrl}/transactions/recent-failures?accountId=${accountId}&hours=${hours}`,
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to fetch recent failures',
        error.response?.status || 500,
      );
    }
  }

  async getRecentTransactionCount(
    accountId: string,
    minutes: number,
  ): Promise<number> {
    try {
      const response = await axios.get<number>(
        `${this.baseUrl}/transactions/recent-count?accountId=${accountId}&minutes=${minutes}`,
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to fetch recent transaction count',
        error.response?.status || 500,
      );
    }
  }

  async getLastTransactionLocation(accountId: string): Promise<string | null> {
    try {
      const response = await axios.get<string | null>(
        `${this.baseUrl}/transactions/last-location?accountId=${accountId}`,
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to fetch last transaction location',
        error.response?.status || 500,
      );
    }
  }

  async updateTransactionStatus(
    transactionId: string,
    fraudCheckStatus: string,
    status: string,
  ): Promise<void> {
    try {
      await axios.patch(
        `${this.baseUrl}/transactions/${transactionId}/status`,
        {
          fraudCheckStatus,
          status,
        },
      );
    } catch (error) {
      console.error('Failed to update transaction status:', error);
      throw new HttpException(
        'Failed to update transaction status in transaction service',
        error.response?.status || 500,
      );
    }
  }
}
