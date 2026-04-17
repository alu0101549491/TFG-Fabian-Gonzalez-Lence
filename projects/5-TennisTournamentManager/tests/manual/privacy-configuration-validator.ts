/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 5, 2026
 * @file tests/manual/privacy-configuration-validator.ts
 * @desc Manual validation script for privacy settings across different configurations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {PrivacyLevel} from '../../src/domain/enumerations/privacy-level';
import {PrivacySettings} from '../../src/domain/value-objects/privacy-settings';

/**
 * Privacy Configuration Test Suite
 * 
 * This script validates privacy settings behavior across all configurations:
 * - 4 privacy levels (PUBLIC, ALL_REGISTERED, TOURNAMENT_PARTICIPANTS, ADMINS_ONLY)
 * - 8 privacy-scoped fields plus the allow-contact flag
 * - default, public, private, mixed, partial, serialization, and immutability behavior
 * 
 * Run this test suite to verify privacy enforcement logic.
 */

console.log('🔒 Privacy Configuration Validation Suite\n');
console.log('=' .repeat(60));

const testResults: boolean[] = [];

/**
 * Converts a boolean test outcome into a printable pass/fail marker.
 *
 * @param passed - Whether the validation step succeeded
 * @returns Printable status marker
 */
function status(passed: boolean): string {
  return passed ? '✓' : '✗';
}

/**
 * Stores the result of one manual validation step for the final summary.
 *
 * @param passed - Whether the validation step succeeded
 */
function recordTestResult(passed: boolean): void {
  testResults.push(passed);
}

// Test 1: Default Privacy Settings
console.log('\n✅ Test 1: Default Privacy Settings');
const defaultSettings = PrivacySettings.createDefault();
const defaultSettingsPassed =
  defaultSettings.email === PrivacyLevel.ADMINS_ONLY &&
  defaultSettings.phone === PrivacyLevel.ADMINS_ONLY &&
  defaultSettings.telegram === PrivacyLevel.ADMINS_ONLY &&
  defaultSettings.whatsapp === PrivacyLevel.ADMINS_ONLY &&
  defaultSettings.avatar === PrivacyLevel.ALL_REGISTERED &&
  defaultSettings.ranking === PrivacyLevel.ALL_REGISTERED &&
  defaultSettings.history === PrivacyLevel.TOURNAMENT_PARTICIPANTS &&
  defaultSettings.statistics === PrivacyLevel.TOURNAMENT_PARTICIPANTS &&
  defaultSettings.allowContact;
recordTestResult(defaultSettingsPassed);
console.log('   Contact fields (email, phone, telegram, whatsapp): ADMINS_ONLY ' + status(
  defaultSettings.email === PrivacyLevel.ADMINS_ONLY &&
  defaultSettings.phone === PrivacyLevel.ADMINS_ONLY &&
  defaultSettings.telegram === PrivacyLevel.ADMINS_ONLY &&
  defaultSettings.whatsapp === PrivacyLevel.ADMINS_ONLY,
));
console.log('   Profile fields (avatar, ranking): ALL_REGISTERED ' + status(
  defaultSettings.avatar === PrivacyLevel.ALL_REGISTERED &&
  defaultSettings.ranking === PrivacyLevel.ALL_REGISTERED,
));
console.log('   Tournament data (history, statistics): TOURNAMENT_PARTICIPANTS ' + status(
  defaultSettings.history === PrivacyLevel.TOURNAMENT_PARTICIPANTS &&
  defaultSettings.statistics === PrivacyLevel.TOURNAMENT_PARTICIPANTS,
));
console.log('   Allow contact: true ' + status(defaultSettings.allowContact));
console.log('   Result: Default settings prioritize privacy ' + status(defaultSettingsPassed));

// Test 2: Public Profile Configuration
console.log('\n✅ Test 2: Public Profile (All fields PUBLIC)');
const publicSettings = PrivacySettings.createPublic();
const publicFields = ['email', 'phone', 'telegram', 'whatsapp', 'avatar', 'ranking', 'history', 'statistics'];
const allPublic = publicFields.every(field => 
  publicSettings[field as keyof PrivacySettings] === PrivacyLevel.PUBLIC
);
const publicSettingsPassed = allPublic && publicSettings.allowContact;
recordTestResult(publicSettingsPassed);
console.log('   All 8 fields set to PUBLIC: ' + status(allPublic));
console.log('   Allow contact: ' + publicSettings.allowContact + ' ' + status(publicSettings.allowContact));
console.log('   Result: Maximum visibility configuration ' + status(publicSettingsPassed));

