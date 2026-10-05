/**
 * Stores optional intake files in a media-library folder named for the inquiry.
 * Public callers never receive the upload plugin; only this create path writes files.
 */

import { factories } from '@strapi/strapi';

const FOLDER_UID = 'plugin::upload.folder';
const ROOT_FOLDER = 'Contact inquiries';

function normalizeUploadFile(file: Record<string, unknown>) {
  const filepath = (file.filepath || file.path) as string;
  const name = String(file.originalFilename || file.name || 'document');
  const type = String(file.mimetype || file.type || 'application/octet-stream');
  const size = Number(file.size ?? 0);
  return {
    filepath,
    path: filepath,
    name,
    originalFilename: name,
    type,
    mimetype: type,
    size,
  };
}

export default factories.createCoreService(
  'api::contact-inquiry.contact-inquiry',
  ({ strapi }) => ({
    async ensureFolder(name: string, parentId: number | null) {
      const existing = await strapi.db.query(FOLDER_UID).findOne({
        where: {
          name,
          ...(parentId == null ? { parent: null } : { parent: parentId }),
        },
      });
      if (existing) return existing;

      return strapi.plugin('upload').service('folder').create({
        name,
        parent: parentId,
      });
    },

    async storeDocuments(inquiryId: string, files: Record<string, unknown>[]) {
      if (!files.length) return [] as number[];

      const root = await this.ensureFolder(ROOT_FOLDER, null);
      const folder = await this.ensureFolder(inquiryId, root.id as number);
      const normalized = files.map((file) => normalizeUploadFile(file));
      const uploadService = strapi.plugin('upload').service('upload');
      const uploaded = await uploadService.upload({
        data: {
          fileInfo: normalized.map((file) => ({
            name: file.name,
            folder: folder.id,
          })),
        },
        files: normalized.length === 1 ? normalized[0] : normalized,
      });
      const saved = Array.isArray(uploaded) ? uploaded : [uploaded];
      return saved
        .map((file) => file?.id)
        .filter((id): id is number | string => typeof id === 'number' || typeof id === 'string');
    },
  }),
);
