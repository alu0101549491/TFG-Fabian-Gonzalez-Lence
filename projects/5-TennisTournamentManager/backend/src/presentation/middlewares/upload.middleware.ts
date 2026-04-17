/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 1, 2026
 * @file backend/src/presentation/middlewares/upload.middleware.ts
 * @desc Multer middleware for handling file uploads with validation.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import multer from 'multer';
import {Request} from 'express';
import {config} from '../../shared/config';

/**
 * Allowed image MIME types for upload validation.
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

/**
 * File filter function for multer to validate uploaded images.
 * 
 * Validates:
 * - MIME type must be in allowed list
 * - File extension must match MIME type
 * 
 * @param req - Express request
 * @param file - Uploaded file
 * @param cb - Callback function
 */
function imageFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error(
        `Invalid file type. Allowed types: ${config.upload.allowedFormats.join(', ')}`,
      ),
    );
  }

  // Check file extension
  const ext = file.originalname.toLowerCase().split('.').pop();
  if (!ext || !config.upload.allowedFormats.includes(ext)) {
    return cb(
      new Error(
        `Invalid file extension. Allowed extensions: ${config.upload.allowedFormats.join(', ')}`,
      ),
    );
  }

  cb(null, true);
}

/**
 * Multer configuration for image uploads.
 * 
 * - **Storage**: Memory storage (buffers for processing with sharp)
 * - **Limits**: Max file size from config (default 5MB)
 * - **Filter**: Only allows image formats
 */
const uploadConfig = multer({
  storage: multer.memoryStorage(), // Store in memory for processing
  limits: {
    fileSize: config.upload.maxFileSizeMB * 1024 * 1024, // Convert MB to bytes
    files: 1, // Single file upload
  },
  fileFilter: imageFilter,
});

/**
 * Middleware for single image upload.
 * Expects field name 'image' in multipart/form-data.
 * 
 * @example
 * ```typescript
 * router.post('/users/:id/avatar', uploadImage, controller.uploadAvatar);
 * ```
 */
export const uploadImage = uploadConfig.single('image');

/**
 * Middleware for multiple image uploads.
 * Expects field name 'images' with up to 5 files.
 * 
 * @example
 * ```typescript
 * router.post('/gallery', uploadImages, controller.uploadGallery);
 * ```
 */
export const uploadImages = uploadConfig.array('images', 5);
