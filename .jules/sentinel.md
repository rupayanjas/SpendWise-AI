## 2024-03-20 - Fix Unauthorized Access to Admin Endpoint
**Vulnerability:** The `/api/rewards/batch-earn` endpoint lacked role-based authorization, allowing any authenticated user to potentially distribute mass rewards and mint SWT tokens.
**Learning:** Endpoints labeled as "admin only" in comments must be explicitly backed by programmatic authorization checks (e.g., role-based middleware) before deployment to prevent unauthorized privileged actions.
**Prevention:** Implement and enforce a standard `requireAdmin` middleware across all administrative endpoints and ensure the user model supports role definitions.
