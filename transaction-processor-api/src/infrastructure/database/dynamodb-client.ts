import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint:
    process.env.DYNAMODB_ENDPOINT ||
    'http://localstack.default.svc.cluster.local:4566',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

const dynamoDbClient = DynamoDBDocumentClient.from(client);

export default dynamoDbClient;
