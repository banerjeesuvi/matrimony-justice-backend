import crypto from 'crypto';

const USER_UID = 'plugin::users-permissions.user';

function secretMatches(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default ({ strapi }) => ({
  async deactivate(ctx) {
    const expected = (process.env.PASSWORD_RESET_SECRET || '').trim();
    const given = String(ctx.request.header['x-server-secret'] || '').trim();
    if (!expected || !secretMatches(given, expected)) {
      return ctx.unauthorized('Invalid server secret.');
    }

    const userId = Number(ctx.request.body?.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return ctx.badRequest('A valid userId is required.');
    }

    const user = await strapi.db.query(USER_UID).findOne({ where: { id: userId } });
    if (!user) {
      return ctx.notFound('User not found.');
    }

    if (!user.blocked) {
      await strapi.db.query(USER_UID).update({
        where: { id: userId },
        data: { blocked: true },
      });
    }

    ctx.body = { ok: true, email: user.email };
  },
});
