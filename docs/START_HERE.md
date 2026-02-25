# START HERE

## Purpose

This guide gets `ant-registrar` running locally and explains where it sits in the AgentNet identity and lifecycle flow.

## Prerequisites

- Node.js and npm
- MySQL
- Redis

## Setup

```bash
cp .env.example .env
npm install
```

## Run

```bash
npm run dev
```

Useful alternatives:

- `npm run start`
- `npm run reset:dev`
- `npm run test`

## Typical local integration flow

1. Start `ant-registrar` and confirm DB connectivity.
2. Start `ant-resolver`, which consumes registrar identity APIs.
3. Run `ant-capsulizer` to register and ingest node-linked content.
4. Run `ant-orchestrator` to execute end-to-end query flows over resolver data.

## Links

- AgentNet: https://github.com/agentnet-ai/AgentNet
- ant-capsulizer: https://github.com/agentnet-ai/ant-capsulizer
- ant-resolver: https://github.com/agentnet-ai/ant-resolver
- ant-orchestrator: https://github.com/agentnet-ai/ant-orchestrator
