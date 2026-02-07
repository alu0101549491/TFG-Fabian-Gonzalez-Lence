/**
 * @module domain/value-objects/geo-coordinates
 * @description Value Object representing geographic coordinates (latitude/longitude).
 * Immutable by design — validated on construction.
 * @category Domain
 */

/**
 * Represents a pair of geographic coordinates.
 * Value Object: identified by its values, not by identity.
 */
export class GeoCoordinates {
  private readonly latitude: number;
  private readonly longitude: number;

  /**
   * Creates a new GeoCoordinates instance.
   * @param latitude - Latitude value (-90 to 90).
   * @param longitude - Longitude value (-180 to 180).
   */
  constructor(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  /**
   * Validates whether the coordinates are within valid geographic ranges.
   * @returns True if latitude is in [-90, 90] and longitude is in [-180, 180].
   */
  isValid(): boolean {
    // TODO: Implement validation logic
    throw new Error('Method not implemented.');
  }

  /**
   * Gets the latitude value.
   * @returns The latitude coordinate.
   */
  getLatitude(): number {
    return this.latitude;
  }

  /**
   * Gets the longitude value.
   * @returns The longitude coordinate.
   */
  getLongitude(): number {
    return this.longitude;
  }

  /**
   * Checks equality with another GeoCoordinates instance.
   * @param other - The other GeoCoordinates to compare with.
   * @returns True if both latitude and longitude match.
   */
  equals(other: GeoCoordinates): boolean {
    // TODO: Implement equality check
    throw new Error('Method not implemented.');
  }
}
