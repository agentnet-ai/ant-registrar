# START HERE

## Purpose

Set up and run `ant-registrar` locally as the identity and lifecycle stage in the AgentNet reference flow.

## Prereqs

- Node.js and npm
- MySQL
- Redis

## Setup

```bash
cp .env.example .env
npm install
```

## Run commands

- `npm run dev`
- `npm start`
- `npm run reset:dev`
- `npm test`

## Typical local integration flow

1. Start `ant-registrar` and confirm DB connectivity.
2. Start `ant-resolver`, which consumes registrar identity APIs.
3. Run `ant-capsulizer` to register and ingest node-linked content.
4. Run `ant-orchestrator` to execute end-to-end query flows over resolver data.

## Related Repositories

- https://github.com/agentnet-ai/AgentNet
- https://github.com/agentnet-ai/ant-capsulizer
- https://github.com/agentnet-ai/ant-registrar
- https://github.com/agentnet-ai/ant-resolver
- https://github.com/agentnet-ai/ant-orchestrator
