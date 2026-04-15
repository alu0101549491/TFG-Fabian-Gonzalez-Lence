/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/registration.repository.ts
 * @desc HTTP-based implementation of IRegistrationRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {Registration} from '@domain/entities/registration';
import {IRegistrationRepository} from '@domain/repositories/registration.repository.interface';
import {RegistrationStatus} from '@domain/enumerations/registration-status';
import {AcceptanceType} from '@domain/enumerations/acceptance-type';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IRegistrationRepository.
 * Communicates with the backend REST API via Axios.
 */
@Injectable({providedIn: 'root'})
export class RegistrationRepositoryImpl implements IRegistrationRepository {
  /** The HTTP client for making API requests */
  private readonly httpClient = inject(AxiosClient);

  /**
   * Finds a registration by its unique identifier.
   * @param id - The registration identifier
   * @returns Promise resolving to the registration or null if not found
   */
  public async findById(id: string): Promise<Registration | null> {
    try {
      const response = await this.httpClient.get<Registration>(`/registrations/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all registrations from the system.
   * @returns Promise resolving to an array of all registrations
   */
  public async findAll(): Promise<Registration[]> {
    const response = await this.httpClient.get<Registration[]>('/registrations');
    return response;
  }

  /**
   * Persists a new registration to the database.
   * @param registration - The registration entity to save
   * @returns Promise resolving to the saved registration with assigned ID
   */
  public async save(registration: Registration): Promise<Registration> {
    const response = await this.httpClient.post<Registration>('/registrations', registration);
    return response;
  }

  /**
   * Updates an existing registration in the database.
   * @param registration - The registration entity with updated data
   * @returns Promise resolving to the updated registration
   */
  public async update(registration: Registration): Promise<Registration> {
    // Backend expects only seedNumber in request body, not full registration object
    const response = await this.httpClient.put<Registration>(
      `/registrations/${registration.id}`, 
      { seedNumber: registration.seedNumber }
    );
    return response;
  }

  /**
   * Removes a registration from the database.
   * @param id - The identifier of the registration to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/registrations/${id}`);
  }

  /**
   * Retrieves all registrations for a specific participant.
   * @param participantId - The participant's identifier
   * @returns Promise resolving to an array of registrations
   */
  public async findByParticipantId(participantId: string): Promise<Registration[]> {
    const response = await this.httpClient.get<Registration[]>(`/registrations?participantId=${participantId}`);
    return response;
  }

  /**
   * Retrieves all registrations for a specific tournament.
   * @param tournamentId - The tournament identifier
   * @returns Promise resolving to an array of registrations
   */
  public async findByTournament(tournamentId: string): Promise<Registration[]> {
    const response = await this.httpClient.get<Registration[]>(`/registrations?tournamentId=${tournamentId}`);
    return response;
  }

  /**
   * Retrieves all registrations for a specific category.
   * @param categoryId - The category identifier
   * @returns Promise resolving to an array of registrations
   */
  public async findByCategoryId(categoryId: string): Promise<Registration[]> {
    const response = await this.httpClient.get<Registration[]>(`/registrations?categoryId=${categoryId}`);
    return response;
  }

  /**
   * Retrieves all registrations for a tournament with a specific status.
   * @param tournamentId - The tournament identifier
   * @param status - The registration status to filter by
   * @returns Promise resolving to an array of registrations
   */
  public async findByStatus(tournamentId: string, status: RegistrationStatus): Promise<Registration[]> {
    const response = await this.httpClient.get<Registration[]>(`/registrations?tournamentId=${tournamentId}&status=${status}`);
    return response;
  }

  /**
   * Updates the status of a registration.
   * @param id - The registration identifier
   * @param status - The new registration status
   * @param acceptanceType - Optional acceptance type (for admin setting as alternate)
   * @returns Promise resolving to the updated registration
   */
  public async updateStatus(id: string, status: RegistrationStatus, acceptanceType?: AcceptanceType): Promise<Registration> {
    const body: {status: RegistrationStatus; acceptanceType?: AcceptanceType} = {status};
    if (acceptanceType !== undefined) {
      body.acceptanceType = acceptanceType;
    }
    const response = await this.httpClient.put<Registration>(`/registrations/${id}/status`, body);
    return response;
  }

  /**
   * Enrolls a guest (non-system) participant into a tournament category.
   * Calls POST /api/registrations/admin-enroll which creates a guest user
   * and registration in one operation without requiring REGISTRATION_OPEN status.
   *
   * @param categoryId - The category identifier
   * @param guestFirstName - First name of the guest participant
   * @param guestLastName - Last name of the guest participant
   * @returns Promise resolving to the created registration
   */
  public async adminEnroll(categoryId: string, guestFirstName: string, guestLastName: string): Promise<Registration> {
    const response = await this.httpClient.post<Registration>('/registrations/admin-enroll', {
      categoryId,
      guestFirstName,
      guestLastName,
    });
    return response;
  }

  /**
   * Withdraws a registration via the timing-aware withdraw endpoint (FR13).
   * Backend handles ALT promotion and WALKOVER assignment depending on tournament phase.
   *
   * @param id - The registration identifier to withdraw
   * @returns Promise resolving when withdrawal is complete
   */
  public async withdraw(id: string): Promise<void> {
    await this.httpClient.post(`/registrations/${id}/withdraw`, {});
  }

  /**
   * Updates the doubles partner for a registration (FR15).
   *
   * @param id - The registration identifier
   * @param partnerId - ID of the partner user, or null to clear the partner
   * @returns Promise resolving to the updated registration
   */
  public async updatePartner(id: string, partnerId: string | null): Promise<Registration> {
    const response = await this.httpClient.put<Registration>(`/registrations/${id}/partner`, {partnerId});
    return response;
  }
}
