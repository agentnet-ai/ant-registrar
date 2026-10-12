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

const normalizeOwnerId = (input) => {
  if (isMissing(input)) {
    const err = new Error('owner_id is required');
    err.code = 'OWNER_ID_REQUIRED';
    throw err;
  }

  const ownerId = Number.parseInt(String(input), 10);
  if (!Number.isInteger(ownerId) || ownerId <= 0) {
    const err = new Error('owner_id must be a positive integer');
    err.code = 'OWNER_ID_INVALID';
    throw err;
  }

  return ownerId;
};

const resolveOwnerById = async (ownerId, execute = pool.execute.bind(pool)) => {
  const normalizedOwnerId = normalizeOwnerId(ownerId);
  const [rows] = await execute(
    `SELECT owner_id, owner_slug, display_name, status FROM owners WHERE owner_id = ?`,
    [normalizedOwnerId],
  );

  if (rows.length === 0) {
    const err = new Error(`Owner not found: ${normalizedOwnerId}`);
    err.code = 'OWNER_NOT_FOUND';
    throw err;
  }

  const row = rows[0];
  return {
    ownerId: row.owner_id,
    ownerSlug: row.owner_slug,
    displayName: row.display_name || null,
    status: row.status,
    resolvedVia: 'id',
  };
};

const resolveOwner = async (ownerSlug, execute = pool.execute.bind(pool)) => {
  const slug = normalizeOwnerSlug(ownerSlug);
  let ownerId;
  let resolvedVia = 'canonical';

  const [owners] = await execute(
    `SELECT owner_id FROM owners WHERE owner_slug = ?`,
    [slug],
  );

  if (owners.length > 0) {
    ownerId = owners[0].owner_id;
  } else {
    const [aliases] = await execute(
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

  const [rows] = await execute(
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

const resolveOwnerId = async (ownerSlug, execute = pool.execute.bind(pool)) => {
  const { ownerId } = await resolveOwner(ownerSlug, execute);
  return ownerId;
};

const normalizeOwnerRef = async (ownerRef, execute = pool.execute.bind(pool)) => {
  const hasOwnerId = !isMissing(ownerRef?.ownerId);
  const hasOwnerSlug = !isMissing(ownerRef?.ownerSlug);

  if (!hasOwnerId && !hasOwnerSlug) {
    if (defaultAllowed()) {
      return resolveOwner(DEFAULT_OWNER_SLUG, execute);
    }
    const err = new Error('owner_id or owner_slug is required');
    err.code = 'OWNER_REF_REQUIRED';
    throw err;
  }

  let ownerFromId = null;
  let ownerFromSlug = null;

  if (hasOwnerId) {
    ownerFromId = await resolveOwnerById(ownerRef.ownerId, execute);
  }

  if (hasOwnerSlug) {
    ownerFromSlug = await resolveOwner(ownerRef.ownerSlug, execute);
  }

  if (ownerFromId && ownerFromSlug && ownerFromId.ownerId !== ownerFromSlug.ownerId) {
    const err = new Error('owner_id and owner_slug refer to different owners');
    err.code = 'OWNER_REF_MISMATCH';
    throw err;
  }

  const resolved = ownerFromId || ownerFromSlug;
  return {
    ...resolved,
    resolvedFromSlug: ownerFromSlug?.resolvedFromSlug ?? resolved.resolvedFromSlug,
    resolvedVia:
      ownerFromId && ownerFromSlug
        ? 'id+slug'
        : (ownerFromId?.resolvedVia || ownerFromSlug?.resolvedVia),
  };
};

module.exports = {
  resolveOwnerId,
  resolveOwner,
  resolveOwnerById,
  normalizeOwnerRef,
  normalizeOwnerSlug,
  normalizeOwnerId,
  DEFAULT_OWNER_SLUG,
};
