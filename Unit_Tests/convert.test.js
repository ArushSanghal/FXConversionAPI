const { test } = require("node:test");
const assert = require("node:assert");
const { convertCurrency } = require("../Currency_Conversions/convert");

test("CAD to USD", async () => {
  const r = await convertCurrency({ from: "CAD", to: "USD", amount: 100 });
  assert.deepStrictEqual(r, { convertedAmount: 72, exchangeRate: 0.72 });
});

test("CAD to JPY", async () => {
  const r = await convertCurrency({ from: "CAD", to: "JPY", amount: 100 });
  assert.deepStrictEqual(r, { convertedAmount: 10950, exchangeRate: 109.5 });
});

test("USD back to CAD", async () => {
  const r = await convertCurrency({ from: "USD", to: "CAD", amount: 72 });
  assert.strictEqual(r.convertedAmount, 100);
  assert.strictEqual(r.exchangeRate, 1.388889);
});

test("cross conversion USD to EUR rounds to 2 decimals", async () => {
  const r = await convertCurrency({ from: "USD", to: "EUR", amount: 100 });
  assert.deepStrictEqual(r, { convertedAmount: 91.67, exchangeRate: 0.916667 });
});

test("cross conversion GBP to AUD", async () => {
  const r = await convertCurrency({ from: "GBP", to: "AUD", amount: 100 });
  assert.deepStrictEqual(r, { convertedAmount: 191.23, exchangeRate: 1.912281 });
});

test("same currency returns the amount at rate 1", async () => {
  for (const code of ["CAD", "USD", "EUR", "GBP", "AUD", "JPY"]) {
    const r = await convertCurrency({ from: code, to: code, amount: 50 });
    assert.deepStrictEqual(r, { convertedAmount: 50, exchangeRate: 1 }, code);
  }
});

test("unsupported 'from' currency throws", async () => {
  await assert.rejects(
    convertCurrency({ from: "XYZ", to: "USD", amount: 100 }),
    { code: "UNSUPPORTED_CURRENCY", message: "Currency Not Supported in System" }
  );
});

test("unsupported 'to' currency throws", async () => {
  await assert.rejects(
    convertCurrency({ from: "CAD", to: "XYZ", amount: 100 }),
    { code: "UNSUPPORTED_CURRENCY", message: "Currency Not Supported in System" }
  );
});

test("inherited property names are not treated as currencies", async () => {
  await assert.rejects(
    convertCurrency({ from: "CAD", to: "toString", amount: 1 }),
    { code: "UNSUPPORTED_CURRENCY" }
  );
});