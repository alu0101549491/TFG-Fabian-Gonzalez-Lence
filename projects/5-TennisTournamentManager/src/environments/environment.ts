/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 19, 2026
 * @file src/environments/environment.ts
 * @desc Environment configuration for development mode.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

export const environment = {
  production: import.meta.env.PROD ?? false,
  apiUrl: import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://tennis-backend-ltkr.onrender.com/api' : '/api'),
};
