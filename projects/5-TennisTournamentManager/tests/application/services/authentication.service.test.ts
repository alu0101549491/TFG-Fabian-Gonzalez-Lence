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
 * @see {@link https://typescripttutorial.net}
 */

jest.mock('@infrastructure/http/axios-client', () => ({
  AxiosClient: class {},
}));

import {AuthenticationService} from '@application/services/authentication.service';
import {inject} from '@angular/core';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpClient: {
    post: jest.Mock;
  };

  beforeEach(() => {
    httpClient = {
      post: jest.fn(),
    };

    (inject as jest.Mock).mockReturnValue(httpClient);
    service = new AuthenticationService();
  });

  afterEach(() => {
    (inject as jest.Mock).mockReset();
  });

  it('rejects login when email is missing', async () => {
    await expect(service.login('', 'password123')).rejects.toThrow('Email is required');
    expect(httpClient.post).not.toHaveBeenCalled();
  });

  it('registers a public user without sending a role override', async () => {
    httpClient.post.mockResolvedValue({token: 'token'});

    await service.register({
      email: 'player@example.com',
      password: 'password123',
      firstName: 'Ada',
      lastName: 'Lovelace',
      username: 'adal',
      gdprConsent: true,
      role: 'TOURNAMENT_ADMIN' as never,
    });

    expect(httpClient.post).toHaveBeenCalledWith('/auth/register', {
      email: 'player@example.com',
      password: 'password123',
      firstName: 'Ada',
      lastName: 'Lovelace',
      username: 'adal',
      phone: null,
    });
  });

  it('validates non-expired base64url JWT payloads', async () => {
    const payload = {
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const encodedPayload = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
    const token = `header.${encodedPayload}.signature`;

    await expect(service.validateSession(token)).resolves.toBe(true);
  });

  it('returns false for expired tokens', async () => {
    const payload = {
      exp: Math.floor(Date.now() / 1000) - 60,
    };
    const encodedPayload = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
    const token = `header.${encodedPayload}.signature`;

    await expect(service.validateSession(token)).resolves.toBe(false);
  });
});
