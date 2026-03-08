/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 24, 2026
 * @file backend/src/presentation/middlewares/upload.middleware.ts
 * @desc Multer middleware configuration for file uploads
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import multer from 'multer';
import type {Request} from 'express';
import {BadRequestError} from '@shared/errors.js';

/**
 * Maximum file size (50 MB)
 */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Allowed file extensions
 */
const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.tif',
  '.tiff',
  '.zip',
  '.rar',
  '.7z',
  '.dwg',
  '.dxf',
  '.shp',
  '.kml',
  '.kmz',
  '.geojson',
];

/**
 * Allowed MIME types.
 *
 * Note: Some CAD/GIS formats may be uploaded as `application/octet-stream` by clients.
 */
const ALLOWED_MIME_TYPES = new Set([
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/tiff',

  // Archives
  'application/zip',
  'application/x-7z-compressed',
  'application/vnd.rar',
  'application/x-rar-compressed',

  // Common fallback for CAD/GIS uploads
  'application/octet-stream',
]);

/**
 * Multer storage configuration (memory storage for streaming to Dropbox)
 */
const storage = multer.memoryStorage();

/**
 * File filter to validate file types
 * @param req - Express request
 * @param file - Uploaded file
 * @param cb - Callback
 */
function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  const originalName = file.originalname.toLowerCase();
  const lastDot = originalName.lastIndexOf('.');
  const ext = lastDot >= 0 ? originalName.substring(lastDot) : '';
  const mime = file.mimetype.split(';')[0]?.trim().toLowerCase() ?? '';

  const extensionAllowed = ALLOWED_EXTENSIONS.includes(ext);
  const mimeAllowed = ALLOWED_MIME_TYPES.has(mime);

  if (extensionAllowed && mimeAllowed) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `File type not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
      )
    );
  }
}

/**
 * Multer upload middleware configured for single file upload
 */
export const uploadSingle = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
}).single('file');

/**
 * Multer upload middleware configured for multiple file uploads
 */
export const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
}).array('files', 10); // Max 10 files at once
