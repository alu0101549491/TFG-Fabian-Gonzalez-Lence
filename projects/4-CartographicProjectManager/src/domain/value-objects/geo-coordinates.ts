/**
 * @module domain/value-objects/geo-coordinates
 * @description Value Object representing geographic coordinates (latitude/longitude).
 * Immutable by design — validated on construction.
 * @category Domain
 */

/**
 * Properties for creating a GeoCoordinates instance using standard notation.
 */
export interface GeoCoordinatesProps {
  /** Latitude coordinate (Y axis) in decimal degrees */
  latitude: number;
  /** Longitude coordinate (X axis) in decimal degrees */
  longitude: number;
}

/**
 * Properties for creating a GeoCoordinates instance using X/Y notation.
 * Compatible with requirements specification terminology.
 */
export interface GeoCoordinatesXY {
  /** X coordinate (longitude) */
  x: number;
  /** Y coordinate (latitude) */
  y: number;
}

/**
 * Represents a pair of geographic coordinates as an immutable value object.
 *
 * This class follows Domain-Driven Design principles for Value Objects:
 * - Immutability: Once created, coordinates cannot be changed
 * - Value equality: Two instances are equal if their coordinates match
 * - Self-validating: Invalid coordinates cannot be constructed
 * - No identity: Equality is based on values, not object identity
 *
 * Coordinate system: WGS84 (World Geodetic System 1984)
 * - Latitude: -90° (South Pole) to +90° (North Pole)
 * - Longitude: -180° (West) to +180° (East)
 *
 * @example
 * ```typescript
 * // Create coordinates for Madrid, Spain
 * const madrid = new GeoCoordinates(40.4168, -3.7038);
 *
 * // Create from array
 * const coords = GeoCoordinates.fromArray([40.4168, -3.7038]);
 *
 * // Create from object with X/Y notation
 * const xyCoords = GeoCoordinates.fromObject({ x: -3.7038, y: 40.4168 });
 *
 * // Check equality
 * if (madrid.equals(coords)) {
 *   console.log('Same location');
 * }
 *
 * // Calculate distance
 * const barcelona = new GeoCoordinates(41.3851, 2.1734);
 * const distance = madrid.distanceTo(barcelona); // ~504 km
 * ```
 */
export class GeoCoordinates {
  /** Epsilon for floating-point comparison tolerance */
  private static readonly EPSILON = 1e-9;

  /** Earth's mean radius in kilometers (for distance calculations) */
  private static readonly EARTH_RADIUS_KM = 6371;

  /** Minimum valid latitude value */
  private static readonly MIN_LATITUDE = -90;

  /** Maximum valid latitude value */
  private static readonly MAX_LATITUDE = 90;

  /** Minimum valid longitude value */
  private static readonly MIN_LONGITUDE = -180;

  /** Maximum valid longitude value */
  private static readonly MAX_LONGITUDE = 180;

  private readonly _latitude: number;
  private readonly _longitude: number;

  /**
   * Creates a new GeoCoordinates instance.
   *
   * @param latitude - Latitude value in decimal degrees (-90 to 90)
   * @param longitude - Longitude value in decimal degrees (-180 to 180)
   * @throws {Error} If latitude or longitude are not valid numbers
   * @throws {Error} If coordinates are outside valid ranges
   */
  constructor(latitude: number, longitude: number) {
    // Validate input types
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('Latitude and longitude must be numbers');
    }

