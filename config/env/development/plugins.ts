import type { Core } from '@strapi/strapi';

import { nodemailerEmail } from '../../nodemailer';

/**
 * Development SMTP. Values come from the local .env file.
 * https://docs.strapi.io/cms/features/email#per-environment-configuration
 */
export default ({ env }: Core.Config.Shared.ConfigParams) => ({
  email: nodemailerEmail(env),
});
