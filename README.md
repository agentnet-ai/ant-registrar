# ant-registrar

Identity and lifecycle service for AgentNet that issues node identifiers and maintains canonical ownership records.

## What it does

`ant-registrar` is the identity authority in the AgentNet reference stack. It stores canonical owners, creates node identities, and tracks lifecycle state changes.

The service provides lookup endpoints consumed by resolver and orchestration layers. It also manages owner alias resolution so clients can resolve canonical ownership consistently over time.

The implementation is a reference baseline for identity, namespace, and audit behavior aligned to ANS Core v2.0.

## Where it fits

Canonical flow:

1. Capsulizer
2. Registrar (this repository)
3. Resolver
4. Orchestrator

## Quickstart

```bash
cp .env.example .env
npm install
npm run dev
```

Also available:

- `npm run start`
- `npm run reset:dev`
- `npm run test`

## Configuration

Runtime configuration is read from `.env`, with starter values in `.env.example`.

## Repo structure

- `src/` registrar service code
- `migrations/` SQL migrations for owner and alias data models
- `scripts/` development reset utilities

## Status

Alpha, reference implementation.

## Related Repositories

- https://github.com/agentnet-ai/AgentNet
- https://github.com/agentnet-ai/ant-capsulizer
- https://github.com/agentnet-ai/ant-registrar
- https://github.com/agentnet-ai/ant-resolver
- https://github.com/agentnet-ai/ant-orchestrator

## License

Apache License 2.0. See `LICENSE`.
