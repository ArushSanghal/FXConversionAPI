## Disclosure of AI Use

This project was built with assistance from Claude. In the interest of transparency, here is how it was used:

**Where AI helped:**

- Drafting the initial code setup, which I then edited to better fit the project's needs
- Drafting the initial unit tests
- Helping diagnose failing tests during development
- Adjusting ideas of mine into the system (for example, the "Currency Not Supported in System" error)

I reviewed all AI-generated code before using it, and I am responsible for the final result.


## Requirements

- Node.js 18 or newer
- npm

## Setup

```bash
git clone <your-repo-url>
cd <your-repo-folder>
npm install
```

## Run the API

```bash
npm start
```

The server runs at `http://localhost:3000`. To use another port, set the `PORT` environment variable (e.g. `PORT=4000 npm start`; in PowerShell: `$env:PORT=4000; npm start`).

## Try it

Start the server first (`npm start`) and leave it running. Then send a request from a **second terminal**.
Sample request bodies are in the `examples/` folder.

### Any shell (curl with a JSON file)

This avoids shell quoting problems and works on Windows PowerShell (any version), cmd, Git Bash, macOS, and Linux.

```
curl -i -X POST http://localhost:3000/convert -H "Content-Type: application/json" -d @examples/valid-request.json
```

> **Windows PowerShell:** use `curl.exe` instead of `curl`, because `curl` is an alias for a different command there.

### PowerShell (no curl needed)

```powershell
Invoke-RestMethod -Uri http://localhost:3000/convert -Method Post -ContentType "application/json" -Body '{"from":"CAD","to":"USD","amount":100.00}'
```

`Invoke-RestMethod` hides the body of error responses, so to see the status code and error message use:

```powershell
try {
  Invoke-RestMethod -Uri http://localhost:3000/convert -Method Post -ContentType "application/json" -Body '{"from":"CAD","to":"XYZ","amount":100}'
} catch {
  $_.Exception.Response.StatusCode.value__
  $_.ErrorDetails.Message
}
```

### macOS / Linux / Git Bash (inline JSON)

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"from":"CAD","to":"USD","amount":100.00}'
```

### Expected results

| Request file | Status | Response |
| --- | --- | --- |
| `examples/valid-request.json` | `200` | `{"from":"CAD","to":"USD","originalAmount":100,"convertedAmount":72,"exchangeRate":0.72}` |
| `examples/unsupported-currency.json` | `400` | `{"errors":["Currency Not Supported in System"]}` |

## Run the tests

```bash
npm test
```

## API

### `POST /convert`

**Request** (`Content-Type: application/json`)

```json
{ "from": "CAD", "to": "USD", "amount": 100.00 }
```

- `from`, `to`: 3-letter currency code, case-insensitive
- `amount`: positive number

**Success: `200 OK`**

```json
{
  "from": "CAD",
  "to": "USD",
  "originalAmount": 100,
  "convertedAmount": 72,
  "exchangeRate": 0.72
}
```

`convertedAmount` is rounded to 2 decimals and `exchangeRate` to 6.

**Errors**

| Status | When | Example body |
| --- | --- | --- |
| `400` | Invalid or missing fields | `{ "errors": ["'amount' must be a positive number"] }` |
| `400` | Malformed JSON or non-JSON content type | `{ "errors": ["Invalid JSON body"] }` |
| `400` | Currency not in the supported list | `{ "errors": ["Currency Not Supported in System"] }` |
| `500` | Unexpected server error | `{ "errors": ["Internal server error"] }` |



## Design decisions

- **Layered structure.** Request validation (`JSON_Handling/`), conversion logic (`Currency_Conversions/`), and the HTTP layer (`app.js`) are separate, so each can be tested and changed independently.
- **`app.js` vs `server.js`.** The Express app is created in a function and exported without listening on a port, so API tests can start it on a random free port.
- **Injected converter.** `createApp({ convert })` accepts a converter function. Tests use fake rates to exercise the API; the real converter reads static rates. Swapping in live rates later requires no route changes.
- **Cross-rates through the base currency.** Rates are stored per 1 CAD, so any pair is `amount × rate(to) / rate(from)`. Adding a currency means adding one line to `rates.js`.
- **Rounding once, at the end.** `convertedAmount` is computed from the unrounded rate and then rounded to 2 decimals. The displayed `exchangeRate` is rounded to 6 decimals but isn't used to compute the amount.
- **Safe currency lookup.** Currency codes are checked with `Object.hasOwn`, so inputs like `"toString"` aren't treated as valid currencies.
- **Rounded JPY Values** Since JPY is normally a zero decimal currency, I made the decision to round it without a decimal place as is seen to be standard in electronic systems.

## Assumptions

- Unsupported currencies return `400 Bad Request`, since the client asked for something the system doesn't support.

## Testing

`npm test` runs everything with Node's built-in test runner, so there are no test dependencies.

| File | What it covers |
| --- | --- |
| `Unit_Tests/validateRequest.test.js` | Field validation, case normalization, missing body |
| `Unit_Tests/convert.test.js` | Rates, cross-rates, rounding, same-currency, unsupported codes |
| `Unit_Tests/buildResponse.test.js` | Response shape and handling of invalid converter output |
| `Unit_Tests/api.test.js` | The real HTTP route end to end: status codes, error bodies, bad JSON |