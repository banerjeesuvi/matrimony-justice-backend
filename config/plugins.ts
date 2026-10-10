import type { Core } from '@strapi/strapi';

import { nodemailerEmail } from './nodemailer';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  email: nodemailerEmail(env),
  'users-permissions': {
    config: {
      register: {
        allowedFields: ['phone', 'firstName', 'lastName'],
      },
    },
  },
  seo: {
    enabled: true,
    resolve: './node_modules/@notum-cz/strapi-plugin-seo',
  },
});

export default config;
