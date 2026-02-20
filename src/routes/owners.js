const { Router } = require('express');
const { resolveOwner } = require('../services/ownerService');
const { sendMappedError } = require('../utils/httpErrorMap');

const router = Router();

router.get('/:ownerSlug', async (req, res) => {
  try {
    const owner = await resolveOwner(req.params.ownerSlug);
    res.json(owner);
  } catch (err) {
    sendMappedError(res, err);
  }
});

module.exports = router;
