const { test } = require("node:test");
const assert = require("node:assert");
const { convertCurrency } = require("../Currency_Conversions/convert");
const { RATES, DECIMAL_PLACES } = require("../Currency_Conversions/rates");

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

test("JPY results are whole numbers", async () => {
  const r = await convertCurrency({ from: "USD", to: "JPY", amount: 100 });
  assert.deepStrictEqual(r, { convertedAmount: 15208, exchangeRate: 152.083333 });
  assert.ok(Number.isInteger(r.convertedAmount));
});

test("JPY rounds fractions to the nearest yen", async () => {
  const r = await convertCurrency({ from: "CAD", to: "JPY", amount: 0.5 });
  assert.strictEqual(r.convertedAmount, 55); // 54.75 rounds up
});

test("converting from JPY keeps 2 decimals for the target currency", async () => {
  const r = await convertCurrency({ from: "JPY", to: "USD", amount: 1000 });
  assert.deepStrictEqual(r, { convertedAmount: 6.58, exchangeRate: 0.006575 });
});

test("every supported currency has a decimal-places entry", () => {
  assert.deepStrictEqual(Object.keys(DECIMAL_PLACES).sort(), Object.keys(RATES).sort());
});