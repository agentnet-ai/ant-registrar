const { Router } = require('express');
const { issueNode, changeNodeState, getNode } = require('../services/nodeService');
const { getNodeAuditLog } = require('../services/auditService');

const router = Router();

const VALID_STATES = ['Active', 'Inactive', 'Retired'];

router.post('/', async (req, res) => {
  try {
    const nodeId = await issueNode();
    res.status(201).json({ nodeId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to issue node' });
  }
});

router.post('/:id/state', async (req, res) => {
  try {
    const { state, reason } = req.body;

    if (!VALID_STATES.includes(state)) {
      return res.status(400).json({ error: 'Invalid state' });
    }

    await changeNodeState(req.params.id, state, reason);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Node not found' });
    }
    res.status(500).json({ error: 'Failed to change node state' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const node = await getNode(req.params.id);
    res.json(node);
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Node not found' });
    }
    res.status(500).json({ error: 'Failed to fetch node' });
  }
});

router.get('/:id/audit', async (req, res) => {
  try {
    await getNode(req.params.id);
    const parsed = parseInt(req.query.limit || '50', 10);
    const limit = Math.min(Math.max(Number.isNaN(parsed) ? 50 : parsed, 1), 200);
    const events = await getNodeAuditLog(req.params.id, limit);
    res.json({ nodeId: req.params.id, events });
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Node not found' });
    }
    console.error('GET /nodes/:id/audit error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

module.exports = router;
