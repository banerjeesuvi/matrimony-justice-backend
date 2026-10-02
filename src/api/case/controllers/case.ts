/**
 * case controller — bind signed-in email on create; upload into media folders:
 *   documents: {userEmail}/document
 *   petitioner pic: {userEmail}/{petitionerName}{documentId}
 *   respondent pic: {userEmail}/{respondentName}{documentId}
 */

import { factories } from '@strapi/strapi';

function asFileArray(filesField: unknown): unknown[] {
  if (!filesField) return [];
  return Array.isArray(filesField) ? filesField : [filesField];
}

function filesFromField(
  files: Record<string, unknown> | undefined,
  name: string,
): unknown[] {
  if (!files) return [];
  const direct = asFileArray(files[name]);
  if (direct.length) return direct;
  const collected: unknown[] = [];
  for (const [key, value] of Object.entries(files)) {
    for (const file of asFileArray(value)) {
      const field = String(
        (file as { fieldname?: string }).fieldname || key,
      );
      if (field === name) collected.push(file);
    }
  }
  return collected;
}

function requestFiles(ctx: {
  request: { files?: Record<string, unknown> };
}): unknown[] {
  const files = ctx.request.files ?? {};
  return [
    ...filesFromField(files, 'documents'),
    ...filesFromField(files, 'files'),
    ...filesFromField(files, 'avatar'),
    ...filesFromField(files, 'file'),
    ...filesFromField(files, 'image'),
  ];
}

function partySegment(value: string) {
  return (
    value
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 180) || 'unknown'
  );
}

function partyFolderName(partyName: string, documentId: string) {
  return `${partySegment(partyName)}${String(documentId || '').trim()}`;
}

type PartyPicPlanItem =
  | { t: 'e'; id: number | string }
  | { t: 'n'; i: number };

function parsePartyPicPlan(raw: unknown): PartyPicPlanItem[] | undefined {
  if (raw == null || raw === '') return undefined;
  let parsed: unknown = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  if (!Array.isArray(parsed)) return undefined;
  return parsed
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as { t?: string; id?: number | string; i?: number };
      if (row.t === 'e' && row.id != null && row.id !== '') {
        return { t: 'e' as const, id: row.id };
      }
      if (row.t === 'n' && typeof row.i === 'number') {
        return { t: 'n' as const, i: row.i };
      }
      return null;
    })
    .filter((item): item is PartyPicPlanItem => Boolean(item));
}

