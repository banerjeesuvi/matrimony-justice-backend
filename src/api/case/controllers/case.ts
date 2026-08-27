/**
 * case controller — store the signed-in user's email on Case.user.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::case.case',
  ({ strapi }) => ({
    async create(ctx) {
      const authUser = ctx.state.user as { email?: string } | undefined;
      const email = authUser?.email?.trim();

      if (!email) {
        return ctx.unauthorized('You must be signed in to register a case.');
      }

      const body = (ctx.request.body ?? {}) as {
        data?: Record<string, unknown>;
      };
      const data = {
        ...(body.data ?? {}),
        // Always use the authenticated user's email.
        user: email,
      };

      const created = await strapi.documents('api::case.case').create({
        data,
        status: 'published',
      });

      const sanitized = await this.sanitizeOutput(created, ctx);
      return this.transformResponse(sanitized);
    },
  }),
);
