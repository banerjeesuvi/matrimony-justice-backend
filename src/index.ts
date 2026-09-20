// import type { Core } from '@strapi/strapi';

const AUTHENTICATED_ACTIONS = [
  'api::case.case.create',
  'api::case.case.find',
  'api::case.case.findOne',
  'api::case.case.update',
  'api::case.case.delete',
  'api::case.case.uploadDocuments',
  'api::case.case.deleteDocument',
  'api::notification.notification.find',
  'api::notification.notification.findOne',
  'api::notification.notification.create',
  'api::notification.notification.update',
  'api::notification.notification.mine',
  'api::notification.notification.markRead',
  'api::notification.notification.markAllRead',
] as const;

const PUBLIC_CASE_ACTIONS = [
  'api::case.case.find',
  'api::case.case.findOne',
] as const;

export default {
  register({ strapi }) {
    const user = strapi.contentType('plugin::users-permissions.user');
    user.attributes.firstName = { type: 'string' };
    user.attributes.lastName = { type: 'string' };
    user.attributes.address = { type: 'string' };
    user.attributes.avatar = {
      type: 'media',
      multiple: false,
      required: false,
      allowedTypes: ['images'],
    };
  },

  /**
   * Ensure authenticated users can manage their cases.
   */
  async bootstrap({ strapi }) {
    const authenticated = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    if (!authenticated) {
      strapi.log.warn(
        '[bootstrap] Authenticated role not found; skipping API permissions.',
      );
      return;
    }

    for (const action of AUTHENTICATED_ACTIONS) {
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({
          where: {
            action,
            role: { id: authenticated.id },
          },
        });

      if (existing) continue;

      await strapi.db.query('plugin::users-permissions.permission').create({
        data: {
          action,
          role: authenticated.id,
        },
      });
      strapi.log.info(`[bootstrap] Granted ${action} to Authenticated role.`);
    }

    const publicRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) {
      strapi.log.warn(
        '[bootstrap] Public role not found; skipping public case permissions.',
      );
      return;
    }

    for (const action of PUBLIC_CASE_ACTIONS) {
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({
          where: {
            action,
            role: { id: publicRole.id },
          },
        });

      if (existing) continue;

      await strapi.db.query('plugin::users-permissions.permission').create({
        data: {
          action,
          role: publicRole.id,
        },
      });
      strapi.log.info(`[bootstrap] Granted ${action} to Public role.`);
    }
  },
};
