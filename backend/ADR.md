# Architecture Decision Record

## Context
The backend implements a reselling marketplace with Express and MongoDB. Requirements include seeded behaviors using ASSIGNMENT_SEED (GHW25-n), SKU checksum, platform fee formula, HMAC signed checkout responses, rate limiting, idempotent checkout, RBAC, pagination, health and logs routes.

## Key Decisions
1. Stack: Express with Mongoose chosen for rapid iteration, flexible schemas (reviews, dynamic attributes) and easy population. Single server instance suitable for assignment scope.
2. Seed Usage: ASSIGNMENT_SEED parsed to derive numeric component for checksum and fee. Admin JWTs are signed with seed secret guaranteeing verifiable linkage. SKU embeds deterministic checksum for validation. Platform fee uses floor(1.7% subtotal + n).
3. Auth: JWT with dual secret verification (primary JWT_SECRET for general users, seed for admin). Role middleware enforces seller and admin access. Token payload includes role. Admin tokens carry seedSig allowing future validator extension.
4. Pagination: Cursor based using createdAt descending for stable listings and avoidance of skip inefficiency. nextCursor is ISO timestamp of last returned item. Applied to products, user lists, orders.
5. Checkout: Implements idempotency via in-memory Map with 5 minute TTL keyed by Idempotency-Key header. Rate limited to 7 per minute per IP using custom limiter. Order total recalculated in schema pre-validation to ensure consistency. Response body HMAC signed with seed and returned in X-Signature.
6. Logging: In-memory ring buffer of last 50 requests exposed at /logs/recent excluding bodies for privacy (only body key list). Health at /IIT2024081/healthz returns timestamp.
7. Data Integrity: Product pre-save hook assigns SKU once; price changes append bounded history (20 entries). Review mutations recalculate rating atomically before save.
8. Extensibility: Product schema includes promoted flag supporting featured listings and likes/bookmarks arrays for social interactions. Order schema allows timeline and payment method snapshot.
9. Simplicity vs Durability: In-memory idempotency and logs selected for simplicity. For production a distributed store (Redis) would replace them. Structure isolates logic to allow swapping implementations.
10. Security: HMAC signature ensures body integrity tied to seed. Rate limiting applied at sensitive checkout path only. Dual-secret verification prevents lockout if JWT secret rotates while still validating seed-signed admin tokens.

## Alternatives Considered
Redis for idempotency and logs was skipped due to deployment complexity. Offset pagination avoided due to potential inconsistency under concurrent writes.

## Consequences
Horizontal scaling would require externalizing idempotency and logs. Admin signing tied to seed requires rotation strategy if seed compromised. In-memory structures reset on restart which is acceptable for assignment scope.

## Future Improvements
Add full text search, notification service, WebSocket chat, persistent audit log, and Redis backed rate limiting.