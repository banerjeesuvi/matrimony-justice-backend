import type { Core } from '@strapi/strapi';

import { nodemailerEmail } from '../../nodemailer';

/**
 * Production SMTP. Set SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD,
 * SMTP_FROM, and SMTP_FROM_NAME on the host (Railway).
 * https://docs.strapi.io/cms/features/email#per-environment-configuration
 */
export default ({ env }: Core.Config.Shared.ConfigParams) => ({
  email: nodemailerEmail(env),
});
