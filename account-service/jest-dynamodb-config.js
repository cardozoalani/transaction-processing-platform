module.exports = {
  tables: [
    {
      TableName: 'AccountsTable',
      KeySchema: [{ AttributeName: 'accountId', KeyType: 'HASH' }],
      AttributeDefinitions: [
        { AttributeName: 'accountId', AttributeType: 'S' },
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    },
  ],
  port: 8000,
};
