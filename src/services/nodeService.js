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

module.exports = { issueNode, changeNodeState };
