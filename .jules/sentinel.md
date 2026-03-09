## 2024-05-20 - Mass Assignment Vulnerability in Transaction Update

**Vulnerability:** The `PUT /api/transactions/:id` endpoint used `Object.assign(transaction, req.body)` to update transactions. This allowed malicious users to modify restricted fields, such as `isVerified`, `proofHash`, or `userId`, bypassing intended security controls.

**Learning:** When updating Mongoose models or any other data models from user input, blindly merging `req.body` into the object is a critical risk. Node.js applications frequently suffer from this pattern. In a financial application like this one, it could lead to users verifying their own fake transactions.

**Prevention:** Always use explicit field assignment or a strict allowlist of properties when updating objects from user-provided data. Only extract explicitly defined fields from `req.body` that users are permitted to modify.
