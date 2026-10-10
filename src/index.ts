// import type { Core } from '@strapi/strapi';

import { seedSampleNews } from './seed/sample-news';
import { seedSampleJudgement } from './seed/sample-judgement';
import { seedHomepage } from './seed/sample-homepage';
import { seedPublicPages } from './seed/sample-public-pages';
import { seedContactPage } from './seed/sample-contact';
import { seedHelpCenter } from './seed/sample-help-center';
import { smtpMailbox } from '../config/nodemailer';

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
  'api::contact-page.contact-page.find',
  'api::contact-inquiry.contact-inquiry.create',
  'api::help-center.help-center.find',
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

  const fromEmail = smtpMailbox(
    process.env.SMTP_FROM,
    smtpMailbox(process.env.SMTP_USERNAME, ''),
  );
  const fromName = (process.env.SMTP_FROM_NAME || 'Matrimony Justice').trim();
  const emails = (await pluginStore.get({ key: 'email' })) || {};
  const resetFrom = emails.reset_password?.options?.from;
  if (fromEmail && (resetFrom?.email !== fromEmail || resetFrom?.name !== fromName)) {
    emails.reset_password = {
      ...emails.reset_password,
      options: {
        ...emails.reset_password?.options,
        from: { name: fromName, email: fromEmail },
        response_email: fromEmail,
      },
    };
    await pluginStore.set({ key: 'email', value: emails });
    strapi.log.info(`[bootstrap] Set password reset sender to ${fromName} <${fromEmail}>`);
  }
}

/**
 * Users & Permissions writes resetPasswordToken through the Document Service,
 * which drops that private field. The email still contains the code, but the
 * database never stores it, so reset always reports the link as invalid.
 * Persist the token with a direct query after the normal update.
 */
function keepResetToken(strapi) {
  const userService = strapi.plugin('users-permissions').service('user');
  const originalEdit = userService.edit.bind(userService);
  userService.edit = async (userId, params: Record<string, unknown> = {}) => {
    const result = await originalEdit(userId, params);
    if (Object.prototype.hasOwnProperty.call(params, 'resetPasswordToken')) {
      const token = params.resetPasswordToken;
      await strapi.db.connection('up_users').where({ id: userId }).update({
        reset_password_token: token,
      });
    }
    return result;
  };
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
    keepResetToken(strapi);

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

    try {
      await seedContactPage(strapi);
    } catch (error) {
      strapi.log.error('[seed] Failed to publish the contact page.');
      strapi.log.error(error);
    }

    try {
      await seedHelpCenter(strapi);
    } catch (error) {
      strapi.log.error('[seed] Failed to publish the help center.');
      strapi.log.error(error);
    }
  },
};
