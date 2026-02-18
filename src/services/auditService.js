const crypto = require('crypto');
const pool = require('../db');

const logEvent = async (nodeId, eventType, payload = {}) => {
  const id = crypto.randomUUID();
  await pool.execute(
    `INSERT INTO audit_log (id, node_id, event_type, event_payload, timestamp)
     VALUES (?, ?, ?, ?, NOW())`,
    [id, nodeId, eventType, JSON.stringify(payload)],
  );
};

module.exports = { logEvent };
