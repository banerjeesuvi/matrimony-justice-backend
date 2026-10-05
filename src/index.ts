// import type { Core } from '@strapi/strapi';

import { seedSampleNews } from './seed/sample-news';
import { seedSampleJudgement } from './seed/sample-judgement';
import { seedHomepage } from './seed/sample-homepage';
import { seedPublicPages } from './seed/sample-public-pages';

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

const PUBLIC_NEWS_ACTIONS = [
  'api::news-article.news-article.find',
  'api::news-article.news-article.findOne',
  'api::news-category.news-category.find',
  'api::news-category.news-category.findOne',
  'api::news-tag.news-tag.find',
  'api::news-tag.news-tag.findOne',
  'api::author.author.find',
  'api::author.author.findOne',
] as const;

const AUTHENTICATED_NEWS_ACTIONS = [
  'api::news-article.news-article.create',
] as const;

const PUBLIC_HOME_ACTIONS = [
  'api::homepage.homepage.find',
  'api::header.header.find',
  'api::about.about.find',
  'api::services-page.services-page.find',
  'api::service.service.find',
  'api::service.service.findOne',
  'api::testimonial.testimonial.find',
  'api::testimonial.testimonial.findOne',
] as const;

const PUBLIC_AUTH_ACTIONS = [
  'plugin::users-permissions.auth.forgotPassword',
  'plugin::users-permissions.auth.resetPassword',
] as const;

async function configurePasswordReset(strapi) {
  const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
  const resetUrl = `${frontend}/reset-password`;
  const pluginStore = strapi.store({
    type: 'plugin',
    name: 'users-permissions',
  });
  const advanced = (await pluginStore.get({ key: 'advanced' })) || {};

  if (advanced.email_reset_password !== resetUrl) {
    await pluginStore.set({
      key: 'advanced',
      value: {
        ...advanced,
        email_reset_password: resetUrl,
      },
    });
    strapi.log.info(`[bootstrap] Set password reset page to ${resetUrl}`);
  }
}

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

    for (const action of [...AUTHENTICATED_ACTIONS, ...AUTHENTICATED_NEWS_ACTIONS]) {
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

    for (const action of [
      ...PUBLIC_CASE_ACTIONS,
      ...PUBLIC_NEWS_ACTIONS,
      ...PUBLIC_HOME_ACTIONS,
      ...PUBLIC_AUTH_ACTIONS,
    ]) {
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

    await configurePasswordReset(strapi);

    try {
      await seedSampleNews(strapi);
    } catch (error) {
      strapi.log.error('[seed] Failed to create sample news articles.');
      strapi.log.error(error);
    }

    try {
      await seedSampleJudgement(strapi);
    } catch (error) {
      strapi.log.error('[seed] Failed to write the sample judgment.');
      strapi.log.error(error);
    }

    try {
      await seedHomepage(strapi);
    } catch (error) {
      strapi.log.error('[seed] Failed to publish the homepage.');
      strapi.log.error(error);
    }

    try {
      await seedPublicPages(strapi);
    } catch (error) {
      strapi.log.error('[seed] Failed to publish the shared header, about, or services page.');
      strapi.log.error(error);
    }
  },
};
