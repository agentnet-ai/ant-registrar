const express = require('express');
const healthRouter = require('./routes/health');
const nodesRouter = require('./routes/nodes');
const ownersRouter = require('./routes/owners');
const nodeIdentityRouter = require('./routes/nodeIdentity');

const app = express();

app.use(express.json());

app.use('/health', healthRouter);
app.use('/nodes', nodesRouter);
app.use('/v1/owners', ownersRouter);
app.use('/v1/nodes', nodeIdentityRouter);

module.exports = app;
