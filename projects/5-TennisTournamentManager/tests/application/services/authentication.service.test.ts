/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file tests/application/services/authentication.service.test.ts
 * @desc Unit tests for the AuthenticationService.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {AuthenticationService} from '@application/services/authentication.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(() => {
    // TODO: set up mocked dependencies
    service = {} as AuthenticationService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: add unit tests for each method
});
