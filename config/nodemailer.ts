import type { Core } from '@strapi/strapi';

type Env = Core.Config.Shared.ConfigParams['env'];

/**
 * Official @strapi/provider-email-nodemailer setup.
 * Host, port, and credentials come from the environment, so development
 * and production can use different SMTP accounts.
 * https://docs.strapi.io/cms/features/email
 */
/** Pull a bare address out of `Name <email@host>` or a plain email. */
export function smtpMailbox(value: string | undefined, fallback = '') {
  const raw = String(value || '').trim();
  const bracketed = raw.match(/<([^>]+)>/);
  const email = (bracketed?.[1] || raw).trim();
  return email.includes('@') ? email : fallback;
}

export function nodemailerEmail(env: Env) {
  const fromEmail = smtpMailbox(
    env('SMTP_FROM', ''),
    smtpMailbox(env('SMTP_USERNAME', ''), 'matrimonyjustice@gmail.com'),
  );
  const fromName = env('SMTP_FROM_NAME', 'Matrimony Justice');

  return {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.gmail.com'),
        port: env.int('SMTP_PORT', 587),
        secure: env.bool('SMTP_SECURE', false),
        auth: {
          user: env('SMTP_USERNAME', fromEmail),
          pass: env('SMTP_PASSWORD', '').replace(/\s+/g, ''),
        },
      },
      settings: {
        defaultFrom: `"${fromName}" <${fromEmail}>`,
        defaultReplyTo: fromEmail,
      },
    },
  };
}
