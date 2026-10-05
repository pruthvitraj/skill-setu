const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('../../server/src/app');

test('health route shape', async () => {
  const http = require('http');
  const server = http.createServer(request);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const res = await fetch(`http://127.0.0.1:${port}/api/health`);
  const json = await res.json();
  assert.equal(json.success, true);
  server.close();
});
