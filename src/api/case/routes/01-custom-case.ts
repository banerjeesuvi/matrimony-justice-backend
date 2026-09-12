/**
 * Custom case routes (document upload / delete in media-library folders).
 *
 * Note: nested DELETE `/documents/:fileId` is not reliably registered by Strapi
 * (returns 405). Use POST `/documents/remove` instead.
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/cases/:documentId/documents/remove',
      handler: 'case.deleteDocument',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/cases/:documentId/documents',
      handler: 'case.uploadDocuments',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
