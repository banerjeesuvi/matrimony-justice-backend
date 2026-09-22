'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Local Strapi email provider.
 * Never hangs like sendmail can on macOS. Writes the message (including the
 * reset URL) to `.tmp/emails.log` so the UI reset page can be opened.
 * If SMTP_HOST is set, also sends through nodemailer.
 */
module.exports = {
  init(providerOptions = {}, settings = {}) {
    return {
      async send(options) {
        const payload = {
          to: options.to,
          from: options.from || settings.defaultFrom,
          replyTo: options.replyTo || settings.defaultReplyTo,
          subject: options.subject,
          text: options.text,
          html: options.html,
        };
        const body = String(payload.html || payload.text || '');
        const line = `\n[${new Date().toISOString()}] to=${payload.to} subject=${payload.subject}\n${body}\n`;
        // eslint-disable-next-line no-console
        console.log('[email-local]', line);

        try {
          const dir = path.join(process.cwd(), '.tmp');
          fs.mkdirSync(dir, { recursive: true });
          fs.appendFileSync(path.join(dir, 'emails.log'), line);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[email-local] Unable to write .tmp/emails.log', err);
        }

        if (!process.env.SMTP_HOST || !process.env.SMTP_PASSWORD) {
          const err = new Error(
            'SMTP is not configured. Set SMTP_HOST, SMTP_USERNAME, and SMTP_PASSWORD so reset emails can be delivered.',
          );
          console.error('[email-local]', err.message);
          throw err;
        }

        const nodemailer = require('nodemailer');
        const transport = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth:
            process.env.SMTP_USERNAME || process.env.SMTP_PASSWORD
              ? {
                  user: process.env.SMTP_USERNAME,
                  pass: process.env.SMTP_PASSWORD,
                }
              : undefined,
          ...providerOptions,
        });
        await transport.sendMail(payload);
      },
    };
  },
};
