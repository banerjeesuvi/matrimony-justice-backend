import crypto from 'crypto';

const USER_UID = 'plugin::users-permissions.user';

function secretMatches(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default ({ strapi }) => ({
  async issue(ctx) {
    const expected = (process.env.PASSWORD_RESET_SECRET || '').trim();
    const given = String(ctx.request.header['x-password-reset-secret'] || '').trim();
    if (!expected || !secretMatches(given, expected)) {
      return ctx.unauthorized('Invalid password reset secret.');
    }

    const email = String(ctx.request.body?.email || '').trim().toLowerCase();
    if (!email) {
      return ctx.badRequest('Email is required.');
    }

    const user = await strapi.db.query(USER_UID).findOne({ where: { email } });
    if (!user || user.blocked) {
      ctx.body = { code: null };
      return;
    }

    // Same format as Users & Permissions, so /api/auth/reset-password accepts it.
    const code = crypto.randomBytes(64).toString('hex');
    await strapi.db.query(USER_UID).update({
      where: { id: user.id },
      data: { resetPasswordToken: code },
    });

    ctx.body = { code };
  },
});
