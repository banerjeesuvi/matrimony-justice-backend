/**
 * case service — includes media-library folder helpers for case documents.
 */

import { factories } from '@strapi/strapi';

const FOLDER_UID = 'plugin::upload.folder';

function sanitizeFolderName(name: string) {
  return String(name || '')
    .trim()
    .replace(/[\\/]+/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 200);
}

function normalizeUploadFile(file: Record<string, unknown>) {
  const filepath = (file.filepath || file.path) as string;
  const name = String(
    file.originalFilename || file.name || 'document',
  );
  const type = String(
    file.mimetype || file.type || 'application/octet-stream',
  );
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

export default factories.createCoreService('api::case.case', ({ strapi }) => ({
  sanitizeFolderName,

  async ensureFolder(name: string, parentId: number | null = null) {
    const existing = await strapi.db.query(FOLDER_UID).findOne({
      where: {
        name,
        ...(parentId == null ? { parent: null } : { parent: parentId }),
      },
    });
    if (existing) return existing;

    const folderService = strapi.plugin('upload').service('folder');
    return folderService.create({
      name,
      parent: parentId,
    });
  },

  async uploadToCaseFolder({
    email,
    caseId,
    files,
  }: {
    email: string;
    caseId: string;
    files: Record<string, unknown>[];
  }) {
    const emailFolderName = sanitizeFolderName(email);
    const caseFolderName = sanitizeFolderName(caseId);

    if (!emailFolderName || !caseFolderName) {
      throw new Error('Email and case id are required for document folders.');
    }

    if (!files?.length) {
      return { folderPath: `${emailFolderName}/${caseFolderName}`, files: [] };
    }

    const emailFolder = await this.ensureFolder(emailFolderName, null);
    const caseFolder = await this.ensureFolder(
      caseFolderName,
      emailFolder.id as number,
    );

    const uploadService = strapi.plugin('upload').service('upload');
    const normalized = files.map((f) => normalizeUploadFile(f));

    // Validate paths exist before calling upload provider
    for (const f of normalized) {
      if (!f.filepath) {
        throw new Error(`Upload file is missing a temp path: ${f.name}`);
      }
    }

    const uploaded = await uploadService.upload({
      data: {
        fileInfo: normalized.map((f) => ({
          name: f.name,
          folder: caseFolder.id,
        })),
      },
      files: normalized.length === 1 ? normalized[0] : normalized,
    });

    return {
      folderPath: `${emailFolderName}/${caseFolderName}`,
      files: Array.isArray(uploaded) ? uploaded : [uploaded],
    };
  },
}));
