/**
 * news-article controller — signed-in users post as their linked Author.
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
      if (!sessionUser?.id) {
        return ctx.unauthorized('You must be signed in to post news.');
      }

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

      const body = (ctx.request.body ?? {}) as {
        data?: Record<string, unknown>;
      };
      body.data = {
        ...(body.data ?? {}),
        author: authorId,
      };
      ctx.request.body = body;

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
