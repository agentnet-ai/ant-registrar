const { Router } = require('express');
const { issueNode, changeNodeState } = require('../services/nodeService');

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

module.exports = router;
