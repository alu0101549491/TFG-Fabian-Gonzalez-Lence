/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 14, 2026
 * @file tests/mocks/user.service.ts
 * @desc Jest-safe UserService token stub for unit tests that exercise services using Angular injection.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

export class UserService {
  public getPublicUserInfo(): Promise<never> {
    throw new Error('UserService mock should be overridden in tests');
  }

  public getUserById(): Promise<never> {
    throw new Error('UserService mock should be overridden in tests');
  }
}