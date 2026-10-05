/**
 * Petoria: Property -> Product dev data reset (idempotent).
 *
 * Usage (review first, NOT run automatically):
 *   mongosh "<MONGO_DEV uri>" scripts/2026-10-petoria-products.mongosh.js
 *
 * - Products start in a fresh `products` collection; `properties` is kept as an archive.
 * - Removes social records that point at old properties (group PROPERTY no longer exists in enums).
 * - Renames members.memberProperties -> members.memberProducts.
 * - Drops notifications.propertyId (replaced by productId).
 */

const DRY_RUN = false;

const ops = [
	{ coll: 'likes', filter: { likeGroup: 'PROPERTY' }, action: 'delete' },
	{ coll: 'views', filter: { viewGroup: 'PROPERTY' }, action: 'delete' },
	{ coll: 'comments', filter: { commentGroup: 'PROPERTY' }, action: 'delete' },
	{ coll: 'notifications', filter: { notificationGroup: 'PROPERTY' }, action: 'delete' },
	{
		coll: 'members',
		filter: { memberProperties: { $exists: true } },
		action: 'update',
		update: { $rename: { memberProperties: 'memberProducts' } },
	},
	{
		coll: 'notifications',
		filter: { propertyId: { $exists: true } },
		action: 'update',
		update: { $unset: { propertyId: '' } },
	},
];

for (const op of ops) {
	const count = db.getCollection(op.coll).countDocuments(op.filter);
	print(`${op.coll} ${op.action} ${JSON.stringify(op.filter)} -> ${count} document(s)`);
	if (DRY_RUN || count === 0) continue;

	if (op.action === 'delete') db.getCollection(op.coll).deleteMany(op.filter);
	else db.getCollection(op.coll).updateMany(op.filter, op.update);
}

// Members created before memberProducts existed get the counter initialised.
const missing = db.members.countDocuments({ memberProducts: { $exists: false } });
print(`members without memberProducts -> ${missing} document(s)`);
if (!DRY_RUN && missing) db.members.updateMany({ memberProducts: { $exists: false } }, { $set: { memberProducts: 0 } });

print('Done. `properties` collection left untouched as archive.');
