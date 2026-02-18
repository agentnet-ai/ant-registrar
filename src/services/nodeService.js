const { generateNodeId } = require('../utils/idGenerator');
const { logEvent } = require('./auditService');
const pool = require('../db');

const issueNode = async () => {
  const nodeId = generateNodeId();
  await pool.execute(
    `INSERT INTO nodes (id, state, created_at) VALUES (?, 'Active', NOW())`,
    [nodeId],
  );
  await logEvent(nodeId, 'ISSUED', { nodeId, state: 'Active' });
  return nodeId;
};

const changeNodeState = async (nodeId, newState, reason) => {
  const [result] = await pool.execute(
    `UPDATE nodes SET state = ?, state_reason = ?, state_changed_at = NOW() WHERE id = ?`,
    [newState, reason, nodeId],
  );

  if (result.affectedRows === 0) {
    const err = new Error('Node not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  await logEvent(nodeId, 'STATE_CHANGE', { newState, reason });
};

const getNode = async (nodeId) => {
  const [rows] = await pool.execute(
    `SELECT id, state, state_reason, created_at, state_changed_at FROM nodes WHERE id = ?`,
    [nodeId],
  );

  if (rows.length === 0) {
    const err = new Error('Node not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  const row = rows[0];
  return {
    nodeId: row.id,
    state: row.state,
    stateReason: row.state_reason || null,
    createdAt: new Date(row.created_at).toISOString(),
    stateChangedAt: row.state_changed_at
      ? new Date(row.state_changed_at).toISOString()
      : null,
  };
};

module.exports = { issueNode, changeNodeState, getNode };
