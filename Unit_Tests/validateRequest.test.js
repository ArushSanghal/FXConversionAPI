const { test } = require("node:test");
const assert = require("node:assert");
const { validateConvertRequest } = require("../JSON_Handling/validateRequest");

test("accepts a valid request and uppercases codes", () => {
  const r = validateConvertRequest({ from: "cad", to: "usd", amount: 100 });
  assert.strictEqual(r.valid, true);
  assert.deepStrictEqual(r.value, { from: "CAD", to: "USD", amount: 100 });
});

test("accepts decimal amounts", () => {
  const r = validateConvertRequest({ from: "CAD", to: "USD", amount: 100.55 });
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.value.amount, 100.55);
});

test("rejects a missing body", () => {
  assert.strictEqual(validateConvertRequest(undefined).valid, false);
});

test("rejects an empty object with an error for each field", () => {
  const r = validateConvertRequest({});
  assert.strictEqual(r.valid, false);
  assert.strictEqual(r.errors.length, 3);
});

test("rejects bad 'from' code", () => {
  for (const from of ["CANADA", "CA", "", 123, null, undefined]) {
    const r = validateConvertRequest({ from, to: "USD", amount: 5 });
    assert.strictEqual(r.valid, false, `from=${String(from)}`);
  }
});

test("rejects bad 'to' code", () => {
  for (const to of ["USDX", "U", "", 123, null, undefined]) {
    const r = validateConvertRequest({ from: "CAD", to, amount: 5 });
    assert.strictEqual(r.valid, false, `to=${String(to)}`);
  }
});

test("rejects non-positive or non-numeric amounts", () => {
  for (const amount of [0, -5, "100", null, undefined, NaN, Infinity]) {
    const r = validateConvertRequest({ from: "CAD", to: "USD", amount });
    assert.strictEqual(r.valid, false, `amount=${String(amount)}`);
  }
});