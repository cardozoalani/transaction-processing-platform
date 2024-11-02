import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SQSService {
  private client: SQSClient;
  private queueUrl: string;

  constructor() {
    this.client = new SQSClient({
      region: 'us-east-1',
      endpoint: 'http://localstack.default.svc.cluster.local:4566',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });
    this.queueUrl =
      process.env.SQS_QUEUE_URL ||
      'http://localstack.default.svc.cluster.local:4566/000000000000/transaction-queue';
  }

  async enqueueTransaction(transactionId: string) {
    const params = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify({ transactionId }),
    };

    try {
      const command = new SendMessageCommand(params);
      await this.client.send(command);
      console.log(
        `Transaction ${transactionId} enqueued for compliance validation`,
      );
    } catch (error) {
      console.error('Error enqueuing transaction:', error);
      throw error;
    }
  }
}
