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
  const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`));
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
