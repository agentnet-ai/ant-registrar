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

const getNodeAuditLog = async (nodeId, limit = 50) => {
  const safeLimit = Number.isFinite(limit) ? limit : 50;
  const [rows] = await pool.execute(
    `SELECT event_type, event_payload, timestamp
     FROM audit_log
     WHERE node_id = ?
     ORDER BY timestamp DESC
     LIMIT ${safeLimit}`,
    [nodeId],
  );

  return rows.map((row) => {
    let payload = {};
    if (row.event_payload != null) {
      payload = typeof row.event_payload === 'string'
        ? JSON.parse(row.event_payload)
        : row.event_payload;
    }
    return {
      eventType: row.event_type,
      payload,
      timestamp: row.timestamp.toISOString(),
    };
  });
};

module.exports = { logEvent, getNodeAuditLog };
