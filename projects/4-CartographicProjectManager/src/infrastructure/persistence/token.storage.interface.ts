/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 9, 2026
 * @file src/infrastructure/persistence/token.storage.interface.ts
 * @desc Token storage interface used by the HTTP client and persistence implementations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Token storage abstraction.
 *
 * This interface is intentionally defined outside the HTTP client module to avoid
 * persistence → HTTP coupling and reduce circular-dependency risk.
 */
export interface ITokenStorage {
  /**
   * Retrieve the current access token.
   *
   * @returns The access token or null if not available
   */
  getAccessToken(): string | null;

  /**
   * Retrieve the current refresh token.
   *
   * @returns The refresh token or null if not available
   */
  getRefreshToken(): string | null;

  /**
   * Store new access and refresh tokens.
   *
   * @param accessToken - The new access token
   * @param refreshToken - The new refresh token
   */
  setTokens(accessToken: string, refreshToken: string): void;

  /**
   * Clear all stored tokens.
   */
  clearTokens(): void;
}
