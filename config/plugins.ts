import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      register: {
        // Must match User schema attributes (phone exists on this backend)
        allowedFields: ['phone'],
      },
    },
  },
});

export default config;
