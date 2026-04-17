/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 1, 2026
 * @file backend/src/application/services/image-optimization.service.ts
 * @desc Image optimization service for compressing, resizing, and converting uploaded images.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import {config} from '../../shared/config';
import {getCdnUrl} from '../../shared/utils/cdn-helper';

/**
 * Image optimization result containing processed buffer and metadata.
 */
export interface ImageOptimizationResult {
  /** Optimized image buffer */
  buffer: Buffer;
  /** Image format (jpeg, png, webp) */
  format: string;
  /** File size in bytes */
  size: number;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
}

/**
 * Image resize options for generating thumbnails or responsive images.
 */
export interface ImageResizeOptions {
  /** Target width in pixels */
  width?: number;
  /** Target height in pixels */
  height?: number;
  /** Maintain aspect ratio (default: true) */
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  /** Image quality 1-100 (default: from config) */
  quality?: number;
}

/**
 * ImageOptimizationService handles image processing operations.
 * 
 * Features:
 * - **Compression**: Reduces file size without significant quality loss
 * - **Format Conversion**: Converts to WebP for modern browsers
 * - **Resizing**: Generates thumbnails and responsive sizes
 * - **Metadata Stripping**: Removes EXIF data for privacy
 * 
 * @example
 * ```typescript
 * const service = new ImageOptimizationService();
 * const result = await service.optimizeImage(buffer, { width: 800, quality: 85 });
 * await service.saveImage(result.buffer, 'avatars/user-123.jpg');
 * ```
 */
export class ImageOptimizationService {
  private readonly uploadDir: string;
  private readonly imageQuality: number;
  private readonly maxFileSizeBytes: number;

  /**
   * Creates an instance of ImageOptimizationService.
   */
  public constructor() {
    this.uploadDir = config.upload.uploadDir;
    this.imageQuality = config.upload.imageQuality;
    this.maxFileSizeBytes = config.upload.maxFileSizeMB * 1024 * 1024;
  }

  /**
   * Optimizes an image buffer with compression and optional resizing.
   * 
   * Steps:
   * 1. Validates input buffer
   * 2. Strips EXIF metadata (privacy)
   * 3. Resizes if dimensions specified
   * 4. Converts to WebP format (best compression)
   * 5. Applies quality compression
   * 
   * @param buffer - Input image buffer
   * @param options - Resize and quality options
   * @returns Optimized image result with metadata
   * @throws {Error} If buffer is invalid or processing fails
   */
  public async optimizeImage(
    buffer: Buffer,
    options: ImageResizeOptions = {},
  ): Promise<ImageOptimizationResult> {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new Error('Invalid image buffer');
    }

    if (buffer.length > this.maxFileSizeBytes) {
      throw new Error(
        `Image size exceeds maximum allowed size of ${config.upload.maxFileSizeMB}MB`,
      );
    }

    const quality = options.quality ?? this.imageQuality;
    
    // Create sharp instance and strip metadata (EXIF data for privacy)
    let image = sharp(buffer).rotate(); // Auto-rotate based on EXIF orientation

    // Apply resizing if dimensions specified
    if (options.width || options.height) {
      image = image.resize({
        width: options.width,
        height: options.height,
        fit: options.fit ?? 'cover',
        withoutEnlargement: true, // Don't upscale smaller images
      });
    }

    // Convert to WebP format with compression
    const optimized = await image
      .webp({quality, effort: 4}) // effort 0-6, 4 is good balance
      .toBuffer({resolveWithObject: true});

    return {
      buffer: optimized.data,
      format: 'webp',
      size: optimized.data.length,
      width: optimized.info.width,
      height: optimized.info.height,
    };
  }

  /**
   * Generates multiple responsive image sizes (thumbnail, medium, large).
   * 
   * Creates 3 optimized versions:
   * - Thumbnail: 150x150 (avatars, previews)
   * - Medium: 400x400 (cards, listings)
   * - Large: 1200x1200 (full view)
   * 
   * @param buffer - Input image buffer
   * @returns Object with buffers for each size
   * @throws {Error} If buffer processing fails
   */
  public async generateResponsiveSizes(
    buffer: Buffer,
  ): Promise<{thumbnail: Buffer; medium: Buffer; large: Buffer}> {
    const [thumbnail, medium, large] = await Promise.all([
      this.optimizeImage(buffer, {width: 150, height: 150, fit: 'cover'}),
      this.optimizeImage(buffer, {width: 400, height: 400, fit: 'cover'}),
      this.optimizeImage(buffer, {width: 1200, height: 1200, fit: 'inside'}),
    ]);

    return {
      thumbnail: thumbnail.buffer,
      medium: medium.buffer,
      large: large.buffer,
    };
  }

  /**
   * Saves an image buffer to the filesystem.
   * 
   * @param buffer - Image buffer to save
   * @param relativePath - Path relative to upload directory (e.g., 'avatars/user-123.webp')
   * @returns Full filesystem path to saved image
   * @throws {Error} If directory creation or file write fails
   */
  public async saveImage(buffer: Buffer, relativePath: string): Promise<string> {
    const fullPath = path.join(this.uploadDir, relativePath);
    const directory = path.dirname(fullPath);

    // Ensure directory exists
    await fs.mkdir(directory, {recursive: true});

    // Write buffer to file
    await fs.writeFile(fullPath, buffer);

    return fullPath;
  }

  /**
   * Deletes an image from the filesystem.
   * 
   * @param relativePath - Path relative to upload directory
   * @throws {Error} If file deletion fails
   */
  public async deleteImage(relativePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, relativePath);
    
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      // Ignore error if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Validates if a buffer is a valid image.
   * 
   * @param buffer - Buffer to validate
   * @returns True if buffer is a valid image format
   */
  public async validateImage(buffer: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(buffer).metadata();
      return !!metadata.format && ['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(metadata.format);
    } catch {
      return false;
    }
  }

  /**
   * Gets image metadata without processing.
   * 
   * @param buffer - Image buffer
   * @returns Image metadata (format, dimensions, size)
   * @throws {Error} If buffer is not a valid image
   */
  public async getImageMetadata(
    buffer: Buffer,
  ): Promise<{format: string; width: number; height: number; size: number}> {
    const metadata = await sharp(buffer).metadata();
    
    if (!metadata.format || !metadata.width || !metadata.height) {
      throw new Error('Invalid image metadata');
    }

    return {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      size: buffer.length,
    };
  }

  /**
   * Gets the public URL for an image.
   * 
   * Returns CDN URL if CDN is enabled (production), otherwise local URL.
   * 
   * @param relativePath - Path relative to upload directory
   * @returns Public URL (CDN if enabled, local otherwise)
   * 
   * @example
   * ```typescript
   * // Development: '/uploads/avatars/user-123.webp'
   * // Production: 'https://cdn.example.com/uploads/avatars/user-123.webp'
   * ```
   */
  public getImageUrl(relativePath: string): string {
    return getCdnUrl(`/uploads/${relativePath}`);
  }

  /**
   * Ensures the upload directory exists.
   * 
   * @throws {Error} If directory creation fails
   */
  public async ensureUploadDirectory(): Promise<void> {
    await fs.mkdir(this.uploadDir, {recursive: true});
    await fs.mkdir(path.join(this.uploadDir, 'avatars'), {recursive: true});
    await fs.mkdir(path.join(this.uploadDir, 'logos'), {recursive: true});
  }
}
