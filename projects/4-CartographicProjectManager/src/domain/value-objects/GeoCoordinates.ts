/**
 * Value object representing geographic coordinates
 * Immutable and validates coordinate ranges
 */
export class GeoCoordinates {
  private readonly latitude: number;
  private readonly longitude: number;

  constructor(latitude: number, longitude: number) {
    if (!this.isValidLatitude(latitude)) {
      throw new Error('Invalid latitude: must be between -90 and 90');
    }
    if (!this.isValidLongitude(longitude)) {
      throw new Error('Invalid longitude: must be between -180 and 180');
    }
    this.latitude = latitude;
    this.longitude = longitude;
  }

  /**
   * Validates the coordinate values
   * @returns True if coordinates are valid
   */
  public isValid(): boolean {
    return this.isValidLatitude(this.latitude) &&
           this.isValidLongitude(this.longitude);
  }

  private isValidLatitude(lat: number): boolean {
    return lat >= -90 && lat <= 90;
  }

  private isValidLongitude(lng: number): boolean {
    return lng >= -180 && lng <= 180;
  }

  // Getters
  public getLatitude(): number {
    return this.latitude;
  }

  public getLongitude(): number {
    return this.longitude;
  }

  /**
   * Creates a string representation of coordinates
   * @returns Formatted coordinate string
   */
  public toString(): string {
    return `${this.latitude}, ${this.longitude}`;
  }

  /**
   * Compares with another GeoCoordinates instance
   * @param other - Another GeoCoordinates to compare
   * @returns True if coordinates are equal
   */
  public equals(other: GeoCoordinates): boolean {
    return this.latitude === other.latitude &&
           this.longitude === other.longitude;
  }
}