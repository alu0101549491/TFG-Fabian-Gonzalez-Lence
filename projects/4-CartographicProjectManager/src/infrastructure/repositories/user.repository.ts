/**
 * @module infrastructure/repositories/user-repository
 * @description Concrete implementation of the IUserRepository interface.
 * Uses Axios HTTP client to communicate with the backend API.
 * @category Infrastructure
 */

import {type IUserRepository} from '@domain/repositories/user-repository.interface';
import {type User} from '@domain/entities/user';
import {type UserRole} from '@domain/enumerations/user-role';

/**
 * HTTP-based implementation of the User repository.
 * Communicates with the backend REST API via Axios.
 */
export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    // TODO: Implement API call GET /api/users/:id
    throw new Error('Method not implemented.');
  }

  async findByUsername(username: string): Promise<User | null> {
    // TODO: Implement API call GET /api/users?username=:username
    throw new Error('Method not implemented.');
  }

  async save(user: User): Promise<User> {
    // TODO: Implement API call POST /api/users
    throw new Error('Method not implemented.');
  }

  async update(user: User): Promise<User> {
    // TODO: Implement API call PUT /api/users/:id
    throw new Error('Method not implemented.');
  }

  async findByRole(role: UserRole): Promise<User[]> {
    // TODO: Implement API call GET /api/users?role=:role
    throw new Error('Method not implemented.');
  }
}
