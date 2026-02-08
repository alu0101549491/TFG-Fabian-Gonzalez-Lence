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
  /** Generic document files (DOC, DOCX, TXT, etc.). */
  DOCUMENT = 'DOCUMENT',
  /** Spreadsheet files (XLS, XLSX, CSV). */
  SPREADSHEET = 'SPREADSHEET',
  /** CAD drawing files (DWG, DXF). */
  CAD = 'CAD',
  /** Compressed archive files (ZIP, RAR). */
  COMPRESSED = 'COMPRESSED',
}

/**
 * Human-readable display names for file types.
 */
export const FileTypeDisplayName: Record<FileType, string> = {
  [FileType.PDF]: 'PDF Document',
  [FileType.KML]: 'KML Geographic Data',
  [FileType.SHP]: 'Shapefile',
  [FileType.IMAGE]: 'Image',
  [FileType.DOCUMENT]: 'Document',
  [FileType.SPREADSHEET]: 'Spreadsheet',
  [FileType.CAD]: 'CAD Drawing',
  [FileType.COMPRESSED]: 'Compressed Archive',
};

/**
 * File extensions mapped to their corresponding FileType.
 */
export const FileExtensionToType: Record<string, FileType> = {
  // PDF
  pdf: FileType.PDF,
  // KML
  kml: FileType.KML,
  kmz: FileType.KML,
  // Shapefile
  shp: FileType.SHP,
  shx: FileType.SHP,
  dbf: FileType.SHP,
  prj: FileType.SHP,
  // Images
  jpg: FileType.IMAGE,
  jpeg: FileType.IMAGE,
  png: FileType.IMAGE,
  tiff: FileType.IMAGE,
  tif: FileType.IMAGE,
  gif: FileType.IMAGE,
  webp: FileType.IMAGE,
  // Documents
  doc: FileType.DOCUMENT,
  docx: FileType.DOCUMENT,
  txt: FileType.DOCUMENT,
  rtf: FileType.DOCUMENT,
  // Spreadsheets
  xls: FileType.SPREADSHEET,
  xlsx: FileType.SPREADSHEET,
  csv: FileType.SPREADSHEET,
  // CAD
  dwg: FileType.CAD,
  dxf: FileType.CAD,
  // Compressed
  zip: FileType.COMPRESSED,
  rar: FileType.COMPRESSED,
};

/**
 * Icon identifiers for file types (for UI rendering).
 */
export const FileTypeIcon: Record<FileType, string> = {
  [FileType.PDF]: 'pdf',
  [FileType.KML]: 'map',
  [FileType.SHP]: 'map-marked',
  [FileType.IMAGE]: 'image',
  [FileType.DOCUMENT]: 'file-text',
  [FileType.SPREADSHEET]: 'table',
  [FileType.CAD]: 'drafting-compass',
  [FileType.COMPRESSED]: 'file-archive',
};

/**
 * Type guard to check if a value is a valid FileType.
 *
 * @param value - The value to check
 * @returns True if the value is a valid FileType
 */
export function isValidFileType(value: unknown): value is FileType {
  return Object.values(FileType).includes(value as FileType);
}

/**
 * Determines the FileType from a file extension.
 *
 * @param extension - The file extension (with or without leading dot)
 * @returns The corresponding FileType, or undefined if not recognized
 */
export function getFileTypeFromExtension(
  extension: string
): FileType | undefined {
  const normalizedExt = extension.toLowerCase().replace(/^\./, '');
  return FileExtensionToType[normalizedExt];
}

/**
 * Gets all supported file extensions for a given FileType.
 *
 * @param fileType - The file type
 * @returns Array of file extensions (without leading dots)
 */
export function getExtensionsForFileType(fileType: FileType): string[] {
  return Object.entries(FileExtensionToType)
    .filter(([, type]) => type === fileType)
    .map(([ext]) => ext);
}

/**
 * Array of all file types for iteration.
 */
export const ALL_FILE_TYPES = Object.values(FileType);
