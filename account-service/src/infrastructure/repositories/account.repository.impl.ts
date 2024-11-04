import { Injectable } from '@nestjs/common';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { Account } from '../../domain/entities/account.entity';
import dynamoDbClient from '../database/dynamodb-client';
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class AccountRepositoryImpl implements AccountRepository {
  private readonly tableName = 'AccountsTable';

  async findById(accountId: string): Promise<Account | null> {
    const result = await dynamoDbClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { accountId },
      }),
    );

    if (!result.Item) return null;

    return new Account(
      result.Item.accountId,
      result.Item.balance,
      result.Item.dailyLimit,
      result.Item.owner,
      result.Item.currency,
      result.Item.status,
      new Date(result.Item.createdAt),
      new Date(result.Item.updatedAt),
      result.Item.isVerified,
      result.Item.metadata,
      result.Item.reservedAmount,
    );
  }

  async findAll(): Promise<Account[]> {
    const result = await dynamoDbClient.send(
      new ScanCommand({ TableName: this.tableName }),
    );

    return result.Items
      ? result.Items.map(
          (item) =>
            new Account(
              item.accountId,
              item.balance,
              item.dailyLimit,
              item.owner,
              item.currency,
              item.status,
              new Date(item.createdAt),
              new Date(item.updatedAt),
              item.isVerified,
              item.metadata,
              item.reservedAmount,
            ),
        )
      : [];
  }

  async save(account: Account): Promise<void> {
    await dynamoDbClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          accountId: account.accountId,
          balance: account.balance,
          owner: account.owner,
          currency: account.currency,
          status: account.status,
          createdAt: account.createdAt.toISOString(),
          updatedAt: account.updatedAt.toISOString(),
          dailyLimit: account.dailyLimit,
          isVerified: account.isVerified,
          reservedAmount: account.reservedAmount,
          metadata: account.metadata,
        },
      }),
    );
  }

  async update(account: Account): Promise<void> {
    await dynamoDbClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { accountId: account.accountId },
        UpdateExpression: `
        SET #balance = :balance,
            #updatedAt = :updatedAt,
            #status = :status,
            #dailyLimit = :dailyLimit,
            #reservedAmount = :reservedAmount,
            #isVerified = :isVerified,
            #metadata = :metadata
      `,
        ExpressionAttributeNames: {
          '#balance': 'balance',
          '#updatedAt': 'updatedAt',
          '#status': 'status',
          '#dailyLimit': 'dailyLimit',
          '#reservedAmount': 'reservedAmount',
          '#isVerified': 'isVerified',
          '#metadata': 'metadata',
        },
        ExpressionAttributeValues: {
          ':balance': account.balance,
          ':updatedAt': new Date().toISOString(),
          ':status': account.status,
          ':dailyLimit': account.dailyLimit,
          ':reservedAmount': account.reservedAmount,
          ':isVerified': account.isVerified,
          ':metadata': account.metadata || {},
        },
      }),
    );
  }

  async verifyAccount(accountId: string): Promise<void> {
    await dynamoDbClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { accountId },
        UpdateExpression: 'SET #isVerified = :isVerified',
        ExpressionAttributeNames: { '#isVerified': 'isVerified' },
        ExpressionAttributeValues: { ':isVerified': true },
      }),
    );
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
