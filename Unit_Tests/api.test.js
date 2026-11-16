const { test, before, after } = require("node:test");
const assert = require("node:assert");
const app = require("../app");

let server, base;

before(() => new Promise((resolve) => {
  server = app.listen(0, () => {
    base = `http://localhost:${server.address().port}`;
    resolve();
  });
}));

after(() => server.close());

const post = (body, { raw = false, contentType = "application/json" } = {}) =>
  fetch(`${base}/convert`, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: raw ? body : JSON.stringify(body),
  });

test("200 and normalized body on valid request", async () => {
  const res = await post({ from: "cad", to: "usd", amount: 100.0 });
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { from: "CAD", to: "USD", amount: 100 });
});

test("400 with errors array on invalid amount", async () => {
  const res = await post({ from: "CAD", to: "USD", amount: -5 });
  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.ok(Array.isArray(body.errors));
  assert.strictEqual(body.errors.length, 1);
});

test("400 on missing fields", async () => {
  const res = await post({});
  assert.strictEqual(res.status, 400);
  assert.strictEqual((await res.json()).errors.length, 3);
});

test("400 on malformed JSON", async () => {
  const res = await post("{ not json", { raw: true });
  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(await res.json(), { errors: ["Invalid JSON body"] });
});

test("400 when Content-Type is not JSON", async () => {
  const res = await post("from=CAD", { raw: true, contentType: "text/plain" });
  assert.strictEqual(res.status, 400);
});