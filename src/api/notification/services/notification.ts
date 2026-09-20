/**
 * notification service — create in-app alerts for the signed-in user.
 */

import { factories } from '@strapi/strapi';

export type NotificationType =
  | 'case'
  | 'document'
  | 'review'
  | 'judgment'
  | 'system';

export default factories.createCoreService(
  'api::notification.notification',
  ({ strapi }) => ({
    async notify(input: {
      user?: string;
      title: string;
      body?: string;
      type?: NotificationType;
      href?: string;
      caseDocumentId?: string;
    }) {
      const user = String(input.user || '').trim().toLowerCase();
      const title = String(input.title || '').trim();
      if (!user || !title) return null;

      try {
        return await strapi.documents('api::notification.notification').create({
          data: {
            user,
            title,
            body: String(input.body || '').trim(),
            type: input.type || 'system',
            read: false,
            href: String(input.href || '').trim(),
            caseDocumentId: String(input.caseDocumentId || '').trim(),
          },
        });
      } catch (err) {
        strapi.log.warn('[notification.notify]', err);
        return null;
      }
    },
  }),
);
