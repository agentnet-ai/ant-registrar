const { generateNodeId } = require('../utils/idGenerator');
const { logEvent } = require('./auditService');
const { resolveOwnerId } = require('./ownerService');
const pool = require('../db');

const issueNode = async (ownerSlug) => {
  const ownerId = await resolveOwnerId(ownerSlug);
  const nodeId = generateNodeId();
  await pool.execute(
    `INSERT INTO nodes (id, owner_id, state, created_at) VALUES (?, ?, 'Active', NOW())`,
    [nodeId, ownerId],
  );
  await logEvent(nodeId, 'ISSUED', { nodeId, ownerSlug, state: 'Active' });
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
    `SELECT n.id, n.state, n.state_reason, n.created_at, n.state_changed_at,
            o.owner_slug
     FROM nodes n
     JOIN owners o ON o.owner_id = n.owner_id
     WHERE n.id = ?`,
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
    ownerSlug: row.owner_slug,
    state: row.state,
    stateReason: row.state_reason || null,
    createdAt: new Date(row.created_at).toISOString(),
    stateChangedAt: row.state_changed_at
      ? new Date(row.state_changed_at).toISOString()
      : null,
  };
};

const getNodeIdentity = async (nodeId) => {
  const [rows] = await pool.execute(
    `SELECT n.id, n.owner_id, n.state, n.created_at, n.state_changed_at,
            o.owner_slug
     FROM nodes n
     JOIN owners o ON o.owner_id = n.owner_id
     WHERE n.id = ?`,
    [nodeId],
  );

  if (rows.length === 0) {
    const err = new Error('Node not found');
    err.code = 'NODE_NOT_FOUND';
    throw err;
  }

  const row = rows[0];
  return {
    nodeId: row.id,
    ownerId: row.owner_id,
    ownerSlug: row.owner_slug,
    lifecycleState: row.state || null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: row.state_changed_at
      ? new Date(row.state_changed_at).toISOString()
      : null,
  };
};

const getNodeIdentities = async (nodeIds) => {
  const unique = [...new Set(nodeIds)];
  const placeholders = unique.map(() => '?').join(',');

  const [rows] = await pool.query(
    `SELECT n.id, n.owner_id, n.state, n.created_at, n.state_changed_at,
            o.owner_slug
     FROM nodes n
     JOIN owners o ON o.owner_id = n.owner_id
     WHERE n.id IN (${placeholders})`,
    unique,
  );

  const rowMap = new Map();
  for (const row of rows) {
    rowMap.set(row.id, {
      nodeId: row.id,
      ownerId: row.owner_id,
      ownerSlug: row.owner_slug,
      lifecycleState: row.state || null,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: row.state_changed_at
        ? new Date(row.state_changed_at).toISOString()
        : null,
    });
  }

  const seen = new Set();
  const found = [];
  const missing = [];

  for (const id of nodeIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const node = rowMap.get(id);
    if (node) {
      found.push(node);
    } else {
      missing.push(id);
    }
  }

  return { found, missing };
};

module.exports = { issueNode, changeNodeState, getNode, getNodeIdentity, getNodeIdentities };
