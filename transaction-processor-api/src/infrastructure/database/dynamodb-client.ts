import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isTestEnvironment = process.env.JEST_WORKER_ID !== undefined;
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(isTestEnvironment
    ? { endpoint: 'http://localhost:8000' }
    : process.env.NODE_ENV !== 'production' && {
        endpoint: 'http://localstack.default.svc.cluster.local:4566',
      }),
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
});

const dynamoDbClient = DynamoDBDocumentClient.from(client);

export default dynamoDbClient;
