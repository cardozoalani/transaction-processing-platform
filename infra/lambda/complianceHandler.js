const axios = require('axios');

const COMPLIANCE_SERVICE_URL = 'http://10.101.94.12:3002/compliance/validate';

exports.handler = async (event) => {
  for (const record of event.Records) {
    const { transactionId } = JSON.parse(record.body);

    try {
      const complianceUrl = `${COMPLIANCE_SERVICE_URL}/${transactionId}`;
      await axios.post(complianceUrl);
      console.log(`Transaction ${transactionId} sent to compliance service.`);
    } catch (error) {
      console.error(`Failed to process transaction ${transactionId}:`, error);
    }
  }
};
