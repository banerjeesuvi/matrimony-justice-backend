/**
 * news-article controller — signed-in users post as their linked Author.
 * Full-access API tokens (automation) may also post; they set `author` explicitly.
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

      // Automation: allow full-access API tokens (machine-to-machine posting).
      // Signed-in users keep the existing behavior below (author auto-resolved).
      const authState = (ctx.state as { auth?: { strategy?: { name?: string }; credentials?: { type?: string } } } | undefined)?.auth;
      const isAutomationToken =
        authState?.strategy?.name === 'api-token' &&
        authState?.credentials?.type === 'full-access';

      const body = (ctx.request.body ?? {}) as {
        data?: Record<string, unknown>;
      };

      if (sessionUser?.id) {
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

      const created = await strapi.documents('api::news-article.news-article').create({
        data: body.data as never,
        status: 'published',
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
