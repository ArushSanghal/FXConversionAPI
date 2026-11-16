const express = require("express");
const { validateConvertMiddleware, jsonErrorHandler } = require("./JSON_Handling/validateRequest");
const { buildSuccessResponse } = require("./JSON_Handling/buildResponse");
const { convertCurrency } = require("./Currency_Conversions/convert");

function createApp({ convert = convertCurrency } = {}) {
    const app = express();
    app.use(express.json());

    app.post("/convert", validateConvertMiddleware, async (req, res, next) => {
        try {
            const conversion = await convert(req.convertRequest);
            const response = buildSuccessResponse(req.convertRequest, conversion);
            res.status(200).json(response);
        } catch (err) {
            next(err);
        }
    });

    app.use(jsonErrorHandler);
    return app;
}

module.exports = { createApp };