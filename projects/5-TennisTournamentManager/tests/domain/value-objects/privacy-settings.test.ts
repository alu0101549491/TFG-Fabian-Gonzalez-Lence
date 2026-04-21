/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 17, 2026
 * @file tests/domain/value-objects/privacy-settings.test.ts
 * @desc Unit tests for PrivacySettings immutability and configuration defaults
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {PrivacyLevel} from '@domain/enumerations/privacy-level';
import {PrivacySettings} from '@domain/value-objects/privacy-settings';

describe('PrivacySettings', () => {
  it('freezes instances at runtime', () => {
    const settings = PrivacySettings.createDefault();

    expect(Object.isFrozen(settings)).toBe(true);
    expect(() => {
      (settings as unknown as Record<string, unknown>).email = PrivacyLevel.PUBLIC;
    }).toThrow(TypeError);
    expect(settings.email).toBe(PrivacyLevel.ADMINS_ONLY);
  });

  it('preserves configured values when constructed', () => {
    const settings = new PrivacySettings({
      email: PrivacyLevel.PUBLIC,
      phone: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
      allowContact: false,
    });

    expect(settings.email).toBe(PrivacyLevel.PUBLIC);
    expect(settings.phone).toBe(PrivacyLevel.TOURNAMENT_PARTICIPANTS);
    expect(settings.telegram).toBe(PrivacyLevel.ADMINS_ONLY);
    expect(settings.allowContact).toBe(false);
  });
});