// import type { Core } from '@strapi/strapi';

const CASE_ACTIONS = [
  'api::case.case.create',
  'api::case.case.find',
  'api::case.case.findOne',
  'api::case.case.update',
  'api::case.case.delete',
  'api::case.case.uploadDocuments',
  'api::case.case.deleteDocument',
] as const;

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * Ensure authenticated users can manage their cases.
   */
  async bootstrap({ strapi }) {
    const authenticated = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    if (!authenticated) {
      strapi.log.warn(
        '[bootstrap] Authenticated role not found; skipping case permissions.',
      );
      return;
    }

    for (const action of CASE_ACTIONS) {
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
  },
};
