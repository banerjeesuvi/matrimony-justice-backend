/**
 * @notum-cz/strapi-plugin-seo derives pluginId from the npm package name, so the
 * admin UI calls /@notum-cz/strapi-plugin-seo/* instead of /seo/*. Rewrite those
 * paths so the SEO plugin routes respond correctly.
 */

const BROKEN_PREFIX = '/@notum-cz/strapi-plugin-seo';

export default () => {
  return async (
    ctx: {
      url: string;
      path: string;
      request: { url: string; path?: string };
    },
    next: () => Promise<void>,
  ) => {
    const current = String(ctx.request?.url || ctx.url || '');
    const pathOnly = current.split('?')[0];

    if (pathOnly === BROKEN_PREFIX || pathOnly.startsWith(`${BROKEN_PREFIX}/`)) {
      const suffix = pathOnly.slice(BROKEN_PREFIX.length) || '';
      const query = current.includes('?')
        ? current.slice(current.indexOf('?'))
        : '';
      const rewritten = `/seo${suffix}${query}`;

      ctx.url = rewritten;
      ctx.request.url = rewritten;

      const nextPath = `/seo${suffix}` || '/seo';
      ctx.path = nextPath;
      if (ctx.request.path != null) {
        ctx.request.path = nextPath;
      }
    }

    await next();
  };
};
