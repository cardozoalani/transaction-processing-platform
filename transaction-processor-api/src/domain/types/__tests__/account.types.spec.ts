import { AccountStatus, ACCOUNT_STATUSES } from '../account.types';

describe('Account Types', () => {
  it('should have valid account statuses', () => {
    const validStatuses: AccountStatus[] = ['active', 'suspended', 'closed'];
    expect(ACCOUNT_STATUSES).toEqual(validStatuses);
  });
});
