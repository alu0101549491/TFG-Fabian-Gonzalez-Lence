/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file tests/application/services/match.service.test.ts
 * @desc Unit tests for the MatchService.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {MatchService} from '@application/services/match.service';

describe('MatchService', () => {
  let service: MatchService;

  beforeEach(() => {
    // TODO: set up mocked dependencies
    service = {} as MatchService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: add unit tests for each method
});
