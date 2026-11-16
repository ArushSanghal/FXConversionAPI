const { test } = require("node:test");
const assert = require("node:assert");
const { buildSuccessResponse } = require("../JSON_Handling/buildResponse");

const request = { from: "CAD", to: "USD", amount: 100 };

test("builds the success response in the expected shape", () => {
  const r = buildSuccessResponse(request, { convertedAmount: 72, exchangeRate: 0.72 });
  assert.deepStrictEqual(r, {
    from: "CAD",
    to: "USD",
    originalAmount: 100,
    convertedAmount: 72,
    exchangeRate: 0.72,
  });
});

test("passes converter values through without recalculating", () => {
  const r = buildSuccessResponse(request, { convertedAmount: 71.99, exchangeRate: 0.7199 });
  assert.strictEqual(r.convertedAmount, 71.99);
  assert.strictEqual(r.exchangeRate, 0.7199);
});

test("throws when the conversion result is missing", () => {
  assert.throws(() => buildSuccessResponse(request, undefined), /Invalid conversion result/);
});

test("throws on a bad convertedAmount", () => {
  for (const convertedAmount of [-1, "72", null, undefined, NaN, Infinity]) {
    assert.throws(
      () => buildSuccessResponse(request, { convertedAmount, exchangeRate: 0.72 }),
      /Invalid conversion result/,
      `convertedAmount=${String(convertedAmount)}`
    );
  }
});

test("throws on a bad exchangeRate", () => {
  for (const exchangeRate of [0, -0.5, "0.72", null, undefined, NaN, Infinity]) {
    assert.throws(
      () => buildSuccessResponse(request, { convertedAmount: 72, exchangeRate }),
      /Invalid conversion result/,
      `exchangeRate=${String(exchangeRate)}`
    );
  }
});