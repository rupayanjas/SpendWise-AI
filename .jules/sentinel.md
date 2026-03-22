## 2024-03-22 - Prevent Mass Assignment in Mongoose Models using express-validator
**Vulnerability:** Mass Assignment
**Learning:** `req.body` contains all fields submitted by the client, even those not explicitly validated by `express-validator`. When `req.body` is passed directly to `Object.assign(document, req.body)` in a Mongoose model update, a malicious user can overwrite sensitive properties like `isVerified`, `userId`, or `proofHash`.
**Prevention:** Use `matchedData(req, { locations: ['body'] })` from `express-validator` to extract only the explicitly validated and sanitized fields before updating the Mongoose document.
