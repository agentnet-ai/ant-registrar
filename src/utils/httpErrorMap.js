const IDENTITY_ERROR_MAP = {
  OWNER_SLUG_REQUIRED: 400,
  OWNER_SLUG_INVALID: 400,
  OWNER_ID_REQUIRED: 400,
  OWNER_ID_INVALID: 400,
  OWNER_REF_REQUIRED: 400,
  OWNER_REF_MISMATCH: 400,
  OWNER_NOT_FOUND: 404,
  NODE_NOT_FOUND: 404,
  INVALID_REQUEST: 400,
};

const sendMappedError = (res, err, mappings = IDENTITY_ERROR_MAP) => {
  const status = mappings[err.code] || 500;

  if (status >= 500) {
    console.error(`[${status}] ${err.message}`, err.stack);
  }

  res.status(status).json({
    error: err.message,
    code: err.code || 'INTERNAL_ERROR',
  });
};

module.exports = { sendMappedError, IDENTITY_ERROR_MAP };
