import { Injectable } from '@nestjs/common';
import { TransactionRepository } from '../../domain/repositories/transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';
import dynamoDbClient from '../database/dynamodb-client';
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class TransactionRepositoryImpl implements TransactionRepository {
  private readonly tableName = 'TransactionTable';

  async save(transaction: Transaction): Promise<void> {
    await dynamoDbClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          transactionId: transaction.transactionId,
          accountId: transaction.accountId,
          amount: transaction.amount,
          currency: transaction.currency,
          transactionType: transaction.transactionType,
          status: transaction.status,
          fraudCheckStatus: transaction.fraudCheckStatus,
          attempts: transaction.attempts,
          createdAt: transaction.createdAt.toISOString(),
          updatedAt: transaction.updatedAt.toISOString(),
          metadata: transaction.metadata,
        },
      }),
    );
  }

  async update(transaction: Transaction): Promise<void> {
    await dynamoDbClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { transactionId: transaction.transactionId },
        UpdateExpression:
          'SET #status = :status, #updatedAt = :updatedAt, #fraudCheckStatus = :fraudCheckStatus, #attempts = :attempts',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#updatedAt': 'updatedAt',
          '#fraudCheckStatus': 'fraudCheckStatus',
          '#attempts': 'attempts',
        },
        ExpressionAttributeValues: {
          ':status': transaction.status,
          ':updatedAt': new Date().toISOString(),
          ':fraudCheckStatus': transaction.fraudCheckStatus,
          ':attempts': transaction.attempts,
        },
      }),
    );
  }

  async findById(transactionId: string): Promise<Transaction | null> {
    const result = await dynamoDbClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { transactionId },
      }),
    );

    if (!result.Item) return null;

    return new Transaction(
      result.Item.transactionId,
      result.Item.accountId,
      result.Item.amount,
      result.Item.currency,
      result.Item.transactionType,
      result.Item.status,
      result.Item.fraudCheckStatus,
      result.Item.attempts,
      new Date(result.Item.createdAt),
      new Date(result.Item.updatedAt),
      result.Item.metadata,
    );
  }

  async findAllByAccountId(accountId: string): Promise<Transaction[]> {
    const result = await dynamoDbClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'AccountIdIndex',
        KeyConditionExpression: 'accountId = :accountId',
        ExpressionAttributeValues: {
          ':accountId': accountId,
        },
      }),
    );

    return result.Items
      ? result.Items.map(
          (item) =>
            new Transaction(
              item.transactionId,
              item.accountId,
              item.amount,
              item.currency,
              item.transactionType,
              item.status,
              item.fraudCheckStatus,
              item.attempts,
              new Date(item.createdAt),
              new Date(item.updatedAt),
              item.metadata,
            ),
        )
      : [];
  }

  async calculateAverageTransactionAmount(
    accountId: string,
    days: number,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const transactions = await this.findAllByAccountId(accountId);
    const relevantTransactions = transactions.filter(
      (transaction) =>
        transaction.createdAt >= cutoffDate &&
        transaction.fraudCheckStatus === 'approved' &&
        transaction.status === 'completed',
    );

    const totalAmount = relevantTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0,
    );

    return relevantTransactions.length
      ? totalAmount / relevantTransactions.length
      : 0;
  }

  async countRecentFailures(accountId: string, hours: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const transactions = await this.findAllByAccountId(accountId);
    return transactions.filter(
      (transaction) =>
        transaction.createdAt >= cutoffDate && transaction.status === 'failed',
    ).length;
  }

  async countRecentTransactions(
    accountId: string,
    minutes: number,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setMinutes(cutoffDate.getMinutes() - minutes);

    const transactions = await this.findAllByAccountId(accountId);
    return transactions.filter(
      (transaction) => transaction.createdAt >= cutoffDate,
    ).length;
  }

  async findLastTransactionLocation(accountId: string): Promise<string | null> {
    const transactions = await this.findAllByAccountId(accountId);
    const sortedTransactions = transactions
      .filter((transaction) => transaction.metadata?.location)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return sortedTransactions.length
      ? sortedTransactions[0].metadata?.location || null
      : null;
  }
}
