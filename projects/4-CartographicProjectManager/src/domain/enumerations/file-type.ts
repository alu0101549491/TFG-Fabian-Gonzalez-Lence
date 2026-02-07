/**
 * @module domain/enumerations/file-type
 * @description Enumeration defining the supported file formats.
 * @category Domain
 */

/**
 * Represents the type/format of a file uploaded to the system.
 */
export enum FileType {
  /** Portable Document Format files. */
  PDF = 'PDF',
  /** Keyhole Markup Language geographic data files. */
  KML = 'KML',
  /** Shapefile geographic data format. */
  SHP = 'SHP',
  /** Image files (PNG, JPG, TIFF, etc.). */
  IMAGE = 'IMAGE',
  /** Generic document files (DOCX, XLSX, etc.). */
  DOCUMENT = 'DOCUMENT',
}
