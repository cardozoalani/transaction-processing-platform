import { BasicValidationService } from '../basic-validation.service';
import { AccountApiClient } from '../../../infrastructure/clients/account-api.client';

describe('BasicValidationService', () => {
  let service: BasicValidationService;
  let accountApiClient: jest.Mocked<AccountApiClient>;

  beforeEach(() => {
    accountApiClient = {
      baseUrl: 'http://mock-url',
      checkBalanceAndDailyLimit: jest.fn(),
      reserveBalance: jest.fn(),
    } as unknown as jest.Mocked<AccountApiClient>;

    service = new BasicValidationService(accountApiClient);
  });

  it('should validate balance if balance and daily limit are sufficient', async () => {
    accountApiClient.checkBalanceAndDailyLimit.mockResolvedValue(true);
    accountApiClient.reserveBalance.mockResolvedValue(undefined);

    const result = await service.validateBalance('acc123', 500);
    expect(result).toBe(true);
    expect(accountApiClient.checkBalanceAndDailyLimit).toHaveBeenCalledWith(
      'acc123',
      500,
    );
    expect(accountApiClient.reserveBalance).toHaveBeenCalledWith('acc123', 500);
  });

  it('should fail validation if balance is insufficient', async () => {
    accountApiClient.checkBalanceAndDailyLimit.mockResolvedValue(false);

    const result = await service.validateBalance('acc123', 6000);
    expect(result).toBe(false);
    expect(accountApiClient.checkBalanceAndDailyLimit).toHaveBeenCalledWith(
      'acc123',
      6000,
    );
    expect(accountApiClient.reserveBalance).not.toHaveBeenCalled();
  });
});
