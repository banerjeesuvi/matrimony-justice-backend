/**
 * Server-to-server routes for the Next.js app. Each handler checks the shared
 * PASSWORD_RESET_SECRET header, so the subscriber list is never public.
 */

const route = (path: string, handler: string) => ({
  method: 'POST',
  path: `/newsletter/${path}`,
  handler: `subscriber.${handler}`,
  config: { auth: false, policies: [], middlewares: [] },
});

export default {
  routes: [
    route('subscribe', 'subscribe'),
    route('confirm', 'confirm'),
    route('unsubscribe', 'unsubscribe'),
    route('status', 'status'),
    route('set', 'set'),
    route('list', 'list'),
  ],
};
