/**
 * notification controller — scoped to the signed-in user's email.
 */

import { factories } from '@strapi/strapi';

function authEmail(ctx: { state?: { user?: { email?: string } } }) {
  return String(ctx.state?.user?.email || '').trim().toLowerCase();
}

export default factories.createCoreController(
  'api::notification.notification',
  ({ strapi }) => ({
    async find(ctx, _next) {
      const email = authEmail(ctx);
      if (!email) return ctx.unauthorized('You must be signed in.');

      const entries = await strapi
        .documents('api::notification.notification')
        .findMany({
          filters: { user: { $eqi: email } },
          sort: { createdAt: 'desc' },
          limit: 50,
        });

      const sanitized = await this.sanitizeOutput(entries, ctx);
      return this.transformResponse(sanitized);
    },

    async mine(ctx, next) {
      return this.find(ctx, next);
    },

    async markRead(ctx) {
      const email = authEmail(ctx);
      if (!email) return ctx.unauthorized('You must be signed in.');

      const documentId = String(ctx.params.documentId || ctx.params.id || '').trim();
      if (!documentId) return ctx.badRequest('Notification id is required.');

      const existing = await strapi
        .documents('api::notification.notification')
        .findOne({ documentId });

      if (
        !existing ||
        String((existing as { user?: string }).user || '').toLowerCase() !== email
      ) {
        return ctx.notFound('Notification not found.');
      }

      const updated = await strapi
        .documents('api::notification.notification')
        .update({
          documentId,
          data: { read: true },
        });

      const sanitized = await this.sanitizeOutput(updated, ctx);
      return this.transformResponse(sanitized);
    },

    async markAllRead(ctx) {
      const email = authEmail(ctx);
      if (!email) return ctx.unauthorized('You must be signed in.');

      const unread = await strapi
        .documents('api::notification.notification')
        .findMany({
          filters: {
            user: { $eqi: email },
            read: { $eq: false },
          },
          limit: 100,
        });

      for (const entry of unread as { documentId?: string }[]) {
        const documentId = String(entry.documentId || '').trim();
        if (!documentId) continue;
        await strapi.documents('api::notification.notification').update({
          documentId,
          data: { read: true },
        });
      }

      ctx.body = { data: { ok: true, updated: unread.length } };
    },
  }),
);
