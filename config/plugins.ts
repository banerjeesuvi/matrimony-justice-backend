import path from 'node:path';

import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  email: {
    config: {
      provider: path.join(process.cwd(), 'src/providers/email-local.js'),
      providerOptions: {},
      settings: {
        defaultFrom: env('SMTP_FROM', 'noreply@matrimonyjustice.com'),
        defaultReplyTo: env('SMTP_FROM', 'support@matrimonyjustice.com'),
      },
    },
  },
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
