module.exports = {
  tables: [
    {
      TableName: 'TransactionTable',
      KeySchema: [{ AttributeName: 'transactionId', KeyType: 'HASH' }],
      AttributeDefinitions: [
        { AttributeName: 'transactionId', AttributeType: 'S' },
        { AttributeName: 'accountId', AttributeType: 'S' },
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
      GlobalSecondaryIndexes: [
        {
          IndexName: 'AccountIdIndex',
          KeySchema: [{ AttributeName: 'accountId', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      ],
    },
  ],
  port: 8000,
};
