/**
 * @module Utilities/AudioValidator
 * @category Utilities
 * @description
 * This module provides validation functions for audio and song data in the Music Web Player.
 * It validates URLs, file formats, and complete song objects to ensure data integrity
 * before adding songs to the playlist.
 */

import { Song } from '@types/song';
import { ValidationResult } from '@types/validation';

// Constants for supported formats and validation
const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'ogg', 'm4a'];
const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
const MAX_URL_LENGTH = 2048;

// Error message templates
const ERROR_MESSAGES = {
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_URL: (type: string) => `${type} URL must be a valid URL`,
  UNSUPPORTED_AUDIO_FORMAT: 'Audio format must be MP3, WAV, OGG, or M4A',
  INVALID_IMAGE_FORMAT: 'Cover image should be JPG, PNG, GIF, WebP, or SVG',
};

/**
 * Utility class for validating audio and song data.
 * All methods are static and pure functions with no side effects.
 */
export class AudioValidator {
  /**
   * Validates that a URL is properly formatted for an audio file.
   * @param url - The audio file URL to validate
   * @returns true if URL format is valid, false otherwise
   * @example
   * AudioValidator.isValidAudioUrl("https://example.com/song.mp3") // true
   * AudioValidator.isValidAudioUrl("not-a-url") // false
   */
  public static isValidAudioUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    const trimmedUrl = url.trim();
    if (!trimmedUrl || trimmedUrl.length > MAX_URL_LENGTH) return false;

    // Check for HTTP/HTTPS URLs
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      try {
        new URL(trimmedUrl);
        return true;
      } catch {
        return false;
      }
    }

    // Check for relative paths
    return trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./');
  }

  /**
   * Validates that a URL is properly formatted for an image file.
   * @param url - The image URL to validate
   * @returns true if URL format is valid, false otherwise
   * @example
   * AudioValidator.isValidImageUrl("https://example.com/cover.jpg") // true
   * AudioValidator.isValidImageUrl("invalid") // false
   */
  public static isValidImageUrl(url: string): boolean {
    return this.isValidAudioUrl(url); // Same validation rules as audio URLs
  }

  /**
   * Checks if an audio file has a supported format based on file extension.
   * @param url - The audio file URL to check
   * @returns true if format is supported, false otherwise
   * @example
   * AudioValidator.isSupportedFormat("https://example.com/song.mp3") // true
   * AudioValidator.isSupportedFormat("https://example.com/song.flac") // false
   */
  public static isSupportedFormat(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    // Extract the file extension (case insensitive)
    const extensionMatch = url.split('?')[0].match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
    if (!extensionMatch) return false;

    const extension = extensionMatch[1].toLowerCase();
    return SUPPORTED_AUDIO_FORMATS.includes(extension);
  }

  /**
   * Validates if an image URL has a supported format based on file extension.
   * @param url - The image URL to check
   * @returns true if format is supported, false otherwise
   * @example
   * AudioValidator.isValidImageFormat("https://example.com/cover.jpg") // true
   * AudioValidator.isValidImageFormat("https://example.com/cover.bmp") // false
   */
  public static isValidImageFormat(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    const extensionMatch = url.split('?')[0].match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
    if (!extensionMatch) return false;

    const extension = extensionMatch[1].toLowerCase();
    return SUPPORTED_IMAGE_FORMATS.includes(extension);
  }

  /**
   * Performs comprehensive validation on a Song object.
   * @param song - The song object to validate
   * @returns ValidationResult with isValid boolean and errors array
   * @example
   * // Valid song
   * AudioValidator.validateSong({
   *   id: "1",
   *   title: "Great Song",
   *   artist: "Artist Name",
   *   cover: "https://example.com/cover.jpg",
   *   url: "https://example.com/song.mp3"
   * })
   * // Returns: { isValid: true, errors: [] }
   */
  public static validateSong(song: Song): ValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (!song) {
      return {
        isValid: false,
        errors: [
          ERROR_MESSAGES.REQUIRED_FIELD('Title'),
          ERROR_MESSAGES.REQUIRED_FIELD('Artist'),
          ERROR_MESSAGES.INVALID_URL('Cover'),
          ERROR_MESSAGES.INVALID_URL('Audio'),
        ],
      };
    }

    // Validate title
    if (!song.title || typeof song.title !== 'string' || !song.title.trim()) {
      errors.push(ERROR_MESSAGES.REQUIRED_FIELD('Title'));
    }

    // Validate artist
    if (!song.artist || typeof song.artist !== 'string' || !song.artist.trim()) {
      errors.push(ERROR_MESSAGES.REQUIRED_FIELD('Artist'));
    }

    // Validate cover URL
    if (!song.cover || typeof song.cover !== 'string' || !song.cover.trim()) {
      errors.push(ERROR_MESSAGES.INVALID_URL('Cover'));
    } else if (!this.isValidImageUrl(song.cover)) {
      errors.push(ERROR_MESSAGES.INVALID_URL('Cover'));
    } else if (!this.isValidImageFormat(song.cover)) {
      errors.push(ERROR_MESSAGES.INVALID_IMAGE_FORMAT);
    }

    // Validate audio URL
    if (!song.url || typeof song.url !== 'string' || !song.url.trim()) {
      errors.push(ERROR_MESSAGES.REQUIRED_FIELD('Audio URL'));
    } else if (!this.isValidAudioUrl(song.url)) {
      errors.push(ERROR_MESSAGES.INVALID_URL('Audio'));
    } else if (!this.isSupportedFormat(song.url)) {
      errors.push(ERROR_MESSAGES.UNSUPPORTED_AUDIO_FORMAT);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
