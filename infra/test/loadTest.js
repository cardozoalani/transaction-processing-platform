import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('errors');

const ACCOUNT_URL = 'http://accounts.tiendadata.com/accounts';
const TRANSACTION_URL = 'http://transactions.tiendadata.com/transactions';

function createAccount() {
  const payload = JSON.stringify({
    balance: 5000,
    owner: `user${__VU}`,
    currency: 'USD',
    dailyLimit: 10000,
  });

  const params = { headers: { 'Content-Type': 'application/json' } };

  const res = http.post(ACCOUNT_URL, payload, params);
  const accountId = res.json('accountId');

  check(res, { 'account created': (r) => r.status === 200 }) || errorRate.add(1);

  return accountId;
}

function createTransaction(accountId) {
  const payload = JSON.stringify({
    accountId: accountId,
    amount: 100,
    currency: 'USD',
    transactionType: 'debit',
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post(TRANSACTION_URL, payload, params);

  check(res, { 'transaction created': (r) => r.status === 200 }) || errorRate.add(1);
}

export let options = {
  vus: 10,
  duration: '1m',
};

export default function () {
  const accountId = createAccount();

  sleep(1);

  createTransaction(accountId);

  sleep(1);
}