function resolvePartyPicIds(
  plan: PartyPicPlanItem[] | undefined,
  uploaded: { id: number | string }[],
): (number | string)[] | undefined {
  if (plan === undefined) {
    if (!uploaded.length) return undefined;
    return uploaded.map((f) => f.id);
  }
  return plan
    .map((item) => {
      if (item.t === 'e') return item.id;
      return uploaded[item.i]?.id;
    })
    .filter((id): id is number | string => id != null && id !== '');
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
          'caseTitle',
          'legalFramework',
          'sections',
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

      const files = [
        ...filesFromField(
          (ctx.request as { files?: Record<string, unknown> }).files,
          'documents',
        ),
        ...filesFromField(
          (ctx.request as { files?: Record<string, unknown> }).files,
          'files',
        ),
      ];

      if (files.length) {
        const mediaService = strapi.service('api::case.case');
        const { files: uploaded } = await mediaService.uploadToCaseFolder({
          email,
          caseId: 'document',
          files: files as Record<string, unknown>[],
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
     * Upload documents into {email}/document and party photos into
     * {email}/{partyName}{documentId}.
     */
    async uploadDocuments(ctx) {
      try {
      const authUser = ctx.state.user as { email?: string } | undefined;
      const email = authUser?.email?.trim();
      if (!email) {
        return ctx.unauthorized('You must be signed in to upload documents.');
      }

      const documentId = String(ctx.params.documentId || '').trim();

      // Signup posts the profile photo to /api/cases/avatar/documents.
      // Settings Save posts profile fields to the same route (uploadDocuments is allowed).
      if (documentId.toLowerCase() === 'avatar') {
        const body = (ctx.request.body ?? {}) as Record<string, unknown>;
        const avatarFiles = requestFiles(ctx);
        const wantsProfile =
          body.action === 'profile' ||
          body.updateProfile === true ||
          body.updateProfile === 'true' ||
          typeof body.phone === 'string' ||
          typeof body.firstName === 'string' ||
          typeof body.lastName === 'string' ||
          typeof body.address === 'string';

        if (!avatarFiles.length && wantsProfile) {
          const userId = (authUser as { id?: number | string } | undefined)?.id;
          if (userId == null || userId === '') {
            return ctx.unauthorized('You must be signed in.');
          }

          const data: Record<string, unknown> = {};
          if (typeof body.phone === 'string') data.phone = body.phone.trim();
          if (typeof body.firstName === 'string') data.firstName = body.firstName.trim();
          if (typeof body.lastName === 'string') data.lastName = body.lastName.trim();
          if (typeof body.address === 'string') data.address = body.address.trim();

          if (Object.keys(data).length) {
            try {
              await strapi.db.query('plugin::users-permissions.user').update({
                where: { id: userId },
                data,
              });
            } catch {
              const fallback: Record<string, unknown> = {};
              if (typeof data.phone === 'string') fallback.phone = data.phone;
              if (Object.keys(fallback).length) {
                await strapi.db.query('plugin::users-permissions.user').update({
                  where: { id: userId },
                  data: fallback,
                });
              }
            }
          }

          const user = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: userId },
            populate: ['avatar'],
          });
          if (user && typeof user === 'object') {
            delete (user as { password?: string }).password;
            delete (user as { resetPasswordToken?: string }).resetPasswordToken;
            delete (user as { confirmationToken?: string }).confirmationToken;
          }
          ctx.body = { data: user };
          return;
        }

        if (!avatarFiles.length) {
          return ctx.badRequest('No avatar file was provided.');
        }

        const mediaService = strapi.service('api::case.case');
        const { folderPath, files: uploaded } =
          await mediaService.uploadToCaseFolder({
            email,
            caseId: 'avatar',
            files: avatarFiles as Record<string, unknown>[],
          });

        const fileId = uploaded[0]?.id;
        const userId = (authUser as { id?: number | string } | undefined)?.id;
        if (fileId && userId != null) {
          try {
            await strapi.db.query('plugin::users-permissions.user').update({
              where: { id: userId },
              data: { avatar: fileId },
            });
          } catch (attachErr) {
            strapi.log.warn(
              '[case.uploadDocuments] Avatar file saved but user.avatar was not attached.',
              attachErr,
            );
          }
        }

        ctx.body = {
          data: {
            folderPath,
            files: uploaded,
            avatar: uploaded[0] ?? null,
          },
        };
        return;
      }

      let existing = await strapi.documents('api::case.case').findOne({
        documentId,
        status: 'published',
        populate: ['documents', 'petitionerPic', 'respondentPic'],
      });
      if (!existing) {
        existing = await strapi.documents('api::case.case').findOne({
          documentId,
          status: 'draft',
          populate: ['documents', 'petitionerPic', 'respondentPic'],
        });
      }

      if (!existing) {
        return ctx.notFound('Case not found.');
      }

      if (
        String((existing as { user?: string }).user || '').toLowerCase() !==
        email.toLowerCase()
      ) {
        return ctx.forbidden('You can only upload documents to your own cases.');
      }

      const requestFilesMap = (ctx.request as { files?: Record<string, unknown> })
        .files;
      const files = [
        ...filesFromField(requestFilesMap, 'documents'),
        ...filesFromField(requestFilesMap, 'files'),
      ];
      const petitionerPics = filesFromField(requestFilesMap, 'petitionerPic');
      const respondentPics = filesFromField(requestFilesMap, 'respondentPic');
      const body = (ctx.request.body ?? {}) as {
        petitioner?: string;
        respondent?: string;
        petitionerPicPlan?: unknown;
        respondentPicPlan?: unknown;
      };
      const petitionerPlan = parsePartyPicPlan(body.petitionerPicPlan);
      const respondentPlan = parsePartyPicPlan(body.respondentPicPlan);

      if (
        !files.length &&
        !petitionerPics.length &&
        !respondentPics.length &&
        petitionerPlan === undefined &&
        respondentPlan === undefined
      ) {
        return ctx.badRequest('No documents were provided.');
      }

      const petitionerName = String(
        body.petitioner ||
          (existing as { petitioner?: string }).petitioner ||
          'petitioner',
      );
      const respondentName = String(
        body.respondent ||
          (existing as { respondent?: string }).respondent ||
          'respondent',
      );
      const petitionerFolder = partyFolderName(petitionerName, documentId);
      const respondentFolder = partyFolderName(respondentName, documentId);

      strapi.log.info(
        `[case.uploadDocuments] folders=document,${petitionerFolder},${respondentFolder} documentId=${documentId}`,
      );

      const mediaService = strapi.service('api::case.case');
      let folderPath = `${email}/document`;
      let uploaded: { id: number | string }[] = [];
      if (files.length) {
        const result = await mediaService.uploadToCaseFolder({
          email,
          caseId: 'document',
          files: files as Record<string, unknown>[],
        });
        folderPath = result.folderPath;
        uploaded = result.files;
      }

      const uploadedPetitioner = petitionerPics.length
        ? (
            await mediaService.uploadToCaseFolder({
              email,
              caseId: petitionerFolder,
              files: petitionerPics as Record<string, unknown>[],
            })
          ).files
        : [];
      const uploadedRespondent = respondentPics.length
        ? (
            await mediaService.uploadToCaseFolder({
              email,
              caseId: respondentFolder,
              files: respondentPics as Record<string, unknown>[],
            })
          ).files
        : [];

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

      const nextPetitionerIds = resolvePartyPicIds(
        petitionerPlan,
        uploadedPetitioner,
      );
      const nextRespondentIds = resolvePartyPicIds(
        respondentPlan,
        uploadedRespondent,
      );

      const patch: Record<string, unknown> = {};
      if (uploaded.length) {
        patch.documents = nextIds;
      }
      if (nextPetitionerIds !== undefined) {
        patch.petitionerPic = nextPetitionerIds;
      }
      if (nextRespondentIds !== undefined) {
        patch.respondentPic = nextRespondentIds;
      }

      if (Object.keys(patch).length) {
        try {
          await strapi.documents('api::case.case').update({
            documentId,
            data: patch,
            status: 'published',
          });
        } catch (attachErr) {
          strapi.log.warn(
            '[case.uploadDocuments] Files saved but case attach failed.',
            attachErr,
          );
          if (uploaded.length) {
            try {
              await strapi.documents('api::case.case').update({
                documentId,
                data: { documents: nextIds },
                status: 'published',
              });
            } catch {
              // Files are already in the Media Library folder.
            }
          }
        }
      }

      if (uploaded.length) {
        const label =
          String((existing as { caseNumber?: string }).caseNumber || '').trim() ||
          'your case';
        await strapi.service('api::notification.notification').notify({
          user: email,
          title: 'Document uploaded',
          body:
            uploaded.length === 1
              ? `A document was added to case ${label}.`
              : `${uploaded.length} documents were added to case ${label}.`,
          type: 'document',
          href: `/my-case/${documentId}`,
          caseDocumentId: documentId,
        });
      }

      ctx.body = {
        data: {
          folderPath,
          caseFolder: 'document',
          petitionerFolderPath: uploadedPetitioner[0]
            ? `${email}/${petitionerFolder}`
            : undefined,
          respondentFolderPath: uploadedRespondent[0]
            ? `${email}/${respondentFolder}`
            : undefined,
          files: uploaded,
          petitionerPic: uploadedPetitioner,
          respondentPic: uploadedRespondent,
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

