const { Router } = require('express');
const { getNodeIdentity, getNodeIdentities } = require('../services/nodeService');
const { sendMappedError } = require('../utils/httpErrorMap');

const router = Router();

const MAX_BATCH_SIZE = 500;

router.post('/batch', async (req, res) => {
  try {
    const { nodeIds } = req.body;

    if (!Array.isArray(nodeIds)) {
      return sendMappedError(res, { message: 'nodeIds must be an array', code: 'INVALID_REQUEST' });
    }

    if (nodeIds.length === 0 || nodeIds.length > MAX_BATCH_SIZE) {
      return sendMappedError(res, {
        message: `nodeIds length must be 1..${MAX_BATCH_SIZE}`,
        code: 'INVALID_REQUEST',
      });
    }

    if (nodeIds.some((id) => typeof id !== 'string' || id.trim() === '')) {
      return sendMappedError(res, {
        message: 'Each nodeId must be a non-empty string',
        code: 'INVALID_REQUEST',
      });
    }

    const result = await getNodeIdentities(nodeIds);
    res.json(result);
  } catch (err) {
    sendMappedError(res, err);
  }
});

router.get('/:nodeId', async (req, res) => {
  try {
    const node = await getNodeIdentity(req.params.nodeId);
    res.json(node);
  } catch (err) {
    sendMappedError(res, err);
  }
});

module.exports = router;
