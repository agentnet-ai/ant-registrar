const test = require('node:test');
const assert = require('node:assert/strict');

const {
  resolveOwner,
  resolveOwnerById,
  normalizeOwnerRef,
} = require('../src/services/ownerService');

const makeExecuteStub = () => async (sql, params) => {
  if (sql.includes('FROM owners WHERE owner_slug = ?')) {
    const slug = String(params[0]);
    if (slug === 'ant-worker') {
      return [[{ owner_id: 7 }]];
    }
    if (slug === 'other-owner') {
      return [[{ owner_id: 8 }]];
    }
    return [[]];
  }

  if (sql.includes('FROM owner_aliases WHERE alias_slug = ?')) {
    const alias = String(params[0]);
    if (alias === 'worker-alias') {
      return [[{ owner_id: 7 }]];
    }
    return [[]];
  }

  if (sql.includes('FROM owners WHERE owner_id = ?')) {
    const ownerId = Number(params[0]);
    if (ownerId === 7) {
      return [[{
        owner_id: 7,
        owner_slug: 'ant-worker',
        display_name: 'ANT Worker',
        status: 'active',
      }]];
    }
    if (ownerId === 8) {
      return [[{
        owner_id: 8,
        owner_slug: 'other-owner',
        display_name: 'Other Owner',
        status: 'active',
      }]];
    }
    return [[]];
  }

  throw new Error(`Unexpected SQL in test stub: ${sql}`);
};

test('owner id lookup returns same owner as slug lookup', async () => {
  const execute = makeExecuteStub();
  const bySlug = await resolveOwner('ant-worker', execute);
  const byId = await resolveOwnerById(7, execute);

  assert.equal(bySlug.ownerId, byId.ownerId);
  assert.equal(bySlug.ownerSlug, byId.ownerSlug);
});

test('normalizeOwnerRef supports slug-only requests (back-compat)', async () => {
  const execute = makeExecuteStub();
  const resolved = await normalizeOwnerRef({ ownerSlug: 'worker-alias' }, execute);

  assert.equal(resolved.ownerId, 7);
  assert.equal(resolved.ownerSlug, 'ant-worker');
  assert.equal(resolved.resolvedVia, 'alias');
});

test('normalizeOwnerRef supports owner_id-only requests', async () => {
  const execute = makeExecuteStub();
  const resolved = await normalizeOwnerRef({ ownerId: 7 }, execute);

  assert.equal(resolved.ownerId, 7);
  assert.equal(resolved.ownerSlug, 'ant-worker');
  assert.equal(resolved.resolvedVia, 'id');
});

test('normalizeOwnerRef rejects owner_id/owner_slug mismatch', async () => {
  const execute = makeExecuteStub();

  await assert.rejects(
    () => normalizeOwnerRef({ ownerId: 7, ownerSlug: 'other-owner' }, execute),
    (err) => err.code === 'OWNER_REF_MISMATCH',
  );
});
