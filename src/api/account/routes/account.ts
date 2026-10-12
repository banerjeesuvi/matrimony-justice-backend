/**
 * Server-to-server route for the Next.js app. The website verifies the
 * user's password first, then asks Strapi to block the account.
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/account/deactivate',
      handler: 'account.deactivate',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
