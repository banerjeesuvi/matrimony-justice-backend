/**
 * Server-to-server route for the Next.js app. It stores a reset code and
 * returns it so the website can email the link itself, because Railway
 * blocks outbound SMTP on non-Pro plans.
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/password-reset/issue',
      handler: 'password-reset.issue',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
