/**
 * case controller — bind signed-in email on create; upload docs into media folders.
 */

import { factories } from '@strapi/strapi';

function asFileArray(filesField: unknown): unknown[] {
  if (!filesField) return [];
  return Array.isArray(filesField) ? filesField : [filesField];
}

/** Media folder name: ${caseNumber}_${caseDocumentId} */
function caseMediaFolderName(caseNumber?: string | null, documentId?: string | null) {
  const id = String(documentId || '').trim();
  const number = String(caseNumber || '').trim();
  if (number && id) return `${number}_${id}`;
  return number || id || 'case';
}

export default factories.createCoreController(
  'api::case.case',
  ({ strapi }) => ({
    async create(ctx) {
      const authUser = ctx.state.user as { email?: string } | undefined;
      const email = authUser?.email?.trim();

      if (!email) {
        return ctx.unauthorized('You must be signed in to register a case.');
      }

      const body = (ctx.request.body ?? {}) as {
        data?: Record<string, unknown> | string;
      };

      // Support JSON body and multipart where `data` may be a JSON string.
      let data: Record<string, unknown> = {};
      if (typeof body.data === 'string') {
        try {
          data = JSON.parse(body.data) as Record<string, unknown>;
        } catch {
          data = {};
        }
      } else if (body.data && typeof body.data === 'object') {
        data = { ...body.data };
      } else {
        // Flat multipart fields
        const flat = body as Record<string, unknown>;
        for (const key of [
          'caseNumber',
          'caseType',
          'filingDate',
          'petitioner',
          'petitionerEmail',
          'petitionerPhone',
          'respondent',
          'respondentEmail',
          'respondentPhone',
          'state',
          'district',
          'courtComplex',
          'description',
        ]) {
          if (flat[key] != null) data[key] = flat[key];
        }
      }

      data.user = email;

      const created = await strapi.documents('api::case.case').create({
        data,
        status: 'published',
      });

      const files = asFileArray(
        (ctx.request as { files?: { documents?: unknown; files?: unknown } })
          .files?.documents ??
          (ctx.request as { files?: { documents?: unknown; files?: unknown } })
            .files?.files,
      );

      if (files.length) {
        const caseFolderId = caseMediaFolderName(
          (created as { caseNumber?: string }).caseNumber,
          (created as { documentId?: string }).documentId,
        );

        const mediaService = strapi.service('api::case.case');
        const { files: uploaded } = await mediaService.uploadToCaseFolder({
          email,
          caseId: caseFolderId,
          files,
        });

        if (uploaded.length) {
          const documentId = (created as { documentId?: string }).documentId;
          await strapi.documents('api::case.case').update({
            documentId,
            data: {
              documents: uploaded.map((f: { id: number | string }) => f.id),
            },
            status: 'published',
          });
        }
      }

      const sanitized = await this.sanitizeOutput(created, ctx);
      return this.transformResponse(sanitized);
    },

    /**
     * POST /api/cases/:documentId/documents
     * Upload documents into {email}/{caseNumber}_{documentId}.
     */
    async uploadDocuments(ctx) {
      try {
      const authUser = ctx.state.user as { email?: string } | undefined;
      const email = authUser?.email?.trim();
      if (!email) {
        return ctx.unauthorized('You must be signed in to upload documents.');
      }

      const documentId = ctx.params.documentId as string;
      const existing = await strapi.documents('api::case.case').findOne({
        documentId,
        status: 'published',
        fields: ['caseNumber', 'user', 'documentId'],
      });

      if (!existing) {
        return ctx.notFound('Case not found.');
      }

      if (
        String((existing as { user?: string }).user || '').toLowerCase() !==
        email.toLowerCase()
      ) {
        return ctx.forbidden('You can only upload documents to your own cases.');
      }

      const files = asFileArray(
        (ctx.request as { files?: { documents?: unknown; files?: unknown } })
          .files?.documents ??
          (ctx.request as { files?: { documents?: unknown; files?: unknown } })
            .files?.files,
      );

      if (!files.length) {
        return ctx.badRequest('No documents were provided.');
      }

      // Prefer caseNumber from multipart body (sent by Next), then DB entry.
      const body = (ctx.request.body ?? {}) as { caseNumber?: string };
      const caseNumberFromBody =
        typeof body.caseNumber === 'string' ? body.caseNumber.trim() : '';
      const caseNumberFromDb = String(
        (existing as { caseNumber?: string }).caseNumber || '',
      ).trim();

      // Hard fallback via DB query if document service omits caseNumber.
      let caseNumber = caseNumberFromBody || caseNumberFromDb;
      if (!caseNumber) {
        const row = await strapi.db.query('api::case.case').findOne({
          where: { documentId },
          select: ['caseNumber'],
        });
        caseNumber = String(row?.caseNumber || '').trim();
      }

      const caseFolderId = caseMediaFolderName(
        caseNumber,
        (existing as { documentId?: string }).documentId || documentId,
      );

      strapi.log.info(
        `[case.uploadDocuments] folder=${caseFolderId} caseNumber=${caseNumber} documentId=${documentId}`,
      );

      const mediaService = strapi.service('api::case.case');
      const { folderPath, files: uploaded } =
        await mediaService.uploadToCaseFolder({
          email,
          caseId: caseFolderId,
          files: files as Record<string, unknown>[],
        });

      // Append new uploads; do not replace existing documents.
      const withDocs = await strapi.documents('api::case.case').findOne({
        documentId,
        status: 'published',
        populate: ['documents'],
      });
      const existingIds = (
        ((withDocs as { documents?: { id: number | string }[] } | null)
          ?.documents ?? []) as { id: number | string }[]
      ).map((d) => d.id);
      const nextIds = [
        ...existingIds,
        ...uploaded.map((f: { id: number | string }) => f.id),
      ];

      await strapi.documents('api::case.case').update({
        documentId,
        data: {
          documents: nextIds,
        },
        status: 'published',
      });

      ctx.body = {
        data: {
          folderPath,
          caseFolder: caseFolderId,
          files: uploaded,
        },
      };
      } catch (err) {
        strapi.log.error('[case.uploadDocuments]', err);
        return ctx.internalServerError(
          err instanceof Error ? err.message : 'Document upload failed.',
        );
      }
    },

    /**
     * POST /api/cases/:documentId/documents/remove
     * Body: { fileId: number | string }
     * Remove a document from the case and delete it from the Media Library.
     */
    async deleteDocument(ctx) {
      try {
        const authUser = ctx.state.user as { email?: string } | undefined;
        const email = authUser?.email?.trim();
        if (!email) {
          return ctx.unauthorized('You must be signed in to delete documents.');
        }

        const documentId = String(ctx.params.documentId || '').trim();
        const body = (ctx.request.body ?? {}) as {
          fileId?: string | number;
          data?: { fileId?: string | number };
        };
        const fileIdRaw =
          body.fileId ?? body.data?.fileId ?? ctx.request.query?.fileId;
        const fileId = Number(fileIdRaw);
        if (!documentId || !Number.isFinite(fileId)) {
          return ctx.badRequest('Case id and file id are required.');
        }

        let existing = await strapi.documents('api::case.case').findOne({
          documentId,
          status: 'published',
          populate: ['documents'],
        });
        let status: 'published' | 'draft' = 'published';
        if (!existing) {
          existing = await strapi.documents('api::case.case').findOne({
            documentId,
            status: 'draft',
            populate: ['documents'],
          });
          status = 'draft';
        }

        if (!existing) {
          return ctx.notFound('Case not found.');
        }

        if (
          String((existing as { user?: string }).user || '').toLowerCase() !==
          email.toLowerCase()
        ) {
          return ctx.forbidden(
            'You can only delete documents from your own cases.',
          );
        }

        const docs = ((existing as { documents?: { id: number | string }[] })
          .documents ?? []) as { id: number | string }[];
        const target = docs.find((d) => Number(d.id) === fileId);
        if (!target) {
          return ctx.notFound('Document not found on this case.');
        }

        const remainingIds = docs
          .filter((d) => Number(d.id) !== fileId)
          .map((d) => d.id);

        await strapi.documents('api::case.case').update({
          documentId,
          data: {
            documents: remainingIds,
          },
          status,
        });

        const fileEntity = await strapi.db
          .query('plugin::upload.file')
          .findOne({ where: { id: fileId } });

        if (fileEntity) {
          await strapi.plugin('upload').service('upload').remove(fileEntity);
        }

        ctx.body = {
          data: {
            ok: true,
            deletedFileId: fileId,
            remaining: remainingIds,
          },
        };
      } catch (err) {
        strapi.log.error('[case.deleteDocument]', err);
        return ctx.internalServerError(
          err instanceof Error ? err.message : 'Document delete failed.',
        );
      }
    },
  }),
);

