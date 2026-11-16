async function convertCurrency({from, to, amount}) {
    const err = new Error("Conversion not implemented");
    err.code = "NOT_IMPLEMENTED";
    throw err;
}

module.exports = { convertCurrency };