import { ComplianceResult } from '../types/transaction-compliance.types';

export interface ComplianceService {
  assessTransactionById(transactionId: string): Promise<ComplianceResult>;
}
