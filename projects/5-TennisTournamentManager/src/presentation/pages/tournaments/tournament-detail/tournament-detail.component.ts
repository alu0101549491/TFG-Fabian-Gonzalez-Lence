/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/tournaments/tournament-detail/tournament-detail.component.ts
 * @desc Tournament detail view with tabs for info, categories, brackets, and order of play.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {combineLatest} from 'rxjs';
import {TournamentService, RegistrationService, CategoryService, BracketService} from '@application/services';
import {type TournamentDto, type RegistrationDto, type CreateCategoryDto, type CategoryDto, type UpdateRegistrationStatusDto} from '@application/dto';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {UserRepositoryImpl} from '@infrastructure/repositories/user.repository';
import {type User} from '@domain/entities/user';
import {UserRole} from '@domain/enumerations/user-role';
import {TournamentStatus} from '@domain/enumerations/tournament-status';
import {RegistrationStatus} from '@domain/enumerations/registration-status';
import {Gender} from '@domain/enumerations/gender';
import {AgeGroup} from '@domain/enumerations/age-group';
import {BracketType} from '@domain/enumerations/bracket-type';
import {EnumFormatPipe} from '@shared/pipes';
import templateHtml from './tournament-detail-new.component.html?raw';
import styles from './tournament-detail-new.component.css?raw';

/**
 * TournamentDetailComponent displays comprehensive information about a tournament.
 * Shows tournament details, registration status, and navigation to brackets/matches.
 */
@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EnumFormatPipe],
  template: templateHtml,
  styles: [styles],
})
export class TournamentDetailComponent implements OnInit {
  /** Services - inject() must be called before other properties */
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tournamentService = inject(TournamentService);
  private readonly registrationService = inject(RegistrationService);
  private readonly categoryService = inject(CategoryService);
  private readonly bracketService = inject(BracketService);
  private readonly authStateService = inject(AuthStateService);
  private readonly userRepository = inject(UserRepositoryImpl);

  /** Tournament data */
  public tournament = signal<TournamentDto | null>(null);

  /** Tournament categories */
  public categories = signal<CategoryDto[]>([]);

  /** Registered players with their details */
  public registeredPlayers = signal<Array<{user: User; registration: RegistrationDto}>>([]);

  /** Selected category ID for registration */
  public selectedCategoryId = signal<string | null>(null);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Current user's registration for this tournament (null if not registered) */
  public userRegistration = signal<RegistrationDto | null>(null);

  /** Tournament ID from route */
  private tournamentId: string | null = null;

  /** Category management form data */
  public categoryForm = {
    name: '',
    gender: Gender.OPEN,
    ageGroup: AgeGroup.OPEN,
    maxParticipants: 32,
  };

  /** Show category management section */
  public showCategoryManagement = signal(false);

  /** Available gender options */
  public readonly genders = Object.values(Gender);

  /** Available age group options */
  public readonly ageGroups = Object.values(AgeGroup);

  /** Category submission state */
  public isSubmittingCategory = signal(false);

  /** Category loading state (for refresh button) */
  public isLoadingCategories = signal(false);

  /** Category error message */
  public categoryError = signal<string | null>(null);

  /** Bracket generation form data */
  public bracketForm = {
    categoryId: '',
    bracketType: BracketType.SINGLE_ELIMINATION,
  };

  /** Show bracket generation section */
  public showBracketGeneration = signal(false);

  /** Available bracket types */
  public readonly bracketTypes = Object.values(BracketType);

  /** Bracket generation state */
  public isGeneratingBracket = signal(false);

  /**
   * Initializes component and loads tournament data.
   */
  public ngOnInit(): void {
    // Combine both paramMap and queryParamMap to reload on any change
    combineLatest([
      this.route.paramMap,
      this.route.queryParamMap
    ]).subscribe(([params]) => {
      this.tournamentId = params.get('id');
      if (this.tournamentId) {
        void this.loadTournament();
      }
    });
  }

