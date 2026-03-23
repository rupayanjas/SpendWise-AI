## 2024-05-17 - Mass Assignment in Express + Mongoose
**Vulnerability:** Mass assignment vulnerability via `Object.assign(transaction, req.body)` in the PUT `/api/transactions/:id` endpoint.
**Learning:** `req.body` retains unvalidated properties in `express-validator`. Applying it directly to a Mongoose model document using `Object.assign` allows attackers to bypass validation and potentially modify unintended fields.
**Prevention:** Use `matchedData(req, { locations: ['body'] })` from `express-validator` to extract only explicitly validated fields, or use a strict allowlist of fields before updating the document.
