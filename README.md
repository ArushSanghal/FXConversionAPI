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