import type { Core } from '@strapi/strapi';

type PreviewDocument = {
  slug?: string;
  code?: string;
  documentId?: string;
};

/**
 * Front-end path for each content type that has a public page on
 * matrimonyjustice.com. Types without a page return null so Preview stays
 * hidden in the Content Manager (header, authors, inquiries, …).
 * https://docs.strapi.io/cms/features/preview
 */
function getPreviewPathname(
  uid: string,
  { document }: { locale?: string; document: PreviewDocument | null },
): string | null {
  const slug = String(document?.slug || '').trim();
  const code = String(document?.code || '').trim().toLowerCase();
  const documentId = String(document?.documentId || '').trim();

  switch (uid) {
    case 'api::homepage.homepage':
      return '/';
    case 'api::about.about':
      return '/about';
    case 'api::services-page.services-page':
    case 'api::service.service':
      return '/services';
    case 'api::contact-page.contact-page':
      return '/contact';
    case 'api::help-center.help-center':
      return '/help-center';
    case 'api::news-article.news-article':
      return slug ? `/${slug}` : '/news/in';
    case 'api::news-category.news-category':
      return slug ? `/news/in/${slug}` : '/news/in';
    case 'api::country.country':
      return code ? `/news/${code}` : '/news/in';
    case 'api::case.case':
      return documentId ? `/judgments/${documentId}` : '/judgments';
    default:
      return null;
  }
}

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => {
  const clientUrl = env('CLIENT_URL', env('FRONTEND_URL', 'http://localhost:3000')).replace(
    /\/$/,
    '',
  );
  const previewSecret = env('PREVIEW_SECRET', '');

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT'),
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY'),
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
      docLinks: env.bool('FLAG_DOC_LINKS', true),
    },
    preview: {
      enabled: true,
      config: {
        allowedOrigins: [clientUrl],
        async handler(uid, { documentId, locale, status }) {
          const document = (await strapi.documents(uid as never).findOne({
            documentId,
          })) as PreviewDocument | null;

          const pathname = getPreviewPathname(uid, { locale, document });
          if (!pathname) {
            return null;
          }

          // Next.js Draft Mode entry point on the website.
          const params = new URLSearchParams({
            url: pathname,
            status: status || 'draft',
          });
          if (previewSecret) {
            params.set('secret', previewSecret);
          }
          return `${clientUrl}/api/preview?${params.toString()}`;
        },
      },
    },
  };
};

export default config;
