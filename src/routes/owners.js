const { Router } = require('express');
const { resolveOwner, resolveOwnerById } = require('../services/ownerService');
const { sendMappedError } = require('../utils/httpErrorMap');

const router = Router();

router.get('/id/:ownerId', async (req, res) => {
  try {
    const owner = await resolveOwnerById(req.params.ownerId);
    res.json(owner);
  } catch (err) {
    sendMappedError(res, err);
  }
});

router.get('/:ownerSlug', async (req, res) => {
  try {
    const owner = await resolveOwner(req.params.ownerSlug);
    res.json(owner);
  } catch (err) {
    sendMappedError(res, err);
  }
});

module.exports = router;
