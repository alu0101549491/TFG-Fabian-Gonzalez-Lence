/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/domain/value-objects/geo-coordinates.ts
 * @desc Value object representing geographic coordinates
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Geographic coordinates value object
 */
export class GeoCoordinates {
  /**
   * Creates new geographic coordinates
   *
   * @param x - Longitude
   * @param y - Latitude
   */
  public constructor(
    public readonly x: number,
    public readonly y: number
  ) {
    this.validate();
  }

  /**
   * Validates coordinate values
   */
  private validate(): void {
    if (this.x < -180 || this.x > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
    if (this.y < -90 || this.y > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
  }

  /**
   * Checks equality with another coordinates object
   *
   * @param other - Other coordinates
   * @returns True if coordinates are equal
   */
  public equals(other: GeoCoordinates): boolean {
    return this.x === other.x && this.y === other.y;
  }

  /**
   * Converts to plain object
   *
   * @returns Plain object representation
   */
  public toObject(): {x: number; y: number} {
    return {x: this.x, y: this.y};
  }

  /**
   * Creates coordinates from plain object
   *
   * @param obj - Plain object with x and y
   * @returns GeoCoordinates instance
   */
  public static fromObject(obj: {
    x: number;
    y: number;
  }): GeoCoordinates {
    return new GeoCoordinates(obj.x, obj.y);
  }
}
