const express = require('express');
const healthRouter = require('./routes/health');
const nodesRouter = require('./routes/nodes');

const app = express();

app.use(express.json());

app.use('/health', healthRouter);
app.use('/nodes', nodesRouter);

module.exports = app;
