/**
 * news-article controller — signed-in users post as their linked Author.
 * API tokens (full-access or custom with create permission) may also post;
 * they set `author` explicitly in the request body.
 *
 * Status behavior:
 * - Pass `?status=draft` to create a draft article.
 * - Default is 'published' for backward compatibility.
 */

import { factories } from '@strapi/strapi';

type AuthUser = {
  id?: number | string;
  documentId?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
};

type AuthState = {
  strategy?: { name?: string };
  credentials?: { type?: string };
};

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return base || 'author';
}

function displayName(user: AuthUser) {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return full || user.username || user.email || 'Author';
}

export default factories.createCoreController(
  'api::news-article.news-article',
  ({ strapi }) => ({
    async create(ctx) {
      const sessionUser = ctx.state.user as AuthUser | undefined;

      // Strapi 5 uses 'content-api-token' as the strategy name for API tokens.
      // The credentials object contains the token with its `type` property.
      const authState = (ctx.state as { auth?: AuthState })?.auth;
      const isApiToken = authState?.strategy?.name === 'content-api-token';
      const tokenType = authState?.credentials?.type;

      // API token authentication: full-access tokens are allowed unconditionally;
      // custom tokens are allowed if they reach this point (Strapi's route auth
      // already enforces the token has 'api::news-article.news-article.create'
      // permission). Read-only tokens cannot create, so Strapi rejects them
      // before reaching this controller.
      const isAutomationToken =
        isApiToken && (tokenType === 'full-access' || tokenType === 'custom');

      const body = (ctx.request.body ?? {}) as {
        data?: Record<string, unknown>;
      };

      if (sessionUser?.id) {
        // Signed-in user path: auto-resolve author from the user's linked Author entry.
        const account = (await strapi.db
          .query('plugin::users-permissions.user')
          .findOne({
            where: { id: sessionUser.id },
            populate: ['avatar'],
          })) as
          | (AuthUser & { avatar?: { id?: number | string } | number | string | null })
          | null;

        if (!account?.id) {
          return ctx.unauthorized('You must be signed in to post news.');
        }

        const authorId = await resolveAuthorId(strapi, account);
        body.data = {
          ...(body.data ?? {}),
          author: authorId,
        };
        ctx.request.body = body;
      } else if (!isAutomationToken) {
        return ctx.unauthorized('You must be signed in to post news.');
      }
      // Automation-token path: `author` (if provided) comes from the request
      // body as-is; the automation sets it to the dedicated author entry.

      // Respect ?status query param; default to 'published' for backward compat.
      const requestedStatus = ctx.query.status as string | undefined;
      const status: 'draft' | 'published' =
        requestedStatus === 'draft' ? 'draft' : 'published';

      const created = await strapi.documents('api::news-article.news-article').create({
        data: body.data as never,
        status,
      });

      const sanitized = await this.sanitizeOutput(created, ctx);
      return this.transformResponse(sanitized);
    },
  }),
);

async function resolveAuthorId(
  strapi: {
    db: {
      query: (uid: string) => {
        findOne: (args: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
      };
    };
    documents: (uid: 'api::author.author') => {
      create: (args: Record<string, unknown>) => Promise<{ documentId?: string; id?: number | string }>;
      publish: (args: Record<string, unknown>) => Promise<unknown>;
    };
  },
  account: AuthUser & { avatar?: { id?: number | string } | number | string | null },
) {
  const existing = await strapi.db.query('api::author.author').findOne({
    where: { user: account.id },
  });

  if (existing?.documentId || existing?.id) {
    return (existing.documentId || existing.id) as string | number;
  }

  const name = displayName(account);
  const avatarId =
    account.avatar && typeof account.avatar === 'object'
      ? account.avatar.id
      : account.avatar;

  const created = await strapi.documents('api::author.author').create({
    data: {
      name,
      slug: await uniqueAuthorSlug(strapi, slugify(name)),
      user: account.documentId || account.id,
      ...(avatarId ? { photo: avatarId } : {}),
    },
    status: 'published',
  });

  return created.documentId || created.id;
}

async function uniqueAuthorSlug(
  strapi: {
    db: {
      query: (uid: string) => {
        findOne: (args: Record<string, unknown>) => Promise<unknown>;
      };
    };
  },
  base: string,
) {
  let slug = base;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const taken = await strapi.db.query('api::author.author').findOne({
      where: { slug },
    });
    if (!taken) return slug;
    slug = `${base}-${attempt + 2}`;
  }
  return `${base}-${Date.now()}`;
}
