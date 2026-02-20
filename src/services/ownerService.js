const pool = require('../db');

const DEFAULT_OWNER_SLUG = 'agentnet';
const OWNER_SLUG_RE = /^[a-z][a-z0-9-]{1,63}$/;

const isMissing = (input) =>
  input == null || String(input).trim() === '';

const defaultAllowed = () =>
  process.env.NODE_ENV === 'development' ||
  process.env.ALLOW_DEFAULT_OWNER === 'true';

const normalizeOwnerSlug = (input) => {
  if (isMissing(input)) {
    if (defaultAllowed()) return DEFAULT_OWNER_SLUG;
    const err = new Error('ownerSlug is required');
    err.code = 'OWNER_SLUG_REQUIRED';
    throw err;
  }

  const slug = String(input).toLowerCase();

  if (!OWNER_SLUG_RE.test(slug)) {
    const err = new Error(
      'owner_slug must be 2-64 characters, start with a letter, and contain only [a-z0-9-]',
    );
    err.code = 'OWNER_SLUG_INVALID';
    throw err;
  }

  return slug;
};

const resolveOwnerId = async (ownerSlug) => {
  const { ownerId } = await resolveOwner(ownerSlug);
  return ownerId;
};

const resolveOwner = async (ownerSlug) => {
  const slug = normalizeOwnerSlug(ownerSlug);
  let ownerId;
  let resolvedVia = 'canonical';

  const [owners] = await pool.execute(
    `SELECT owner_id FROM owners WHERE owner_slug = ?`,
    [slug],
  );

  if (owners.length > 0) {
    ownerId = owners[0].owner_id;
  } else {
    const [aliases] = await pool.execute(
      `SELECT owner_id FROM owner_aliases WHERE alias_slug = ? AND status = 'active'`,
      [slug],
    );
    if (aliases.length > 0) {
      ownerId = aliases[0].owner_id;
      resolvedVia = 'alias';
    } else {
      const err = new Error(`Owner not found: ${slug}`);
      err.code = 'OWNER_NOT_FOUND';
      throw err;
    }
  }

  const [rows] = await pool.execute(
    `SELECT owner_id, owner_slug, display_name, status FROM owners WHERE owner_id = ?`,
    [ownerId],
  );

  const row = rows[0];
  return {
    ownerId: row.owner_id,
    ownerSlug: row.owner_slug,
    displayName: row.display_name || null,
    status: row.status,
    resolvedFromSlug: slug,
    resolvedVia,
  };
};

module.exports = { resolveOwnerId, resolveOwner, normalizeOwnerSlug, DEFAULT_OWNER_SLUG };