  /**
   * Loads tournament details.
   */
  private async loadTournament(): Promise<void> {
    if (!this.tournamentId) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const tournament = await this.tournamentService.getTournamentById(this.tournamentId);
      this.tournament.set(tournament);
      
      // Initialize category form with tournament's max participants
      this.categoryForm.maxParticipants = tournament.maxParticipants;
      
      // Load tournament categories
      await this.loadCategories();
      
      // Load registered players
      await this.loadPlayers();
      
      await this.checkRegistrationStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load tournament';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Loads the list of registered players for this tournament.
   */
  private async loadPlayers(): Promise<void> {
    if (!this.tournamentId) return;

    try {
      // Fetch all registrations for this tournament
      const registrations = await this.registrationService.getRegistrationsByTournament(this.tournamentId);
      
      // Fetch user details for each registration
      const playersWithDetails = await Promise.all(
        registrations.map(async (registration) => {
          try {
            const user = await this.userRepository.findById(registration.participantId);
            return user ? { user, registration } : null;
          } catch (error) {
            console.error(`Failed to load user ${registration.participantId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out any null entries (users that couldn't be loaded)
      const validPlayers = playersWithDetails.filter((p): p is {user: User; registration: RegistrationDto} => p !== null);
      
      this.registeredPlayers.set(validPlayers);
    } catch (error) {
      console.error('Failed to load registered players:', error);
      // Don't set error message - player list is optional info
    }
  }

  /**
   * Checks if current user is registered for this tournament.
   */
  private async checkRegistrationStatus(): Promise<void> {
    if (!this.tournamentId) return;
    
    const user = this.authStateService.getCurrentUser();
    if (!user) return;

    try {
      const registrations = await this.registrationService.getRegistrationsByParticipant(user.id);
      const registration = registrations.find(reg => reg.tournamentId === this.tournamentId);
      this.userRegistration.set(registration || null);
    } catch (error) {
      // Silently fail - registration status is optional info
      console.error('Failed to check registration status:', error);
    }
  }

  /**
   * Navigates to bracket view for this tournament.
   */
  public viewBracket(): void {
    if (this.tournamentId) {
      void this.router.navigate(['/brackets', this.tournamentId]);
    }
  }

  /**
   * Navigates to matches view for this tournament.
   */
  public viewMatches(): void {
    if (this.tournamentId) {
      void this.router.navigate(['/matches'], { queryParams: { tournamentId: this.tournamentId } });
    }
  }

  /**
   * Navigates to standings view for this tournament.
   */
  public viewStandings(): void {
    if (this.tournamentId) {
      void this.router.navigate(['/standings', this.tournamentId]);
    }
  }

  /**
   * Handles tournament registration.
   */
  public async registerForTournament(): Promise<void> {
    if (!this.tournamentId) return;

    const user = this.authStateService.getCurrentUser();
    if (!user) {
      // This should not happen as UI hides register button for unauthenticated users
      alert('Please log in first to register for tournaments');
      return;
    }

    const categoryId = this.selectedCategoryId();
    if (!categoryId) {
      alert('Please select a category to register for');
      return;
    }

    try {
      const newRegistration = await this.registrationService.registerParticipant(
        {
          tournamentId: this.tournamentId,
          categoryId: categoryId,
        },
        user.id
      );
      this.userRegistration.set(newRegistration);
      alert('Successfully registered for tournament!');
      await this.loadPlayers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      alert(message);
    }
  }

  /**
   * Formats date for display.
   *
   * @param date - Date to format
   * @returns Formatted date string
   */
  public formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Gets the category name for a given category ID.
   *
   * @param categoryId - The category identifier
   * @returns Category name or 'Unknown Category'
   */
  public getCategoryName(categoryId: string): string {
    const category = this.categories().find(c => c.id === categoryId);
    return category?.name || 'Unknown Category';
  }

  /**
   * Checks if user is authenticated.
   *
   * @returns True if user is logged in
   */
  public isAuthenticated(): boolean {
    return this.authStateService.isAuthenticated();
  }

  /**
   * Checks if current user can edit/delete this tournament.
   * Returns true if user is the tournament organizer or a tournament admin.
   *
   * @returns True if user has permission to modify tournament
   */
  public canManageTournament(): boolean {
    const user = this.authStateService.getCurrentUser();
    const tournament = this.tournament();
    
    if (!user || !tournament) return false;

    // Tournament organizer can manage
    if (tournament.organizerId === user.id) return true;

    // System admins and tournament admins can manage
    return user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.TOURNAMENT_ADMIN;
  }

  /**
   * Navigates to tournament edit page.
   */
  public editTournament(): void {
    if (!this.tournamentId) return;
    void this.router.navigate(['/tournaments', this.tournamentId, 'edit']);
  }

  /**
   * Deletes the tournament after confirmation.
   */
  public async deleteTournament(): Promise<void> {
    if (!this.tournamentId) return;

    const tournament = this.tournament();
    const user = this.authStateService.getCurrentUser();
    
    if (!tournament || !user) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${tournament.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await this.tournamentService.deleteTournament(this.tournamentId, user.id);
      alert('Tournament deleted successfully');
      void this.router.navigate(['/tournaments']);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete tournament';
      alert(message);
    }
  }

  /**
   * Gets the available status transitions for the current tournament status.
   * 
   * @returns Array of allowed status transitions
   */
  public getAvailableStatusTransitions(): TournamentStatus[] {
    const tournament = this.tournament();
    if (!tournament) return [];

    const validTransitions: Record<TournamentStatus, TournamentStatus[]> = {
      [TournamentStatus.DRAFT]: [TournamentStatus.REGISTRATION_OPEN, TournamentStatus.CANCELLED],
      [TournamentStatus.REGISTRATION_OPEN]: [TournamentStatus.REGISTRATION_CLOSED, TournamentStatus.CANCELLED],
      [TournamentStatus.REGISTRATION_CLOSED]: [TournamentStatus.DRAW_PENDING, TournamentStatus.CANCELLED],
      [TournamentStatus.DRAW_PENDING]: [TournamentStatus.IN_PROGRESS, TournamentStatus.CANCELLED],
      [TournamentStatus.IN_PROGRESS]: [TournamentStatus.FINALIZED, TournamentStatus.CANCELLED],
      [TournamentStatus.FINALIZED]: [],
      [TournamentStatus.CANCELLED]: [],
    };

    return validTransitions[tournament.status as TournamentStatus] || [];
  }

  /**
   * Changes the tournament status.
   * 
   * @param newStatus - The new status to set
   */
  public async changeStatus(newStatus: TournamentStatus): Promise<void> {
    if (!this.tournamentId) return;

    const user = this.authStateService.getCurrentUser();
    if (!user) return;

    const tournament = this.tournament();
    if (!tournament) return;

    const confirmed = confirm(
      `Change tournament status from ${tournament.status} to ${newStatus}?`
    );

    if (!confirmed) return;

    this.isLoading.set(true);
    try {
      await this.tournamentService.updateStatus(this.tournamentId, newStatus, user.id);
      alert('Tournament status updated successfully');
      await this.loadTournament(); // Reload to show updated status
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update tournament status';
      alert(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Formats status enum for display.
   * 
   * @param status - Status enum value
   * @returns Formatted status string
   */
  public formatStatus(status: TournamentStatus): string {
    return status.replace(/_/g, ' ');
  }

  /**
   * Gets a description for the current tournament status.
   * 
   * @returns Status description with context
   */
  public getStatusDescription(): string {
    const tournament = this.tournament();
    if (!tournament) return '';

    const descriptions: Record<TournamentStatus, string> = {
      [TournamentStatus.DRAFT]: 'Tournament is in draft mode. Setup categories and details before opening registration.',
      [TournamentStatus.REGISTRATION_OPEN]: 'Tournament is accepting player registrations. Register for available categories.',
      [TournamentStatus.REGISTRATION_CLOSED]: 'Registration period has ended. Preparing tournament draw and brackets.',
      [TournamentStatus.DRAW_PENDING]: 'Tournament draw is being prepared. Matches will be scheduled soon.',
      [TournamentStatus.IN_PROGRESS]: 'Tournament is currently active. Matches are being played.',
      [TournamentStatus.FINALIZED]: 'Tournament has concluded. All matches have been completed and results are final.',
      [TournamentStatus.CANCELLED]: 'Tournament has been cancelled and will not proceed.',
    };

    return descriptions[tournament.status as TournamentStatus] || 'Status information not available.';
  }

  /**
   * Gets the icon/emoji for the current status.
   * 
   * @returns Status icon
   */
  public getStatusIcon(): string {
    const tournament = this.tournament();
    if (!tournament) return '📋';

    const icons: Record<TournamentStatus, string> = {
      [TournamentStatus.DRAFT]: '📝',
      [TournamentStatus.REGISTRATION_OPEN]: '✅',
      [TournamentStatus.REGISTRATION_CLOSED]: '🔒',
      [TournamentStatus.DRAW_PENDING]: '🔀',
      [TournamentStatus.IN_PROGRESS]: '🎾',
      [TournamentStatus.FINALIZED]: '🏆',
      [TournamentStatus.CANCELLED]: '❌',
    };

    return icons[tournament.status as TournamentStatus] || '📋';
  }

  /**
   * Gets action items or next steps for the current status.
   * 
   * @returns Array of action items
   */
  public getStatusActions(): string[] {
    const tournament = this.tournament();
    if (!tournament) return [];

    const actions: Record<TournamentStatus, string[]> = {
      [TournamentStatus.DRAFT]: [
        'Configure tournament categories',
        'Set up courts and facilities',
        'Review tournament details',
        'Open registration when ready',
      ],
      [TournamentStatus.REGISTRATION_OPEN]: [
        'Monitor player registrations',
        'Answer player inquiries',
        'Close registration when capacity reached or deadline passes',
      ],
      [TournamentStatus.REGISTRATION_CLOSED]: [
        'Review registered participants',
        'Prepare tournament draw',
        'Schedule match times',
      ],
      [TournamentStatus.DRAW_PENDING]: [
        'Finalize bracket assignments',
        'Notify participants of match schedules',
        'Begin tournament play',
      ],
      [TournamentStatus.IN_PROGRESS]: [
        'Record match results',
        'Update bracket progress',
        'Monitor tournament schedule',
      ],
      [TournamentStatus.FINALIZED]: [
        'Review tournament results',
        'Archive tournament data',
        'Prepare certificates or awards',
      ],
      [TournamentStatus.CANCELLED]: [
        'Notify all registered participants',
        'Process refunds if applicable',
      ],
    };

    return actions[tournament.status as TournamentStatus] || [];
  }

  /**
   * Submits a new category for the tournament.
   */
  public async submitCategory(): Promise<void> {
    if (!this.tournamentId) return;

    this.isSubmittingCategory.set(true);
    this.categoryError.set(null);

    try {
      const categoryData: CreateCategoryDto = {
        tournamentId: this.tournamentId,
        name: this.categoryForm.name.trim(),
        gender: this.categoryForm.gender,
        ageGroup: this.categoryForm.ageGroup,
        maxParticipants: this.categoryForm.maxParticipants,
      };

      console.log('Creating category:', categoryData);
      const newCategory = await this.categoryService.createCategory(categoryData);
      console.log('Category created successfully:', newCategory);

      // Add the new category directly to the signal (instant update)
      this.categories.update(cats => [...cats, newCategory]);

      // Reset form and close
      this.categoryForm = {
        name: '',
        gender: Gender.OPEN,
        ageGroup: AgeGroup.OPEN,
        maxParticipants: this.tournament()?.maxParticipants || 32,
      };
      this.showCategoryManagement.set(false);
    } catch (error) {
      console.error('Failed to create category:', error);
      const message = error instanceof Error ? error.message : 'Failed to add category';
      this.categoryError.set(message);
      alert(`Error creating category: ${message}`);
    } finally {
      this.isSubmittingCategory.set(false);
    }
  }

  /**
   * Deletes a category by ID.
   */
  public async deleteCategory(categoryId: string, categoryName: string): Promise<void> {
    const confirmed = confirm(`Delete category "${categoryName}"? This will remove all registrations in this category.`);
    
    if (!confirmed) return;

    // Prevent double-clicking by checking if already deleting
    if (this.isSubmittingCategory()) return;
    
    this.isSubmittingCategory.set(true);

    try {
      await this.categoryService.deleteCategory(categoryId);
      
      // Remove the category directly from the signal (instant update)
      this.categories.update(cats => cats.filter(cat => cat.id !== categoryId));
    } catch (error) {
      console.error('Failed to delete category:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete category';
      alert(`Error: ${message}`);
      
      // Reload categories to ensure sync with backend
      await this.loadCategories();
    } finally {
      this.isSubmittingCategory.set(false);
    }
  }

  /**
   * Loads tournament categories from the API.
   */
  private async loadCategories(): Promise<void> {
    if (!this.tournamentId) return;

    try {
      const categories = await this.categoryService.getCategoriesByTournament(this.tournamentId);
      
      this.categories.set(categories);
      
      // Auto-select first category if only one exists
      if (categories.length === 1) {
        this.selectedCategoryId.set(categories[0].id);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  /**
   * Refreshes the category list from the server.
   * Allows players to see latest changes made by admins.
   */
  public async refreshCategories(): Promise<void> {
    if (!this.tournamentId || this.isLoadingCategories()) return;

    this.isLoadingCategories.set(true);

    try {
      const categories = await this.categoryService.getCategoriesByTournament(this.tournamentId);
      this.categories.set(categories);
      
      // Show brief success feedback
      console.log(`✅ Categories refreshed: ${categories.length} found`);
    } catch (error) {
      console.error('Failed to refresh categories:', error);
      alert('Failed to refresh categories. Please try again.');
    } finally {
      this.isLoadingCategories.set(false);
    }
  }

  /**
   * Toggles the category management section visibility.
   */
  public toggleCategoryManagement(): void {
    this.showCategoryManagement.update(val => !val);
  }

  /**
   * Gets category by ID for display purposes.
   * @param categoryId - The category ID to find
   * @returns The category DTO or undefined if not found
   */
  public getCategoryById(categoryId: string): CategoryDto | undefined {
    return this.categories().find(cat => cat.id === categoryId);
  }

  /**
   * Approves a pending registration.
   * @param registrationId - The registration ID to approve
   * @param playerName - Player name for confirmation message
   */
  public async approveRegistration(registrationId: string, playerName: string): Promise<void> {
    const confirmed = confirm(`Approve registration for ${playerName}?`);
    if (!confirmed) return;

    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) {
      alert('You must be logged in to perform this action');
      return;
    }

    try {
      const updateData: UpdateRegistrationStatusDto = {
        registrationId,
        status: RegistrationStatus.ACCEPTED,
      };

      await this.registrationService.updateStatus(updateData, currentUser.id);
      await this.loadPlayers();
      alert(`${playerName} has been approved!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve registration';
      alert(`Error: ${message}`);
    }
  }

  /**
   * Rejects a pending registration.
   * @param registrationId - The registration ID to reject
   * @param playerName - Player name for confirmation message
   */
  public async rejectRegistration(registrationId: string, playerName: string): Promise<void> {
    const confirmed = confirm(`Reject registration for ${playerName}? They will not be able to participate.`);
    if (!confirmed) return;

    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) {
      alert('You must be logged in to perform this action');
      return;
    }

    try {
      const updateData: UpdateRegistrationStatusDto = {
        registrationId,
        status: RegistrationStatus.REJECTED,
      };

      await this.registrationService.updateStatus(updateData, currentUser.id);
      await this.loadPlayers();
      alert(`${playerName}'s registration has been rejected.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reject registration';
      alert(`Error: ${message}`);
    }
  }

  /**
   * Removes an accepted participant from the tournament.
   * @param registrationId - The registration ID to remove
   * @param playerName - Player name for confirmation message
   */
  public async removeParticipant(registrationId: string, playerName: string): Promise<void> {
    const confirmed = confirm(`Remove ${playerName} from the tournament? This action will withdraw their registration.`);
    if (!confirmed) return;

    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) {
      alert('You must be logged in to perform this action');
      return;
    }

    try {
      // Tournament admins use updateStatus instead of withdrawRegistration
      const updateData: UpdateRegistrationStatusDto = {
        registrationId,
        status: RegistrationStatus.WITHDRAWN,
      };

      await this.registrationService.updateStatus(updateData, currentUser.id);
      await this.loadPlayers();
      alert(`${playerName} has been removed from the tournament.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove participant';
      alert(`Error: ${message}`);
    }
  }

  /**
   * Toggles the bracket generation form visibility.
   */
  public toggleBracketGeneration(): void {
    this.showBracketGeneration.set(!this.showBracketGeneration());
    
    // Reset form when hiding
    if (!this.showBracketGeneration()) {
      this.bracketForm.categoryId = '';
      this.bracketForm.bracketType = BracketType.SINGLE_ELIMINATION;
    }
  }

  /**
   * Gets the count of accepted participants for a category.
   *
   * @param categoryId - The category ID
   * @returns Number of accepted participants
   */
  public getAcceptedParticipantCount(categoryId: string): number {
    return this.registeredPlayers().filter(
      p => p.registration.categoryId === categoryId && p.registration.status === RegistrationStatus.ACCEPTED
    ).length;
  }

  /**
   * Checks if a category has accepted participants.
   *
   * @param categoryId - The category ID
   * @returns True if category has at least one accepted participant
   */
  public categoryHasParticipants(categoryId: string): boolean {
    return this.getAcceptedParticipantCount(categoryId) > 0;
  }

  /**
   * Gets helpful text about category readiness for bracket generation.
   *
   * @param categoryId - The category ID
   * @returns Status text
   */
  public getCategoryReadinessText(categoryId: string): string {
    const count = this.getAcceptedParticipantCount(categoryId);
    if (count === 0) return 'No accepted participants yet';
    if (count === 1) return '1 participant (needs at least 2)';
    return `${count} participants ready`;
  }

  /**
   * Generates a bracket for the selected category.
   * Requires tournament administrator permissions.
   */
  public async generateBracket(): Promise<void> {
    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) {
      alert('You must be logged in to generate brackets');
      return;
    }

    if (!this.tournamentId) {
      alert('Tournament ID is missing');
      return;
    }

    if (!this.bracketForm.categoryId) {
      alert('Please select a category');
      return;
    }

    const category = this.categories().find(c => c.id === this.bracketForm.categoryId);
    if (!category) {
      alert('Invalid category selected');
      return;
    }

    // Check for accepted participants
    const acceptedCount = this.getAcceptedParticipantCount(this.bracketForm.categoryId);
    if (acceptedCount === 0) {
      alert(
        `Cannot generate bracket: No accepted participants in ${category.name}\n\n` +
        `To generate a bracket:\n` +
        `1. Wait for players to register for this category\n` +
        `2. Approve their registrations in the "Registered Participants" section\n` +
        `3. Then return here to generate the bracket`
      );
      return;
    }

    if (acceptedCount < 2) {
      alert(
        `Cannot generate bracket: Only ${acceptedCount} participant in ${category.name}\n\n` +
        `Brackets require at least 2 accepted participants. Please approve more registrations before generating the bracket.`
      );
      return;
    }

    const confirmed = confirm(
      `Generate ${this.bracketForm.bracketType.replace(/_/g, ' ').toLowerCase()} bracket for ${category.name}?\n\n` +
      `Participants: ${acceptedCount} accepted players\n\n` +
      `This will create matches for all accepted participants in this category.\n` +
      `⚠️ Any existing unpublished bracket for this category will be replaced.`
    );
    if (!confirmed) return;

    this.isGeneratingBracket.set(true);

    try {
      await this.bracketService.generateBracket(
        {
          tournamentId: this.tournamentId,
          categoryId: this.bracketForm.categoryId,
          bracketType: this.bracketForm.bracketType,
        },
        currentUser.id
      );

      alert(`${this.bracketForm.bracketType.replace(/_/g, ' ')} bracket created successfully for ${category.name}!\n\nParticipants: ${acceptedCount} players`);
      this.showBracketGeneration.set(false);
      this.bracketForm.categoryId = '';
      this.bracketForm.bracketType = BracketType.SINGLE_ELIMINATION;
    } catch (error) {
      // Extract error message from server response
      let message = 'Failed to generate bracket';
      
      if (error && typeof error === 'object') {
        // Axios error with response from server
        const axiosError = error as {response?: {data?: {message?: string; error?: string}}};
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        } else if (axiosError.response?.data?.error) {
          message = axiosError.response.data.error;
        } else if (error instanceof Error) {
          message = error.message;
        }
      }
      
      console.error('Bracket generation error:', error);
      console.error('Error message:', message);
      
      // Provide helpful context for common errors
      if (message.includes('published bracket already exists')) {
        alert(
          `Cannot Create New Bracket\n\n` +
          `A published bracket already exists for ${category.name}.\n\n` +
          `Published brackets cannot be replaced to preserve match history and results.\n\n` +
          `Options:\n` +
          `• Use the existing published bracket\n` +
          `• Create a new tournament for a new competition`
        );
      } else if (message.includes('No accepted participants')) {
        alert(
          `Error: ${message}\n\n` +
          `This usually means:\n` +
          `• Players haven't registered for this category yet\n` +
          `• Registrations are still pending approval\n` +
          `• Approved participants were removed\n\n` +
          `Check the "Registered Participants" section and approve registrations before generating the bracket.`
        );
      } else {
        alert(`Error: ${message}`);
      }
    } finally {
      this.isGeneratingBracket.set(false);
    }
  }
}