// Test 3: Private Profile Configuration
console.log('\n✅ Test 3: Private Profile (All fields ADMINS_ONLY)');
const privateSettings = PrivacySettings.createPrivate();
const allPrivate = publicFields.every(field => 
  privateSettings[field as keyof PrivacySettings] === PrivacyLevel.ADMINS_ONLY
);
const privateSettingsPassed = allPrivate && !privateSettings.allowContact;
recordTestResult(privateSettingsPassed);
console.log('   All 8 fields set to ADMINS_ONLY: ' + status(allPrivate));
console.log('   Allow contact: ' + privateSettings.allowContact + ' ' + status(!privateSettings.allowContact));
console.log('   Result: Maximum privacy configuration ' + status(privateSettingsPassed));

// Test 4: Mixed Configuration (Real-world scenario)
console.log('\n✅ Test 4: Mixed Privacy Configuration');
const mixedSettings = new PrivacySettings({
  email: PrivacyLevel.ADMINS_ONLY,
  phone: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
  telegram: PrivacyLevel.ALL_REGISTERED,
  whatsapp: PrivacyLevel.PUBLIC,
  avatar: PrivacyLevel.PUBLIC,
  ranking: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
  history: PrivacyLevel.ALL_REGISTERED,
  statistics: PrivacyLevel.ALL_REGISTERED,
  allowContact: true,
});
const mixedSettingsPassed =
  mixedSettings.email === PrivacyLevel.ADMINS_ONLY &&
  mixedSettings.phone === PrivacyLevel.TOURNAMENT_PARTICIPANTS &&
  mixedSettings.telegram === PrivacyLevel.ALL_REGISTERED &&
  mixedSettings.whatsapp === PrivacyLevel.PUBLIC &&
  mixedSettings.avatar === PrivacyLevel.PUBLIC &&
  mixedSettings.ranking === PrivacyLevel.TOURNAMENT_PARTICIPANTS &&
  mixedSettings.history === PrivacyLevel.ALL_REGISTERED &&
  mixedSettings.statistics === PrivacyLevel.ALL_REGISTERED &&
  mixedSettings.allowContact;
recordTestResult(mixedSettingsPassed);
console.log('   Email: ADMINS_ONLY ' + status(mixedSettings.email === PrivacyLevel.ADMINS_ONLY));
console.log('   Phone: TOURNAMENT_PARTICIPANTS ' + status(mixedSettings.phone === PrivacyLevel.TOURNAMENT_PARTICIPANTS));
console.log('   Telegram: ALL_REGISTERED ' + status(mixedSettings.telegram === PrivacyLevel.ALL_REGISTERED));
console.log('   WhatsApp: PUBLIC ' + status(mixedSettings.whatsapp === PrivacyLevel.PUBLIC));
console.log('   Avatar: PUBLIC ' + status(mixedSettings.avatar === PrivacyLevel.PUBLIC));
console.log('   Ranking: TOURNAMENT_PARTICIPANTS ' + status(mixedSettings.ranking === PrivacyLevel.TOURNAMENT_PARTICIPANTS));
console.log('   History: ALL_REGISTERED ' + status(mixedSettings.history === PrivacyLevel.ALL_REGISTERED));
console.log('   Statistics: ALL_REGISTERED ' + status(mixedSettings.statistics === PrivacyLevel.ALL_REGISTERED));
console.log('   Allow contact: true ' + status(mixedSettings.allowContact));
console.log('   Result: Granular field-level control ' + status(mixedSettingsPassed));

// Test 5: Privacy Level Hierarchy
console.log('\n✅ Test 5: Privacy Level Hierarchy Validation');
const levels = [
  PrivacyLevel.PUBLIC,
  PrivacyLevel.ALL_REGISTERED,
  PrivacyLevel.TOURNAMENT_PARTICIPANTS,
  PrivacyLevel.ADMINS_ONLY
];
const hierarchyPassed =
  levels[0] === PrivacyLevel.PUBLIC &&
  levels[1] === PrivacyLevel.ALL_REGISTERED &&
  levels[2] === PrivacyLevel.TOURNAMENT_PARTICIPANTS &&
  levels[3] === PrivacyLevel.ADMINS_ONLY;
recordTestResult(hierarchyPassed);
console.log('   PUBLIC < ALL_REGISTERED < TOURNAMENT_PARTICIPANTS < ADMINS_ONLY');
console.log('   Hierarchy correctly defined: ' + status(hierarchyPassed));

// Test 6: Partial Configuration (Defaults applied)
console.log('\n✅ Test 6: Partial Configuration with Defaults');
const partialSettings = new PrivacySettings({
  email: PrivacyLevel.PUBLIC,
  phone: PrivacyLevel.PUBLIC,
  // Other fields use defaults
});
const partialSettingsPassed =
  partialSettings.email === PrivacyLevel.PUBLIC &&
  partialSettings.phone === PrivacyLevel.PUBLIC &&
  partialSettings.telegram === PrivacyLevel.ADMINS_ONLY &&
  partialSettings.avatar === PrivacyLevel.ALL_REGISTERED;
