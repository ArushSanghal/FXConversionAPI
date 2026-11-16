const { test, before, after } = require("node:test");
const assert = require("node:assert");
const { createApp } = require("../app");

const servers = [];

function start(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      servers.push(server);
      resolve(`http://localhost:${server.address().port}`);
    });
  });
}

const fakeConvert = async () => ({ convertedAmount: 72, exchangeRate: 0.72 });

let baseOk;
let baseDefault;
let baseBadResult;

before(async () => {
  baseOk = await start(createApp({ convert: fakeConvert }));
  baseDefault = await start(createApp());
  baseBadResult = await start(createApp({ convert: async () => ({ exchangeRate: 0.72 }) }));
});

after(() => Promise.all(servers.map((s) => new Promise((r) => s.close(r)))));

const post = (base, body, { raw = false, contentType = "application/json" } = {}) =>
  fetch(`${base}/convert`, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: raw ? body : JSON.stringify(body),
  });



//Success

test("200 with the full success response", async () => {
  const res = await post(baseOk, { from: "cad", to: "usd", amount: 100.0 });
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), {
    from: "CAD",
    to: "USD",
    originalAmount: 100,
    convertedAmount: 72,
    exchangeRate: 0.72,
  });
});

test("converter receives the normalized request", async () => {
  let received;
  const base = await start(
    createApp({
      convert: async (r) => {
        received = r;
        return { convertedAmount: 72, exchangeRate: 0.72 };
      },
    })
  );
  await post(base, { from: "cad", to: "usd", amount: 100 });
  assert.deepStrictEqual(received, { from: "CAD", to: "USD", amount: 100 });
});



//Request validation

test("400 with errors array on invalid amount", async () => {
  const res = await post(baseOk, { from: "CAD", to: "USD", amount: -5 });
  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.ok(Array.isArray(body.errors));
  assert.strictEqual(body.errors.length, 1);
});

test("400 on missing fields", async () => {
  const res = await post(baseOk, {});
  assert.strictEqual(res.status, 400);
  assert.strictEqual((await res.json()).errors.length, 3);
});

test("400 on malformed JSON", async () => {
  const res = await post(baseOk, "{ not json", { raw: true });
  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(await res.json(), { errors: ["Invalid JSON body"] });
});

test("400 when Content-Type is not JSON", async () => {
  const res = await post(baseOk, "from=CAD", { raw: true, contentType: "text/plain" });
  assert.strictEqual(res.status, 400);
});

//Converter problems

test("200 with real rates through the full stack", async () => {
  const res = await post(baseDefault, { from: "cad", to: "usd", amount: 100 });
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), {
    from: "CAD",
    to: "USD",
    originalAmount: 100,
    convertedAmount: 72,
    exchangeRate: 0.72,
  });
});

test("400 for an unsupported currency", async () => {
  const res = await post(baseDefault, { from: "CAD", to: "XYZ", amount: 100 });
  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(await res.json(), { errors: ["Currency Not Supported in System"] });
});

test("500 when the converter returns an invalid result", async () => {
  const res = await post(baseBadResult, { from: "CAD", to: "USD", amount: 100 });
  assert.strictEqual(res.status, 500);
  assert.deepStrictEqual(await res.json(), { errors: ["Internal server error"] });
});