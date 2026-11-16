const express = require("express");
const { validateConvertMiddleware, jsonErrorHandler } = require("./JSON_Handling/validateRequest");

const app = express();
app.use(express.json());

app.post("/convert", validateConvertMiddleware, (req, res) => {
  // Conversion logic goes here later. For now, echo the validated request.
  res.status(200).json(req.convertRequest);
});

app.use(jsonErrorHandler);

module.exports = app;