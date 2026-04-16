/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file tests/application/services/notification.service.test.ts
 * @desc Unit tests for the NotificationService.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {NotificationService} from '@application/services/notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    // TODO: set up mocked dependencies
    service = {} as NotificationService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: add unit tests for each method
});
