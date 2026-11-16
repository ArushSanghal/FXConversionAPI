const { RATES, isSupportedCurrency } = require("./rates");

class UnSupportedCurrencyError extends Error {
    constructor(){
        super("Currency Not Supported in System");
        this.name = "UnSupportedCurrencyError";
        this.code = "UNSUPPORTED_CURRENCY";

    }
}

const round = (n, decimals) => {
    const factor = 10 ** decimals;
    return Math.round((n + Number.EPSILON) * factor) / factor;
}



async function convertCurrency({from, to, amount}) {
    if (!isSupportedCurrency(from) || !isSupportedCurrency(to)) {
        throw new UnSupportedCurrencyError();
    }

    const rate = RATES[to]/RATES[from];
    return{
        convertedAmount: round(amount * rate, 2),
        exchangeRate: round(rate, 6)
    };
}

module.exports = { convertCurrency, UnSupportedCurrencyError };