import { Injectable } from '@nestjs/common';
import { AccountApiClient } from '../../infrastructure/clients/account-api.client';

@Injectable()
export class BasicValidationService {
  constructor(private readonly accountApiClient: AccountApiClient) {}

  async validateBalance(accountId: string, amount: number): Promise<boolean> {
    const canProceed = await this.accountApiClient.checkBalanceAndDailyLimit(
      accountId,
      amount,
    );
    if (!canProceed) {
      return false;
    }

    await this.accountApiClient.reserveBalance(accountId, amount);
    return true;
  }
}