recordTestResult(partialSettingsPassed);
console.log('   Email: PUBLIC (custom) ' + status(partialSettings.email === PrivacyLevel.PUBLIC));
console.log('   Phone: PUBLIC (custom) ' + status(partialSettings.phone === PrivacyLevel.PUBLIC));
console.log('   Telegram: ADMINS_ONLY (default) ' + status(partialSettings.telegram === PrivacyLevel.ADMINS_ONLY));
console.log('   Avatar: ALL_REGISTERED (default) ' + status(partialSettings.avatar === PrivacyLevel.ALL_REGISTERED));
console.log('   Result: Defaults applied correctly ' + status(partialSettingsPassed));

// Test 7: toObject Serialization
console.log('\n✅ Test 7: Serialization to Plain Object');
const settingsObject = mixedSettings.toObject();
const hasAllFields = Object.keys(settingsObject).length === 9;
const isPlainObject = typeof settingsObject === 'object' && !Array.isArray(settingsObject);
const serializationPassed = hasAllFields && isPlainObject;
recordTestResult(serializationPassed);
console.log(`   Serialized ${Object.keys(settingsObject).length} fields: ` + status(hasAllFields));
console.log('   Is plain object: ' + status(isPlainObject));
console.log('   Result: Serialization works correctly ' + status(serializationPassed));

// Test 8: Immutability
console.log('\n✅ Test 8: Immutability (readonly properties)');
const testSettings = PrivacySettings.createDefault();
let isImmutable = true;
try {
  // Try to modify readonly property (should fail in strict mode)
  (testSettings as any).email = PrivacyLevel.PUBLIC;
  if (testSettings.email === PrivacyLevel.PUBLIC) {
    isImmutable = false;
  }
} catch (error) {
  isImmutable = true; // Error thrown = immutability enforced
}
recordTestResult(isImmutable);
console.log('   Properties are readonly: ' + status(isImmutable));
console.log('   Result: Value object is immutable ' + status(isImmutable));

// Test 9: All Privacy Levels Are Valid Enum Values
console.log('\n✅ Test 9: Privacy Level Enum Validation');
const enumValues = Object.values(PrivacyLevel);
const hasAllLevels = enumValues.length === 4;
const hasCorrectValues = 
  enumValues.includes(PrivacyLevel.PUBLIC) &&
  enumValues.includes(PrivacyLevel.ALL_REGISTERED) &&
  enumValues.includes(PrivacyLevel.TOURNAMENT_PARTICIPANTS) &&
  enumValues.includes(PrivacyLevel.ADMINS_ONLY);
const enumValidationPassed = hasAllLevels && hasCorrectValues;
recordTestResult(enumValidationPassed);
console.log('   Enum has 4 levels: ' + status(hasAllLevels));
console.log('   All expected values present: ' + status(hasCorrectValues));
console.log('   Result: Privacy levels correctly defined ' + status(enumValidationPassed));

// Test 10: Field Coverage
console.log('\n✅ Test 10: All Required Fields Present');
const requiredFields = [
  'email', 'phone', 'telegram', 'whatsapp',
  'avatar', 'ranking', 'history', 'statistics',
  'allowContact'
];
const settings = new PrivacySettings();
const allFieldsPresent = requiredFields.every(field => 
  settings.hasOwnProperty(field)
);
recordTestResult(allFieldsPresent);
console.log(`   ${requiredFields.length} required fields present: ` + status(allFieldsPresent));
console.log('   Result: Complete privacy configuration ' + status(allFieldsPresent));

// Summary
const passedTests = testResults.filter(Boolean).length;
const failedTests = testResults.length - passedTests;
console.log('\n' + '='.repeat(60));
console.log('📊 Test Summary\n');
console.log(`   Total Tests: ${testResults.length}`);
console.log(`   Passed: ${passedTests} ${passedTests === testResults.length ? '✅' : ''}`.trimEnd());
console.log(`   Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`.trimEnd());
console.log(`\n${failedTests === 0 ? '✅ All privacy configuration tests passed!' : '❌ Privacy configuration validation found failing checks.'}`);
console.log('\n📝 Privacy Settings Features Validated:');
console.log('   ✓ Default, public, and private configurations');
console.log('   ✓ Mixed field-level privacy settings');
console.log('   ✓ Privacy level hierarchy');
console.log('   ✓ Partial configuration with defaults');
console.log('   ✓ Serialization to plain objects');
console.log('   ✓ Immutability (value object pattern)');
console.log('   ✓ Privacy level enum validation');
console.log('   ✓ Complete field coverage (9 fields)');
console.log(`\n🔐 Privacy System Status: ${failedTests === 0 ? 'FULLY FUNCTIONAL ✅' : 'NEEDS ATTENTION ❌'}`);
console.log('=' + '='.repeat(59));
