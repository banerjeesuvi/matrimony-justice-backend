/**
 * Public create only. Callers cannot set status or internal notes,
 * and they cannot read other people's inquiries.
 * Optional files are stored by this action; the public role has no upload permission.
 */

import { factories } from '@strapi/strapi';

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 8;
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function mediaIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((id) => typeof id === 'number' || typeof id === 'string');
}

function requestFiles(ctx: { request: { files?: Record<string, unknown> } }) {
  const raw = ctx.request.files?.documents;
  if (!raw) return [];
  return (Array.isArray(raw) ? raw : [raw]) as Record<string, unknown>[];
}

function payloadFrom(body: Record<string, unknown>) {
  const data = body.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  return body;
}

export default factories.createCoreController(
  'api::contact-inquiry.contact-inquiry',
  ({ strapi }) => ({
    async create(ctx) {
      const body = (ctx.request.body ?? {}) as Record<string, unknown>;
      const raw = payloadFrom(body);
      const files = requestFiles(ctx);

      const fullName = text(raw.fullName);
      const email = text(raw.email);
      const phone = text(raw.phone);
      const city = text(raw.city);
      const disputeType = text(raw.disputeType);
      const caseStage = text(raw.caseStage);
      const summary = text(raw.summary);
      const urgency = text(raw.urgency) || 'Standard';
      const jurisdiction = text(raw.jurisdiction);
      const consent = raw.consent === true || raw.consent === 'true' || raw.consent === 'on';

      if (!fullName || !email || !phone || !city || !disputeType || !caseStage || !summary) {
        return ctx.badRequest('Please complete every required field.');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return ctx.badRequest('Enter a valid email address.');
      }
      if (urgency.length > 80) {
        return ctx.badRequest('Choose a valid urgency level.');
      }
      if (!consent) {
        return ctx.badRequest('Consent is required before this inquiry can be sent.');
      }
      if (files.length > MAX_FILES) {
        return ctx.badRequest(`Attach no more than ${MAX_FILES} documents.`);
      }
      for (const file of files) {
        const size = Number(file.size ?? 0);
        const type = String(file.mimetype || file.type || '');
        const name = String(file.originalFilename || file.name || 'document');
        if (size > MAX_FILE_BYTES) {
          return ctx.badRequest(`“${name}” exceeds the 25MB limit.`);
        }
        if (!ALLOWED_TYPES.has(type)) {
          return ctx.badRequest(`“${name}” must be a PDF, Word document, or image.`);
        }
      }

      const created = await strapi.documents('api::contact-inquiry.contact-inquiry').create({
        data: {
          fullName,
          email,
          phone,
          city,
          jurisdiction: jurisdiction || null,
          disputeType,
          caseStage,
          urgency,
          summary,
          documents: mediaIds(raw.documents),
          consent: true,
          status: 'New',
        } as never,
      });

      if (files.length) {
        try {
          const stored = await strapi
            .service('api::contact-inquiry.contact-inquiry')
            .storeDocuments(String(created.documentId), files);
          await strapi.documents('api::contact-inquiry.contact-inquiry').update({
            documentId: created.documentId,
            data: { documents: stored } as never,
          });
        } catch (error) {
          strapi.log.error('[contact-inquiry] document upload failed');
          strapi.log.error(error);
          await strapi.documents('api::contact-inquiry.contact-inquiry').delete({
            documentId: created.documentId,
          });
          return ctx.badRequest('The inquiry could not store the attached documents.');
        }
      }

      ctx.status = 201;
      const sanitized = await this.sanitizeOutput(created, ctx);
      return this.transformResponse(sanitized);
    },
  }),
);