    // Validate for NaN and Infinity
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error(
        'Latitude and longitude must be finite numbers (not NaN or Infinity)'
      );
    }

    // Validate ranges
    if (
      latitude < GeoCoordinates.MIN_LATITUDE ||
      latitude > GeoCoordinates.MAX_LATITUDE
    ) {
      throw new Error(
        `Latitude must be between ${GeoCoordinates.MIN_LATITUDE} and ${GeoCoordinates.MAX_LATITUDE} degrees`
      );
    }

    if (
      longitude < GeoCoordinates.MIN_LONGITUDE ||
      longitude > GeoCoordinates.MAX_LONGITUDE
    ) {
      throw new Error(
        `Longitude must be between ${GeoCoordinates.MIN_LONGITUDE} and ${GeoCoordinates.MAX_LONGITUDE} degrees`
      );
    }

    this._latitude = latitude;
    this._longitude = longitude;
  }

  /**
   * Gets the latitude value (Y coordinate).
   *
   * @returns The latitude coordinate in decimal degrees
   */
  get latitude(): number {
    return this._latitude;
  }

  /**
   * Gets the longitude value (X coordinate).
   *
   * @returns The longitude coordinate in decimal degrees
   */
  get longitude(): number {
    return this._longitude;
  }

  /**
   * Gets the Y coordinate (latitude).
   * Alias for latitude to match requirements terminology.
   *
   * @returns The Y coordinate (latitude) in decimal degrees
   */
  getY(): number {
    return this._latitude;
  }

  /**
   * Gets the X coordinate (longitude).
   * Alias for longitude to match requirements terminology.
   *
   * @returns The X coordinate (longitude) in decimal degrees
   */
  getX(): number {
    return this._longitude;
  }

  /**
   * Validates whether the coordinates are within valid geographic ranges.
   * This method always returns true for properly constructed instances,
   * as validation occurs in the constructor.
   *
   * @returns True if latitude is in [-90, 90] and longitude is in [-180, 180]
   */
  isValid(): boolean {
    return (
      Number.isFinite(this._latitude) &&
      Number.isFinite(this._longitude) &&
      this._latitude >= GeoCoordinates.MIN_LATITUDE &&
      this._latitude <= GeoCoordinates.MAX_LATITUDE &&
      this._longitude >= GeoCoordinates.MIN_LONGITUDE &&
      this._longitude <= GeoCoordinates.MAX_LONGITUDE
    );
  }

  /**
   * Checks equality with another GeoCoordinates instance based on values.
   * Uses epsilon tolerance for floating-point comparison.
   *
   * @param other - The other GeoCoordinates to compare with (or null/undefined)
   * @returns True if both latitude and longitude match within tolerance
   */
  equals(other: GeoCoordinates | null | undefined): boolean {
    if (!other || !(other instanceof GeoCoordinates)) {
      return false;
    }

    return (
      Math.abs(this._latitude - other._latitude) < GeoCoordinates.EPSILON &&
      Math.abs(this._longitude - other._longitude) < GeoCoordinates.EPSILON
    );
  }

  /**
   * Returns a human-readable string representation of the coordinates.
   * Format: "Lat: XX.XXXX, Lng: XX.XXXX" or "X: XX.XXXX, Y: XX.XXXX"
   *
   * @param useXY - If true, uses X/Y notation instead of Lat/Lng
   * @returns Formatted string representation
   */
  toString(useXY: boolean = false): string {
    if (useXY) {
      return `X: ${this._longitude.toFixed(4)}, Y: ${this._latitude.toFixed(4)}`;
    }
    return `Lat: ${this._latitude.toFixed(4)}, Lng: ${this._longitude.toFixed(4)}`;
  }

  /**
   * Returns coordinates as a tuple [latitude, longitude].
   * Useful for integration with mapping libraries (e.g., Leaflet, Google Maps).
   *
   * @returns Array with [latitude, longitude]
   */
  toArray(): [number, number] {
    return [this._latitude, this._longitude];
  }

  /**
   * Returns a plain object representation suitable for JSON serialization.
   *
   * @returns Object with latitude and longitude properties
   */
  toJSON(): GeoCoordinatesProps {
    return {
      latitude: this._latitude,
      longitude: this._longitude,
    };
  }

  /**
   * Calculates the great-circle distance to another point using the Haversine formula.
   * The Haversine formula determines the shortest distance between two points
   * on the surface of a sphere given their latitudes and longitudes.
   *
   * @param other - The destination coordinate
   * @returns Distance in kilometers
   * @throws {Error} If other is null or undefined
   *
   * @example
   * ```typescript
   * const madrid = new GeoCoordinates(40.4168, -3.7038);
   * const barcelona = new GeoCoordinates(41.3851, 2.1734);
   * const distance = madrid.distanceTo(barcelona); // approximately 504 km
   * ```
   */
  distanceTo(other: GeoCoordinates): number {
    if (!other || !(other instanceof GeoCoordinates)) {
      throw new Error('Cannot calculate distance to null or invalid coordinate');
    }

    // Convert degrees to radians
    const lat1Rad = this.toRadians(this._latitude);
    const lat2Rad = this.toRadians(other._latitude);
    const deltaLatRad = this.toRadians(other._latitude - this._latitude);
    const deltaLngRad = this.toRadians(other._longitude - this._longitude);

    // Haversine formula
    const a =
      Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(deltaLngRad / 2) *
        Math.sin(deltaLngRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return GeoCoordinates.EARTH_RADIUS_KM * c;
  }

  /**
   * Creates a GeoCoordinates instance from an array [latitude, longitude].
   *
   * @param coords - Array containing [latitude, longitude]
   * @returns New GeoCoordinates instance
   * @throws {Error} If array is invalid or doesn't have exactly 2 elements
   *
   * @example
   * ```typescript
   * const coords = GeoCoordinates.fromArray([40.4168, -3.7038]);
   * ```
   */
  static fromArray(coords: [number, number]): GeoCoordinates {
    if (!Array.isArray(coords)) {
      throw new Error('Input must be an array');
    }

    if (coords.length !== 2) {
      throw new Error('Array must contain exactly 2 elements [latitude, longitude]');
    }

    return new GeoCoordinates(coords[0], coords[1]);
  }

  /**
   * Creates a GeoCoordinates instance from an object.
   * Supports both standard {latitude, longitude} and X/Y {x, y} notation.
   *
   * @param obj - Object with coordinate properties
   * @returns New GeoCoordinates instance
   * @throws {Error} If object is invalid or missing required properties
   *
   * @example
   * ```typescript
   * // Standard notation
   * const coords1 = GeoCoordinates.fromObject({ latitude: 40.4168, longitude: -3.7038 });
   *
   * // X/Y notation (compatible with requirements)
   * const coords2 = GeoCoordinates.fromObject({ x: -3.7038, y: 40.4168 });
   * ```
   */
  static fromObject(
    obj: GeoCoordinatesProps | GeoCoordinatesXY
  ): GeoCoordinates {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Input must be a valid object');
    }

    // Check for standard notation (latitude/longitude)
    if ('latitude' in obj && 'longitude' in obj) {
      return new GeoCoordinates(obj.latitude, obj.longitude);
    }

    // Check for X/Y notation (x = longitude, y = latitude)
    if ('x' in obj && 'y' in obj) {
      return new GeoCoordinates(obj.y, obj.x);
    }

    throw new Error(
      'Object must have either {latitude, longitude} or {x, y} properties'
    );
  }

  /**
   * Converts degrees to radians.
   *
   * @param degrees - Angle in degrees
   * @returns Angle in radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
