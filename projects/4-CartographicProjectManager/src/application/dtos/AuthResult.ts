import {User} from '@domain/entities/User';

/**
 * Authentication result DTO
 */
export interface AuthResult {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}
