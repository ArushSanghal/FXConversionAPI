const isPositiveNumber = (v) => typeof v === "number" && Number.isFinite(v) && v > 0;
const isNonNegativeNumber = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0;

function buildSuccessResponse(request, conversion) {
  const { from, to, amount } = request;
  const { convertedAmount, exchangeRate } = conversion ?? {};

  if (!isNonNegativeNumber(convertedAmount) || !isPositiveNumber(exchangeRate)) {
    throw new Error("Invalid conversion result");
  }

  return {
    from,
    to,
    originalAmount: amount,
    convertedAmount,
    exchangeRate,
  };
}

module.exports = { buildSuccessResponse };