# ant-registrar

Identity and lifecycle service for AgentNet that issues node identifiers and maintains canonical ownership records.

Status: Alpha / Reference Implementation
Docs: https://www.agent-net.ai
Org: https://github.com/agentnet-ai

## What it does

`ant-registrar` is the registrar component of the AgentNet reference architecture.

It is responsible for canonical owner identity, node registration, and lifecycle state management used by other components in the stack.

In a local development environment, it typically runs alongside `ant-resolver` for identity lookup and policy checks, with `ant-capsulizer` and `ant-orchestrator` interacting through resolver workflows.

## Where it fits

Within the canonical AgentNet flow:

1. Capsulizer
2. Registrar
3. Resolver
4. Orchestrator

This repository provides the registrar role.

## Quickstart

```bash
cp .env.example .env
npm install
```

Run commands:

- `npm run dev`
- `npm start`
- `npm run reset:dev`
- `npm test`

## Configuration

Runtime configuration is read from `.env`, with starter values in `.env.example`.

## Owner Ref Fields

- Accepted request variants: `owner_id` or `ownerId`, and `owner_slug` or `ownerSlug`
- Canonical internal key: `owner_id`
- `owner_slug` is treated as alias-only

## Status

Status: Alpha / Reference Implementation  
These components are intended to demonstrate ANS-aligned architecture patterns.

## Related Repositories

Other core AgentNet reference components:

- https://github.com/agentnet-ai/AgentNet
- https://github.com/agentnet-ai/ant-capsulizer
- https://github.com/agentnet-ai/ant-registrar
- https://github.com/agentnet-ai/ant-resolver
- https://github.com/agentnet-ai/ant-orchestrator

## Contributing
These repositories are reference implementations of the AgentNet architecture aligned to ANS Core v2.0.
Issues for bug reports and spec questions are welcome.
We do not accept unsolicited pull requests. If you would like to contribute code, please open an issue first to discuss scope, or coordinate via a partner fork.

## License

Apache License 2.0. See `LICENSE` for details.
