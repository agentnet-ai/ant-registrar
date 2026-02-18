const crypto = require('crypto');

const generateNodeId = () => crypto.randomUUID();

module.exports = { generateNodeId };
