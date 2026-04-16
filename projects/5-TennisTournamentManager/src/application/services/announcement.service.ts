/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 7, 2026
 * @file application/services/announcement.service.ts
 * @desc Frontend service for announcement operations (FR47-FR49).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AnnouncementDto, CreateAnnouncementDto} from '../dto';
import {environment} from '../../environments/environment';

/**
 * Frontend service for managing announcements.
 */
@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/announcements`;

  /**
   * Creates a new announcement.
   *
   * @param data - Announcement data
   * @returns Observable of created announcement
   */
  public create(data: CreateAnnouncementDto): Observable<AnnouncementDto> {
    return this.http.post<AnnouncementDto>(this.baseUrl, data);
  }

  /**
   * Retrieves announcements with optional filters.
   *
   * @param filters - Query filters
   * @returns Observable of announcement array
   */
  public getAll(filters?: {
    tournamentId?: string;
    tags?: string[];
    search?: string;
    isPinned?: boolean;
  }): Observable<AnnouncementDto[]> {
    let params = new HttpParams();

    if (filters?.tournamentId) {
      params = params.set('tournamentId', filters.tournamentId);
    }
    if (filters?.tags && filters.tags.length > 0) {
      params = params.set('tags', filters.tags.join(','));
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.isPinned !== undefined) {
      params = params.set('isPinned', filters.isPinned.toString());
    }

    return this.http.get<AnnouncementDto[]>(this.baseUrl, {params});
  }

  /**
   * Retrieves a single announcement by ID.
   *
   * @param id - Announcement ID
   * @returns Observable of announcement
   */
  public getById(id: string): Observable<AnnouncementDto> {
    return this.http.get<AnnouncementDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Updates an existing announcement.
   *
   * @param id - Announcement ID
   * @param data - Update data
   * @returns Observable of updated announcement
   */
  public update(id: string, data: Partial<CreateAnnouncementDto>): Observable<AnnouncementDto> {
    return this.http.put<AnnouncementDto>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Deletes an announcement.
   *
   * @param id - Announcement ID
   * @returns Observable of void
   */
  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Publishes an announcement.
   *
   * @param id - Announcement ID
   * @returns Observable of published announcement
   */
  public publish(id: string): Observable<AnnouncementDto> {
    return this.http.post<AnnouncementDto>(`${this.baseUrl}/${id}/publish`, {});
  }
}
