## 2025-02-13 - [Mass Assignment Vulnerability in Transaction Update]
**Vulnerability:** Mass Assignment
**Learning:** `Object.assign(transaction, req.body)` allowed overriding of potentially any field within the transaction object like sensitive or read-only properties since user input wasn't strictly whitelisted.
**Prevention:** Always restrict field updates by explicitly selecting only allowable fields from `req.body` and assigning them to the entity.
