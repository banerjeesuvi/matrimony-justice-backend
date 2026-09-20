/**
 * Custom notification routes for the signed-in user.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/notifications/mine',
      handler: 'notification.mine',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/notifications/read-all',
      handler: 'notification.markAllRead',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/notifications/:documentId/read',
      handler: 'notification.markRead',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
