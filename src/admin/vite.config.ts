import { mergeConfig, type UserConfig } from 'vite';

/**
 * Strapi 5 Vite can auto-exclude admin plugins and then serve their CJS leaf
 * deps raw (no default/named ESM exports). That blanks /admin with errors like:
 *   hoist-non-react-statics ... does not provide an export named 'default'
 *
 * Force-prebundle those packages so @notum-cz/strapi-plugin-seo (react-intl) loads.
 */
export default (config: UserConfig) => {
  return mergeConfig(config, {
    optimizeDeps: {
      include: [
        'hoist-non-react-statics',
        'react-intl',
        'react-is',
        'intl-messageformat',
        '@formatjs/fast-memoize',
        '@formatjs/icu-messageformat-parser',
        '@formatjs/ecma402-abstract',
        '@formatjs/intl',
        'lodash',
        'lodash/get',
        'lodash/isEmpty',
        'lodash/isEqual',
        'lodash/isNull',
        'lodash/isNumber',
        'lodash/isArray',
        'lodash/isObject',
        'lodash/pull',
        'showdown',
        'date-fns',
      ],
    },
  });
};
