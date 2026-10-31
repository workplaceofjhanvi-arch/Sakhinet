const test = require('node:test');
const assert = require('node:assert');

const API = process.env.API_URL || 'http://localhost:5000';
const COLLEGE_ID = '11111111-1111-1111-1111-111111111111';
const REQUESTER_ID = '22222222-2222-2222-2222-222222222222';
const VOLUNTEER_ID = '33333333-3333-3333-3333-333333333333';

async function call(path, method = 'GET', body) {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() };
}

let requestId;
let responseId;

test('T1 health check', async () => {
  const r = await call('/api/health');
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.data.status, 'ok');
});

test('T2 create a request', async () => {
  const r = await call('/api/requests', 'POST', {
    college_id: COLLEGE_ID,
    requester_id: REQUESTER_ID,
    type: 'pad',
    location_note: 'Test block',
  });
  assert.strictEqual(r.status, 201);
  assert.strictEqual(r.data.status, 'open');
  requestId = r.data.id;
});

test('T3 create a request without college_id fails', async () => {
  const r = await call('/api/requests', 'POST', { type: 'pad' });
  assert.strictEqual(r.status, 400);
});

test('T4 list open requests', async () => {
  const r = await call('/api/requests?college_id=' + COLLEGE_ID);
  assert.strictEqual(r.status, 200);
  assert.ok(r.data.some((x) => x.id === requestId));
});

test('T5 volunteer accepts the request', async () => {
  const r = await call('/api/responses', 'POST', { request_id: requestId, volunteer_id: VOLUNTEER_ID });
  assert.strictEqual(r.status, 201);
  responseId = r.data.id;
});

test('T6 accepting an already accepted request fails', async () => {
  const r = await call('/api/responses', 'POST', { request_id: requestId, volunteer_id: VOLUNTEER_ID });
  assert.strictEqual(r.status, 400);
});

test('T7 both sides confirm and points are awarded', async () => {
  await call('/api/responses/' + responseId + '/confirm', 'POST', { by: 'requester' });
  const r = await call('/api/responses/' + responseId + '/confirm', 'POST', { by: 'volunteer' });
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.data.status, 'completed');
  assert.strictEqual(r.data.points_awarded, 10);
});

test('T8 washroom filter returns only washrooms with a dustbin', async () => {
  const r = await call('/api/washrooms?college_id=' + COLLEGE_ID + '&has_dustbin=true');
  assert.strictEqual(r.status, 200);
  assert.ok(r.data.length > 0);
  assert.ok(r.data.every((w) => w.has_dustbin === true));
});

test('T9 leaderboard is sorted by points and has badges', async () => {
  const r = await call('/api/rewards/leaderboard?college_id=' + COLLEGE_ID);
  assert.strictEqual(r.status, 200);
  assert.ok(r.data.length > 0);
  assert.ok(r.data[0].badge);
  for (let i = 1; i < r.data.length; i++) {
    assert.ok(r.data[i - 1].points >= r.data[i].points);
  }
});

test('T10 dashboard returns totals', async () => {
  const r = await call('/api/dashboard?college_id=' + COLLEGE_ID);
  assert.strictEqual(r.status, 200);
  assert.ok(r.data.total_requests >= 1);
  assert.ok(r.data.by_status);
});