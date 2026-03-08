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
import {UPLOAD} from '@shared/constants.js';

const ALLOWED_EXTENSIONS: readonly string[] = UPLOAD.ALLOWED_EXTENSIONS;
const ALLOWED_MIME_TYPES: ReadonlySet<string> = new Set(UPLOAD.ALLOWED_MIME_TYPES);

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
    fileSize: UPLOAD.MAX_FILE_SIZE,
  },
  fileFilter,
}).single('file');

/**
 * Multer upload middleware configured for multiple file uploads
 */
export const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: UPLOAD.MAX_FILE_SIZE,
  },
  fileFilter,
}).array('files', 10); // Max 10 files at once
