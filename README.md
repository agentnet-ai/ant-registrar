# ant-registrar

Registrar service for the ANT network. Issues Node IDs, manages lifecycle state, and appends audit events.

## Architecture

### Owners

`owners` is the **canonical identity authority** in the registrar. Every node must belong to an owner. Owners are identified by an immutable `owner_slug` (lowercase, unique).

In **development** (`NODE_ENV=development`) or when `ALLOW_DEFAULT_OWNER=true`, omitting `ownerSlug` from `POST /nodes` defaults the node to the canonical `agentnet` owner. In **production** (any other `NODE_ENV` without `ALLOW_DEFAULT_OWNER=true`), `ownerSlug` is mandatory — omitting it returns HTTP 400 with error code `OWNER_SLUG_REQUIRED`.

#### owner_slug immutability

`owner_slug` is an immutable namespace handle. Once an owner is created, its slug cannot be changed — it serves as the stable public identifier referenced by nodes, audit logs, and external systems. Any attempt to modify `owner_slug` via an update endpoint will be rejected with HTTP 400 and error code `OWNER_SLUG_IMMUTABLE`.

Slugs are normalized to lowercase on creation and must match `[a-z][a-z0-9-]{1,63}` (2–64 characters, starting with a letter, containing only lowercase alphanumerics and hyphens). Invalid slugs are rejected with error code `OWNER_SLUG_INVALID`.

#### Owner aliases

The `owner_aliases` table provides a stable redirect layer for legacy or renamed namespace slugs. Each alias maps an `alias_slug` to a canonical `owner_id` and has a status of `active` or `retired`.

When `resolveOwnerId` is called, it first looks up `owners.owner_slug`. If no match is found, it falls back to `owner_aliases.alias_slug` (active only). This means the resolver and orchestrator can always pass the slug they know — if the canonical slug was renamed, a matching alias will transparently resolve to the correct `owner_id`. No endpoints, audit logs, or node references need updating when an alias is added.

### Identity API

`GET /v1/owners/:ownerSlug` — Read-only endpoint that resolves an owner slug (canonical or alias) and returns the canonical owner record.

**Response fields:**

| Field | Description |
|---|---|
| `ownerId` | Internal owner ID (bigint) |
| `ownerSlug` | Canonical `owner_slug` from the `owners` table |
| `displayName` | Human-readable name, or `null` |
| `status` | Owner status: `active`, `suspended`, or `retired` |
| `resolvedFromSlug` | The normalized input slug that was looked up |
| `resolvedVia` | `canonical` if matched `owners.owner_slug`, `alias` if matched via `owner_aliases` |

**Error codes:** `OWNER_SLUG_REQUIRED` (400), `OWNER_SLUG_INVALID` (400), `OWNER_NOT_FOUND` (404).

`GET /v1/nodes/:nodeId` — Read-only endpoint that returns a node's identity and its canonical owner.

**Response fields:**

| Field | Description |
|---|---|
| `nodeId` | UUID v4 node identifier |
| `ownerId` | Internal owner ID (bigint) |
| `ownerSlug` | Canonical `owner_slug` from the `owners` table |
| `lifecycleState` | Current node state (`Active`, `Inactive`, `Retired`), or `null` if not yet tracked |
| `createdAt` | ISO 8601 timestamp of node creation |
| `updatedAt` | ISO 8601 timestamp of last state change, or `null` if never changed |

**Error codes:** `NODE_NOT_FOUND` (404) — returned when the given `nodeId` does not match any registered node.

`POST /v1/nodes/batch` — Bulk identity lookup for resolver/orchestrator efficiency. Fetches multiple nodes in a single query.

**Request body:**

```json
{
  "nodeIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

- `nodeIds` must be an array of 1–500 non-empty strings. Each element must be a `string` with non-whitespace content. Duplicates are de-duplicated server-side while preserving first-occurrence order.

**Response:**

```json
{
  "found": [
    { "nodeId": "uuid-1", "ownerId": 1, "ownerSlug": "agentnet", "lifecycleState": "Active", "createdAt": "...", "updatedAt": null },
    { "nodeId": "uuid-3", "ownerId": 1, "ownerSlug": "agentnet", "lifecycleState": "Retired", "createdAt": "...", "updatedAt": "..." }
  ],
  "missing": ["uuid-2"]
}
```

- `found` preserves request order (first occurrence); each entry matches the `GET /v1/nodes/:nodeId` shape.
- `missing` lists nodeIds not found, also in request order.

**Ordering example:** Given input `["c", "a", "b", "a"]`, de-duplication keeps `["c", "a", "b"]`. If `"a"` exists but `"b"` and `"c"` do not: `found: [{ nodeId: "a", ... }]`, `missing: ["c", "b"]`.

**Error codes:** `INVALID_REQUEST` (400) — `nodeIds` is not an array, length is outside 1–500, or an element is not a non-empty string.

### Nodes

Each node has a UUID v4 identifier, a lifecycle state (`Active`, `Inactive`, `Retired`), and is linked to an owner via `owner_id`.

### Audit Log

All state mutations are recorded as append-only audit events in the `audit_log` table.

## Getting Started

```bash
cp .env.example .env   # configure DB credentials
npm install
npm run dev            # start with nodemon
```

## Migrations

Run the SQL migration files in `migrations/` in order against your MySQL database:

```bash
mysql -u root -p ant_registrar < migrations/001_create_owners_and_link_nodes.sql
mysql -u root -p ant_registrar < migrations/003_create_owner_aliases.sql
```
