/**
 * element-event controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::element-event.element-event', ({ strapi }) => ({
	async refreshLinked(ctx) {
		const query = strapi.db.query('api::element-event.element-event');
		const records = await query.findMany({
			select: ['id', 'documentId', 'external_id'],
		});

		let refreshed = 0;
		let failed = 0;

		for (const record of records) {
			if (!record?.documentId || !record?.external_id) {
				continue;
			}

			try {
				await strapi.documents('api::element-event.element-event').update({
					documentId: record.documentId,
					data: {
						external_id: record.external_id,
					},
				});

				refreshed += 1;
			} catch {
				failed += 1;
			}
		}

		ctx.body = {
			startedAt: new Date().toISOString(),
			scanned: records.length,
			refreshed,
			skipped: records.length - refreshed - failed,
			failed,
			finishedAt: new Date().toISOString(),
		};
	},
}));
