import {
  GeoCoordinates,
} from '../../../../src/domain/value-objects/GeoCoordinates';

describe('GeoCoordinates Value Object', () => {
  describe('constructor', () => {
    it('should create valid coordinates', () => {
      const coords = new GeoCoordinates(28.4636, -16.2518);
      expect(coords.getLatitude()).toBe(28.4636);
      expect(coords.getLongitude()).toBe(-16.2518);
    });

    it('should throw error for invalid latitude', () => {
      expect(() => new GeoCoordinates(91, 0)).toThrow(
        'Invalid latitude',
      );
      expect(() => new GeoCoordinates(-91, 0)).toThrow(
        'Invalid latitude',
      );
    });

    it('should throw error for invalid longitude', () => {
      expect(() => new GeoCoordinates(0, 181)).toThrow(
        'Invalid longitude',
      );
      expect(() => new GeoCoordinates(0, -181)).toThrow(
        'Invalid longitude',
      );
    });
  });

  describe('isValid', () => {
    it('should return true for valid coordinates', () => {
      const coords = new GeoCoordinates(0, 0);
      expect(coords.isValid()).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      const coords = new GeoCoordinates(28.4636, -16.2518);
      expect(coords.toString()).toBe('28.4636, -16.2518');
    });
  });

  describe('equals', () => {
    it('should return true for equal coordinates', () => {
      const coords1 = new GeoCoordinates(28.4636, -16.2518);
      const coords2 = new GeoCoordinates(28.4636, -16.2518);
      expect(coords1.equals(coords2)).toBe(true);
    });

    it('should return false for different coordinates', () => {
      const coords1 = new GeoCoordinates(28.4636, -16.2518);
      const coords2 = new GeoCoordinates(40.4168, -3.7038);
      expect(coords1.equals(coords2)).toBe(false);
    });
  });

  describe('boundary values', () => {
    it('should accept boundary latitude values', () => {
      expect(
        () => new GeoCoordinates(90, 0),
      ).not.toThrow();
      expect(
        () => new GeoCoordinates(-90, 0),
      ).not.toThrow();
    });

    it('should accept boundary longitude values', () => {
      expect(
        () => new GeoCoordinates(0, 180),
      ).not.toThrow();
      expect(
        () => new GeoCoordinates(0, -180),
      ).not.toThrow();
    });
  });
});
