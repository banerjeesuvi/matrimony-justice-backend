import crypto from 'crypto';

const UID = 'api::subscriber.subscriber';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Subscriber = {
  id: number;
  email: string;
  status: 'pending' | 'subscribed' | 'unsubscribed';
  confirmToken?: string | null;
  unsubscribeToken?: string | null;
  source?: string | null;
  subscribedAt?: string | null;
};

function secretMatches(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function authorized(ctx) {
  const expected = (process.env.PASSWORD_RESET_SECRET || '').trim();
  const given = String(ctx.request.header['x-server-secret'] || '').trim();
  return Boolean(expected) && secretMatches(given, expected);
}

const newToken = () => crypto.randomBytes(32).toString('hex');

function bodyEmail(ctx) {
  const email = String(ctx.request.body?.email || '').trim().toLowerCase();
  return EMAIL_RE.test(email) ? email : '';
}

function bodyToken(ctx) {
  const token = String(ctx.request.body?.token || '').trim();
  return /^[a-f0-9]{64}$/i.test(token) ? token : '';
}

function bodySource(ctx) {
  return String(ctx.request.body?.source || '').trim().slice(0, 60) || null;
}

export default ({ strapi }) => {
  const db = () => strapi.db.query(UID);
  const findByEmail = (email: string): Promise<Subscriber | null> =>
    db().findOne({ where: { email } });

  async function upsert(email: string, data: Partial<Subscriber>) {
    const existing = await findByEmail(email);
    if (existing) {
      return (await db().update({ where: { id: existing.id }, data })) as Subscriber;
    }
    return (await db().create({ data: { email, ...data } })) as Subscriber;
  }

  function guard(ctx, handler: () => Promise<void>) {
    if (!authorized(ctx)) return ctx.unauthorized('Invalid server secret.');
    return handler();
  }

  return {
    /** Start double opt-in. Already-confirmed addresses stay subscribed. */
    async subscribe(ctx) {
      return guard(ctx, async () => {
        const email = bodyEmail(ctx);
        if (!email) return ctx.badRequest('A valid email is required.');

        const existing = await findByEmail(email);
        if (existing?.status === 'subscribed') {
          ctx.body = { status: 'subscribed', unsubscribeToken: existing.unsubscribeToken };
          return;
        }

        const saved = await upsert(email, {
          status: 'pending',
          confirmToken: newToken(),
          unsubscribeToken: existing?.unsubscribeToken || newToken(),
          source: bodySource(ctx) ?? existing?.source ?? null,
        });
        ctx.body = {
          status: 'pending',
          confirmToken: saved.confirmToken,
          unsubscribeToken: saved.unsubscribeToken,
        };
      });
    },

    async confirm(ctx) {
      return guard(ctx, async () => {
        const token = bodyToken(ctx);
        const row: Subscriber | null = token
          ? await db().findOne({ where: { confirmToken: token } })
          : null;
        if (!row) {
          ctx.body = { ok: false };
          return;
        }
        await db().update({
          where: { id: row.id },
          data: {
            status: 'subscribed',
            confirmToken: null,
            subscribedAt: new Date(),
            unsubscribedAt: null,
          },
        });
        ctx.body = { ok: true, email: row.email };
      });
    },

    async unsubscribe(ctx) {
      return guard(ctx, async () => {
        const token = bodyToken(ctx);
        const row: Subscriber | null = token
          ? await db().findOne({ where: { unsubscribeToken: token } })
          : null;
        if (!row) {
          ctx.body = { ok: false };
          return;
        }
        if (row.status !== 'unsubscribed') {
          await db().update({
            where: { id: row.id },
            data: { status: 'unsubscribed', confirmToken: null, unsubscribedAt: new Date() },
          });
        }
        ctx.body = { ok: true, email: row.email };
      });
    },

    async status(ctx) {
      return guard(ctx, async () => {
        const email = bodyEmail(ctx);
        if (!email) return ctx.badRequest('A valid email is required.');
        const row = await findByEmail(email);
        ctx.body = { status: row?.status ?? 'none' };
      });
    },

    /** Direct on/off for signed-in account holders, who already own the address. */
    async set(ctx) {
      return guard(ctx, async () => {
        const email = bodyEmail(ctx);
        if (!email) return ctx.badRequest('A valid email is required.');
        const subscribe = ctx.request.body?.subscribed === true;
        const existing = await findByEmail(email);

        if (subscribe) {
          if (existing?.status !== 'subscribed') {
            await upsert(email, {
              status: 'subscribed',
              confirmToken: null,
              unsubscribeToken: existing?.unsubscribeToken || newToken(),
              source: bodySource(ctx) ?? existing?.source ?? null,
              subscribedAt: new Date().toISOString(),
            });
          }
          ctx.body = { status: 'subscribed' };
          return;
        }

        if (existing && existing.status !== 'unsubscribed') {
          await db().update({
            where: { id: existing.id },
            data: { status: 'unsubscribed', confirmToken: null, unsubscribedAt: new Date() },
          });
        }
        ctx.body = { status: existing ? 'unsubscribed' : 'none' };
      });
    },

    /** Confirmed subscribers, for exporting to the bulk email service. */
    async list(ctx) {
      return guard(ctx, async () => {
        const rows: Subscriber[] = await db().findMany({
          where: { status: 'subscribed' },
          orderBy: { subscribedAt: 'asc' },
        });
        ctx.body = {
          subscribers: rows.map((row) => ({
            email: row.email,
            source: row.source,
            subscribedAt: row.subscribedAt,
            unsubscribeToken: row.unsubscribeToken,
          })),
        };
      });
    },
  };
};
