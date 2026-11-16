const RATES = Object.freeze({
    "CAD": 1.0,
    "USD": 0.72,
    "EUR": 0.66,
    "GBP": 0.57,
    "AUD": 1.09,
    "JPY": 109.5,
});

const DECIMAL_PLACES = Object.freeze({
    "CAD": 2,
    "USD": 2,
    "EUR": 2,
    "GBP": 2,
    "AUD": 2,
    "JPY": 0,
});

const isSupportedCurrency = (code) => Object.hasOwn(RATES, code);
const getDecimalPlaces = (code) => DECIMAL_PLACES[code];

module.exports = { RATES, DECIMAL_PLACES, isSupportedCurrency, getDecimalPlaces };