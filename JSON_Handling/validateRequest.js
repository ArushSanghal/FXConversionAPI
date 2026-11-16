const isCurrencyCOde = (v) => typeof v === 'string' && /^[A-Za-z]{3}$/.test(v);

function validateConvertRequest(body) {
    const { from, to, amount } = body ?? {};
    const errors = [];

    if (!isCurrencyCOde(from)) errors.push(" 'from' must be a 3 Letter currency code");
    if (!isCurrencyCOde(to)) errors.push(" 'to' must be a 3 Letter currency code");
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) errors.push(" 'amount' must be a positive number");

    if (errors.length > 0) return {valid: false, errors, value: null};

    return {
        valid: true,
        errors: [],
        value: { from: from.toUpperCase(), to: to.toUpperCase(), amount }
    };
}

function validateConvertMiddleware(req, res, next) {
    const result = validateConvertRequest(req.body);
    if (!result.valid) return res.status(400).json({ errors: result.errors });
    req.convertRequest = result.value;
    next();
}

function jsonErrorHandler(err, req, res, next) {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ errors: ["Invalid JSON body"] });
    }
    console.error(err);
    res.status(500).json({ errors: ["Internal Server Error"] });
}

module.exports = {validateConvertRequest, validateConvertMiddleware, jsonErrorHandler};