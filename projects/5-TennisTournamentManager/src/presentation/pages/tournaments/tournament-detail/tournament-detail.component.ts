/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file src/presentation/pages/tournaments/tournament-detail/tournament-detail.component.ts
 * @desc Tournament detail view with tabs for info, categories, brackets, and order of play.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, OnInit, HostListener, inject, signal, computed, effect} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {combineLatest} from 'rxjs';
import {TournamentService, RegistrationService, CategoryService, BracketService} from '@application/services';
import {ExportService} from '@application/services/export.service';
import {UserManagementService} from '@application/services/user-management.service';
import {PartnerInvitationService} from '@infrastructure/services/partner-invitation.service';
import {type TournamentDto, type RegistrationDto, type CreateCategoryDto, type CategoryDto, type UpdateRegistrationStatusDto, type UserSummaryDto} from '@application/dto';
import {AuthStateService, TournamentStateService} from '@presentation/services';
import {UserRepositoryImpl} from '@infrastructure/repositories/user.repository';
import {type User} from '@domain/entities/user';
import {UserRole} from '@domain/enumerations/user-role';
import {TournamentStatus} from '@domain/enumerations/tournament-status';
import {TournamentType} from '@domain/enumerations/tournament-type';
import {RegistrationStatus} from '@domain/enumerations/registration-status';
import {AcceptanceType} from '@domain/enumerations/acceptance-type';
import {Gender} from '@domain/enumerations/gender';
import {AgeGroup} from '@domain/enumerations/age-group';
import {BracketType} from '@domain/enumerations/bracket-type';
import {MatchFormat} from '@domain/enumerations';
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
  private readonly partnerInvitationService = inject(PartnerInvitationService);
  private readonly categoryService = inject(CategoryService);
  private readonly bracketService = inject(BracketService);
  private readonly authStateService = inject(AuthStateService);
  private readonly tournamentStateService = inject(TournamentStateService);
  private readonly userRepository = inject(UserRepositoryImpl);
  private readonly userManagementService = inject(UserManagementService);
  private readonly exportService = inject(ExportService);

  /** Tournament data */
  public tournament = signal<TournamentDto | null>(null);

  /** Tournament categories */
  public categories = signal<CategoryDto[]>([]);

  /** Registered players with their details */
  public registeredPlayers = signal<Array<{user: User; registration: RegistrationDto; partner?: {user: User; registration: RegistrationDto} | null}>>([]);

  /** Count of pending registrations */
  public pendingRegistrationsCount = computed(() => {
    return this.registeredPlayers().filter(p => p.registration.status === RegistrationStatus.PENDING).length;
  });

  /** Count of accepted registrations */
  public acceptedPlayersCount = computed(() => {
    return this.registeredPlayers().filter(p => p.registration.status === RegistrationStatus.ACCEPTED).length;
  });

  /** Count of rejected registrations */
  public rejectedPlayersCount = computed(() => {
    return this.registeredPlayers().filter(p => p.registration.status === RegistrationStatus.REJECTED).length;
  });

  /** Count of withdrawn registrations */
  public withdrawnPlayersCount = computed(() => {
    return this.registeredPlayers().filter(p => p.registration.status === RegistrationStatus.WITHDRAWN).length;
  });

  /** Accepted players for public display (excludes pending, rejected, withdrawn, and alternates) */
  public acceptedPlayers = computed(() => {
    return this.registeredPlayers().filter(
      p => p.registration.status === RegistrationStatus.ACCEPTED
        && p.registration.acceptanceType !== AcceptanceType.ALTERNATE
        && p.registration.acceptanceType !== AcceptanceType.WITHDRAWN
    );
  });

  /** Participant list filter status */
  public participantStatusFilter = signal<RegistrationStatus | 'ALL'>('ALL');

  /** Filtered registered players based on status filter */
  public filteredRegisteredPlayers = computed(() => {
    const filter = this.participantStatusFilter();
    if (filter === 'ALL') {
      return this.registeredPlayers();
    }
    return this.registeredPlayers().filter(p => p.registration.status === filter);
  });

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

  /** FR15: Partner search query for doubles registration */
  public partnerSearchQuery = signal<string>('');
  
  /** FR15: Selected partner for doubles registration */
  public selectedPartner = signal<UserSummaryDto | null>(null);
  
  /** FR15: Filtered partners based on search query (excludes self and already registered) */
  public filteredPartners = computed(() => {
    const query = this.partnerSearchQuery().toLowerCase().trim();
    if (!query) return [];
    
    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) return [];
    
    // Get list of already registered participant IDs (excluding WITHDRAWN)
    const registeredPlayerIds = new Set(
      this.registeredPlayers()
        .filter(p => p.registration.status !== RegistrationStatus.WITHDRAWN)
        .map(p => p.registration.participantId)
    );
    
    return this.allUsers().filter(user => {
      // Exclude current user (can't partner with yourself)
      if (user.id === currentUser.id) return false;
      
      // Exclude users who are already registered (except WITHDRAWN)
      if (registeredPlayerIds.has(user.id)) return false;
      
      // Filter by search query
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const username = (user.username || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      
      return fullName.includes(query) || username.includes(query) || email.includes(query);
    }).slice(0, 10); // Limit to 10 results
  });

  /** FR15: Legacy - kept for backward compatibility */
  public doublesPartnerId = signal<string>('');

  /**
   * Constructor - sets up auto-loading of eligible participants for partner search
   */
  constructor() {
    // FR15: Auto-load eligible participants when user starts searching for partner
    effect(() => {
      const query = this.partnerSearchQuery();
      // Load users on first search attempt if not already loaded
      if (query.length >= 1 && this.allUsers().length === 0) {
        this.loadEligibleParticipantsForPartnerSearch();
      }
    });
  }

  /** FR15: True when the current tournament is a DOUBLES type. */
  public isDoublesTournament = computed(() => this.tournament()?.tournamentType === TournamentType.DOUBLES);

  /**
   * Navigate to tournament announcements page.
   */
  public viewAnnouncements(): void {
    if (this.tournamentId) {
      void this.router.navigate(['/announcements'], {
        queryParams: {tournamentId: this.tournamentId},
      });
    }
  }

  /** Available gender options */
  public readonly genders = Object.values(Gender);

  /** Available age group options */
  public readonly ageGroups = Object.values(AgeGroup);

  /** Category submission state */
  public isSubmittingCategory = signal(false);

  /** Category loading state (for refresh button) */
  public isCategoryLoading = signal(false);

  /**
   * Checks if current user is registered for this tournament.
   *
   * @returns True if user has an active registration
   */
  public isRegistered(): boolean {
    return this.userRegistration() !== null;
  }

  /**
   * Checks if current user's profile is complete for tournament registration (FR9).
   * Returns true if user has ID/NIE configured.
   */
  public isProfileComplete = computed(() => {
    const user = this.authStateService.getCurrentUser();
    return user?.idDocument && user.idDocument.trim().length > 0;
  });

  /**
   * Checks if tournament registration deadline has passed.
   * Returns true only if:
   * 1. registrationCloseDate is explicitly set, AND
   * 2. Current date is after registrationCloseDate, AND
   * 3. registrationCloseDate is meaningfully before the tournament start (not same day)
   */
  public isRegistrationClosed = computed(() => {
    const tournament = this.tournament();
    if (!tournament?.registrationCloseDate) return false;
    
    const now = new Date();
    const deadline = new Date(tournament.registrationCloseDate);
    const startDate = new Date(tournament.startDate);
    
    // Don't enforce deadline if it's on or after the tournament start date
    // (this handles cases where deadline wasn't properly configured)
    if (deadline >= startDate) return false;
    
    // Only show as closed if we're past the deadline
    return now > deadline;
  });

  /**
   * Formats registration deadline for display.
   */
  public formatRegistrationDeadline = computed(() => {
    const tournament = this.tournament();
    if (!tournament?.registrationCloseDate) return null;
    
    return new Date(tournament.registrationCloseDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  });

  /** Categories loading state for refresh */
  public isLoadingCategories = signal(false);

  /** Category error message */
  public categoryError = signal<string | null>(null);

  /** Bracket generation form data */
  public bracketForm = {
    categoryId: '',
    bracketType: BracketType.SINGLE_ELIMINATION,
    matchFormat: MatchFormat.BEST_OF_3_FINAL_SET_TIEBREAK,
  };

  /** Show bracket generation section */
  public showBracketGeneration = signal(false);

  /** Available bracket types */
  public readonly bracketTypes = Object.values(BracketType);

  /** Available match formats */
  public readonly matchFormats = Object.values(MatchFormat);

  /** Bracket generation state */
  public isGeneratingBracket = signal(false);

  /** Add Participant Modal State */
  public showAddParticipantDialog = signal(false);

  /** Enrollment mode: 'system' for existing users, 'guest' for non-system participants */
  public enrollmentMode = signal<'system' | 'guest'>('system');

  /** Guest enrollment form data */
  public guestEnrollFormData = {
    firstName: '',
    lastName: '',
    categoryId: null as string | null,
  };
  
  /** All users in the system (for adding participants) */
  public allUsers = signal<UserSummaryDto[]>([]);
  
  /** Filtered users based on search query and excluding already registered players */
  public filteredUsers = computed(() => {
    const query = this.userSearchQuery().toLowerCase().trim();
    if (!query) return [];
    
    // Get list of already registered participant IDs (excluding WITHDRAWN)
    const registeredPlayerIds = new Set(
      this.registeredPlayers()
        .filter(p => p.registration.status !== RegistrationStatus.WITHDRAWN)
        .map(p => p.registration.participantId)
    );
    
    return this.allUsers().filter(user => {
      // Exclude users who are already registered (except WITHDRAWN)
      if (registeredPlayerIds.has(user.id)) {
        return false;
      }
      
      // Filter by search query
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const username = (user.username || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      
      return fullName.includes(query) || username.includes(query) || email.includes(query);
    }).slice(0, 10); // Limit to 10 results for performance
  });
  
  /** User search query signal */
  public userSearchQuery = signal('');
  
  /** Add participant form data */
  public addParticipantFormData = {
    selectedUserId: null as string | null,
    selectedUserName: null as string | null,
    categoryId: null as string | null,
  };
  
  /** Flag indicating if participant is being added */
  public isAddingParticipant = signal(false);

  /** Seed editing state - tracks which registration is being edited */
  public editingSeedRegistrationId = signal<string | null>(null);

  /** Temporary seed number value during editing */
  public tempSeedNumber = signal<number | null>(null);

  /** Edit Participant Modal State */
  public showEditParticipantModal = signal(false);

  /** Edit participant form data */
  public editParticipantForm = {
    registrationId: '',
    participantName: '',
    seedNumber: null as number | null,
    status: RegistrationStatus.PENDING,
    acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
    categoryId: '',
  };

  /** Flag indicating if participant is being updated */
  public isUpdatingParticipant = signal(false);

  /** Available registration statuses for editing */
  public readonly registrationStatuses = Object.values(RegistrationStatus);

  /** Available acceptance types for editing */
  public readonly acceptanceTypes = Object.values(AcceptanceType);

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
      
      // Set tournament in global state for logo propagation
      this.tournamentStateService.setCurrentTournament(tournament);
      
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
   * For doubles pairs, deduplicates to one row per pair.
   */
  private async loadPlayers(): Promise<void> {
    if (!this.tournamentId) return;

    try {
      // Fetch all registrations + authoritative doubles-team pairings in parallel
      const [registrations, doublesTeams] = await Promise.all([
        this.registrationService.getRegistrationsByTournament(this.tournamentId),
        this.partnerInvitationService.getDoublesTeamsByTournament(this.tournamentId).catch(() => []),
      ]);

      // Fetch user details for each registration
      const playersWithDetails = await Promise.all(
        registrations.map(async (registration) => {
          try {
            const user = await this.userRepository.findPublicById(registration.participantId);
            return user ? { user, registration } : null;
          } catch (error) {
            console.error(`Failed to load user ${registration.participantId}:`, error);
            return null;
          }
        })
      );

      // Filter out any null entries
      const validPlayers = playersWithDetails.filter((p): p is {user: User; registration: RegistrationDto} => p !== null);

      // Deduplicate doubles pairs using DoublesTeam records as source of truth.
      // For each team {player1Id, player2Id}, keep only one combined row and suppress the partner's row.
      const seenParticipantIds = new Set<string>();
      const deduped: Array<{user: User; registration: RegistrationDto; partner?: {user: User; registration: RegistrationDto} | null}> = [];

      for (const entry of validPlayers) {
        const participantId = entry.registration.participantId;
        if (seenParticipantIds.has(participantId)) continue;
        seenParticipantIds.add(participantId);

        // Prefer DoublesTeam record (authoritative for new registrations);
        // fall back to partnerId field for registrations created before DoublesTeam existed.
        const team = doublesTeams.find(
          t => t.player1Id === participantId || t.player2Id === participantId
        );

        let partnerUserId: string | null = null;
        if (team) {
          partnerUserId = team.player1Id === participantId ? team.player2Id : team.player1Id;
        } else {
          partnerUserId = entry.registration.partnerId ?? entry.registration.partner?.id ?? null;
        }

        if (partnerUserId) {
          const partnerEntry = validPlayers.find(p => p.registration.participantId === partnerUserId);
          if (partnerEntry) {
            seenParticipantIds.add(partnerUserId);
            deduped.push({...entry, partner: partnerEntry});
          } else {
            deduped.push({...entry, partner: null});
          }
        } else {
          deduped.push(entry);
        }
      }

      this.registeredPlayers.set(deduped);
    } catch (error) {
      console.error('Failed to load registered players:', error);
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
  public async viewBracket(): Promise<void> {
    if (!this.tournamentId) return;

    try {
      // Fetch brackets for this tournament
      const brackets = await this.bracketService.getBracketsByTournament(this.tournamentId);
      
      if (brackets.length > 0) {
        // Navigate to the first bracket
        void this.router.navigate(['/brackets', brackets[0].id]);
      } else {
        // No brackets exist yet - show message
        alert('No brackets available for this tournament yet. Brackets will be created when the tournament starts.');
      }
    } catch (error) {
      console.error('Failed to load brackets:', error);
      alert('Failed to load brackets. Please try again.');
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
   * Navigates to tournament statistics view for this tournament.
   */
  public viewTournamentStatistics(): void {
    if (this.tournamentId) {
      void this.router.navigate(['/tournaments', this.tournamentId, 'statistics']);
    }
  }

  /**
   * Shows export menu for tournament data export.
   */
  public showExportMenu = signal(false);

  /**
   * Toggles export menu visibility.
   */
  public toggleExportMenu(event?: Event): void {
    event?.stopPropagation();
    this.showExportMenu.update(v => !v);
  }

  /**
   * Closes export menu when clicking outside.
   */
  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const exportContainer = target.closest('.export-dropdown-container');
    
    if (!exportContainer && this.showExportMenu()) {
      this.showExportMenu.set(false);
    }
  }

  /**
   * Exports tournament data in ITF CSV format.
   */
  public async exportToITF(): Promise<void> {
    if (!this.tournamentId) return;
    
    try {
      await this.exportService.exportToITF(this.tournamentId);
      this.showExportMenu.set(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export tournament in ITF format');
    }
  }

  /**
   * Exports tournament data in TODS JSON format.
   */
  public async exportToTODS(): Promise<void> {
    if (!this.tournamentId) return;
    
    try {
      await this.exportService.exportToTODS(this.tournamentId);
      this.showExportMenu.set(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export tournament in TODS format');
    }
  }

  /**
   * Exports tournament results as PDF.
   */
  public async exportResultsToPDF(): Promise<void> {
    if (!this.tournamentId) return;
    
    try {
      await this.exportService.exportResultsToPDF(this.tournamentId);
      this.showExportMenu.set(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export results as PDF');
    }
  }

  /**
   * Exports tournament results as Excel spreadsheet.
   */
  public async exportResultsToExcel(): Promise<void> {
    if (!this.tournamentId) return;
    
    try {
      await this.exportService.exportResultsToExcel(this.tournamentId);
      this.showExportMenu.set(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export results as Excel');
    }
  }

  /**
   * Navigates to order of play management for this tournament (admin only).
   */
  public manageOrderOfPlay(): void {
    if (this.tournamentId) {
      void this.router.navigate(['/order-of-play', this.tournamentId]);
    }
  }

  /**
   * Navigates to phase management for multi-phase tournament operations (admin only).
   */
  public managePhases(): void {
    if (this.tournamentId) {
      void this.router.navigate(['/tournaments', this.tournamentId, 'phases']);
    }
  }

  /**
   * Handles tournament registration.
   * For doubles tournaments: Sends partner invitation (FR15 partner invitation system).
   * For singles tournaments: Direct registration.
   */
  public async registerForTournament(): Promise<void> {
    if (!this.tournamentId) return;

    const user = this.authStateService.getCurrentUser();
    if (!user) {
      // This should not happen as UI hides register button for unauthenticated users
      alert('Please log in first to register for tournaments');
      return;
    }

    // Check if registration deadline has passed
    if (this.isRegistrationClosed()) {
      alert(`Registration deadline has passed (${this.formatRegistrationDeadline()}). Registrations are no longer accepted.`);
      return;
    }

    // FR9 Requirement: Profile completeness validated by UI (button disabled + warning shown)
    // This check is redundant but kept as safety fallback
    if (!this.isProfileComplete()) {
      alert('Please complete your profile first (ID/NIE required).');
      return;
    }

    const categoryId = this.selectedCategoryId();
    if (!categoryId) {
      alert('Please select a category to register for');
      return;
    }

    // FR15: Partner required for doubles tournaments
    const partner = this.selectedPartner();
    if (this.isDoublesTournament() && !partner) {
      alert('Please select your doubles partner to register for a doubles tournament.');
      return;
    }

    try {
      // FR15: Doubles tournaments use invitation workflow
      if (this.isDoublesTournament() && partner) {
        await this.partnerInvitationService.sendInvitation({
          inviteeId: partner.id,
          tournamentId: this.tournamentId,
          categoryId: categoryId,
          message: undefined,
        });

        alert(
          `✉️ Partner invitation sent to ${partner.firstName} ${partner.lastName}!\n\n` +
          `Once they accept, both registrations will be created and pending admin approval.`
        );

        // Clear partner selection after sending invitation
        this.selectedPartner.set(null);
        this.partnerSearchQuery.set('');
      } else {
        // Singles tournament: Direct registration
        const newRegistration = await this.registrationService.registerParticipant(
          {
            tournamentId: this.tournamentId,
            categoryId: categoryId,
            partnerId: null,
          },
          user.id
        );
        this.userRegistration.set(newRegistration);
        
        // FR12: Show different messages based on acceptance type (quota management)
        if (newRegistration.acceptanceType === AcceptanceType.DIRECT_ACCEPTANCE) {
          alert('✅ Successfully registered! (Direct Acceptance)\n\nYour registration has been confirmed.');
        } else if (newRegistration.acceptanceType === AcceptanceType.ALTERNATE) {
          alert('⏳ Registered as Alternate\n\nThe category is currently full, so you\'ve been added to the waiting list. You\'ll be notified if a spot becomes available.');
        } else {
          // Fallback for other acceptance types
          alert('Successfully registered for tournament!');
        }
        
        await this.loadPlayers();
      }
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
    
    if (!this.authStateService.isAuthenticated() || !user || !tournament) return false;

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
   * Auto-creates a default "Open (Default Category)" if none exist.
   */
  private async loadCategories(): Promise<void> {
    if (!this.tournamentId) return;

    try {
      let categories = await this.categoryService.getCategoriesByTournament(this.tournamentId);
      
      // Auto-create default category if none exist (to allow participant registration)
      const currentUser = this.authStateService.getCurrentUser();
      const isAdmin = currentUser?.role === UserRole.SYSTEM_ADMIN || currentUser?.role === UserRole.TOURNAMENT_ADMIN;
      
      if (categories.length === 0 && isAdmin) {
        console.log('⚠️  No categories found. Creating default "Open (Default Category)"...');
        try {
          const defaultCategory = await this.categoryService.createCategory({
            tournamentId: this.tournamentId,
            name: 'Open (Default Category)',
            gender: Gender.OPEN,
            ageGroup: AgeGroup.OPEN,
            maxParticipants: this.tournament()?.maxParticipants || 32,
          });
          console.log('✅ Default category created:', defaultCategory);
          categories = [defaultCategory];
        } catch (createError) {
          console.error('Failed to create default category:', createError);
          // Don't fail silently, but continue with empty categories
        }
      }
      
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
   * Approves a pending registration. For doubles pairs, also approves the partner's registration.
   * @param registrationId - The registration ID to approve
   * @param playerName - Player name for confirmation message
   * @param partnerRegistrationId - Optional partner registration ID for doubles
   */
  public async approveRegistration(registrationId: string, playerName: string, partnerRegistrationId?: string): Promise<void> {
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
        acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
      };

      await this.registrationService.updateStatus(updateData, currentUser.id);

      // For doubles pairs: approve partner registration simultaneously
      if (partnerRegistrationId) {
        await this.registrationService.updateStatus(
          {registrationId: partnerRegistrationId, status: RegistrationStatus.ACCEPTED, acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE},
          currentUser.id,
        );
      }

      await this.loadPlayers();
      alert(`${playerName} has been approved!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve registration';
      alert(`Error: ${message}`);
    }
  }

  /**
   * Sets a pending registration as alternate (waiting list). For doubles pairs, sets both.
   * @param registrationId - The registration ID to set as alternate
   * @param playerName - Player name for confirmation message
   * @param partnerRegistrationId - Optional partner registration ID for doubles
   */
  public async setAsAlternate(registrationId: string, playerName: string, partnerRegistrationId?: string): Promise<void> {
    const confirmed = confirm(
      `Place ${playerName} on the waiting list as an alternate?\n\n` +
      `They will be notified and can participate if a spot opens up.`
    );
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
        acceptanceType: AcceptanceType.ALTERNATE,
      };

      await this.registrationService.updateStatus(updateData, currentUser.id);

      if (partnerRegistrationId) {
        await this.registrationService.updateStatus(
          {registrationId: partnerRegistrationId, status: RegistrationStatus.ACCEPTED, acceptanceType: AcceptanceType.ALTERNATE},
          currentUser.id,
        );
      }

      await this.loadPlayers();
      alert(`${playerName} has been placed on the waiting list as an alternate.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to set as alternate';
      alert(`Error: ${message}`);
    }
  }

  /**
   * Promotes an alternate player to the main draw as a lucky loser.
   * Called when spots open up and admin wants to move alternate to active participant.
   * @param registrationId - The registration ID to promote
   * @param playerName - Player name for confirmation message
   */
  public async promoteFromAlternate(registrationId: string, playerName: string): Promise<void> {
    const confirmed = confirm(
      `Promote ${playerName} from waiting list to main draw?\n\n` +
      `• Status: Alternate → Lucky Loser\n` +
      `• They will now count toward the category quota\n` +
      `• They can participate in matches`
    );
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
        acceptanceType: AcceptanceType.LUCKY_LOSER, // Promoted from alternate to main draw
      };

      await this.registrationService.updateStatus(updateData, currentUser.id);
      await this.loadPlayers();
      alert(`✅ ${playerName} has been promoted to the main draw as a Lucky Loser!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to promote player';
      alert(`Error: ${message}`);
    }
  }

  /**
   * Checks if a category has reached its maximum participant capacity.
   * Counts only ACCEPTED registrations with DIRECT_ACCEPTANCE or LUCKY_LOSER.
   * @param categoryId - The category ID to check
   * @returns True if category is at full capacity
   */
  public isCategoryFull(categoryId: string): boolean {
    // Find the category to get maxParticipants
    const category = this.categories().find(c => c.id === categoryId);
    if (!category) {
      return false;
    }

    // Get all players for this category
    const categoryPlayers = this.registeredPlayers().filter(p => p.registration.categoryId === categoryId);
    
    // Count ACCEPTED registrations with DA or LL for this category.
    // For doubles pairs (has partner), each entry counts as 2 slots.
    let acceptedCount = 0;
    for (const player of categoryPlayers) {
      const isAccepted = player.registration.status === RegistrationStatus.ACCEPTED;
      const acceptanceType = player.registration.acceptanceType;
      const isDAorLL = acceptanceType === AcceptanceType.DIRECT_ACCEPTANCE || acceptanceType === AcceptanceType.LUCKY_LOSER;
      if (isAccepted && isDAorLL) {
        acceptedCount += player.partner ? 2 : 1;
      }
    }

    return acceptedCount >= category.maxParticipants;
  }

  /**
   * Rejects a pending registration. For doubles pairs, rejects both.
   * @param registrationId - The registration ID to reject
   * @param playerName - Player name for confirmation message
   * @param partnerRegistrationId - Optional partner registration ID for doubles
   */
  public async rejectRegistration(registrationId: string, playerName: string, partnerRegistrationId?: string): Promise<void> {
    const confirmed = confirm(`Reject registration for ${playerName}? They will not be able to participate.`);
    if (!confirmed) return;

    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) {
      alert('You must be logged in to perform this action');
      return;
    }

    try {
      await this.registrationService.updateStatus(
        {registrationId, status: RegistrationStatus.REJECTED},
        currentUser.id,
      );

      if (partnerRegistrationId) {
        await this.registrationService.updateStatus(
          {registrationId: partnerRegistrationId, status: RegistrationStatus.REJECTED},
          currentUser.id,
        );
      }

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
      // FR13: Use the dedicated withdraw endpoint (timing-aware: promotes ALT, assigns WOs)
      await this.registrationService.withdrawRegistration(registrationId, new Date().toISOString(), currentUser.id);
      await this.loadPlayers();
      alert(`${playerName} has been removed from the tournament.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove participant';
      alert(`Error: ${message}`);
    }
  }

  /**
   * Permanently deletes a registration record from the list.
   * Intended for rejected or withdrawn registrations that should be fully removed.
   *
   * @param registrationId - ID of the registration to delete
   * @param playerName - Display name of the player (for confirmation dialog)
   */
  public async deleteParticipant(registrationId: string, playerName: string): Promise<void> {
    const confirmed = confirm(`Permanently delete ${playerName}'s registration? This cannot be undone.`);
    if (!confirmed) return;

    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) {
      alert('You must be logged in to perform this action');
      return;
    }

    try {
      await this.registrationService.deleteRegistration(registrationId);
      await this.loadPlayers();
      alert(`${playerName}'s registration has been permanently deleted.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete registration';
      alert(`Error: ${message}`);
    }
  }

  /**
   * Approves all pending registrations.
   */
  public async approveAllRegistrations(): Promise<void> {
    const pendingPlayers = this.registeredPlayers().filter(
      player => player.registration.status === RegistrationStatus.PENDING
    );

    if (pendingPlayers.length === 0) {
      alert('No pending registrations to approve.');
      return;
    }

    const confirmed = confirm(
      `Approve all ${pendingPlayers.length} pending registration${pendingPlayers.length > 1 ? 's' : ''}?\n\n` +
      `This will approve:\n${pendingPlayers.slice(0, 5).map(p => `• ${p.user.username || p.user.firstName + ' ' + p.user.lastName || p.user.email}`).join('\n')}` +
      (pendingPlayers.length > 5 ? `\n...and ${pendingPlayers.length - 5} more` : '')
    );
    
    if (!confirmed) return;

    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) {
      alert('You must be logged in to perform this action');
      return;
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const player of pendingPlayers) {
      try {
        // Check if category is full
        const isFull = this.isCategoryFull(player.registration.categoryId);
        
        const updateData: UpdateRegistrationStatusDto = {
          registrationId: player.registration.id,
          status: RegistrationStatus.ACCEPTED,
          acceptanceType: isFull ? AcceptanceType.ALTERNATE : AcceptanceType.DIRECT_ACCEPTANCE,
        };

        await this.registrationService.updateStatus(updateData, currentUser.id);
        successCount++;
      } catch (error) {
        failCount++;
        const playerName = player.user.username || player.user.firstName + ' ' + player.user.lastName || player.user.email;
        errors.push(`${playerName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    await this.loadPlayers();

    let message = `✅ Approved ${successCount} registration${successCount !== 1 ? 's' : ''}`;
    if (failCount > 0) {
      message += `\n❌ Failed to approve ${failCount}:\n${errors.slice(0, 3).join('\n')}`;
      if (errors.length > 3) {
        message += `\n...and ${errors.length - 3} more errors`;
      }
    }
    alert(message);
  }

  /**
   * Rejects all pending registrations.
   */
  public async rejectAllRegistrations(): Promise<void> {
    const pendingPlayers = this.registeredPlayers().filter(
      player => player.registration.status === RegistrationStatus.PENDING
    );

    if (pendingPlayers.length === 0) {
      alert('No pending registrations to reject.');
      return;
    }

    const confirmed = confirm(
      `⚠️ WARNING: Reject all ${pendingPlayers.length} pending registration${pendingPlayers.length > 1 ? 's' : ''}?\n\n` +
      `This will reject:\n${pendingPlayers.slice(0, 5).map(p => `• ${p.user.username || p.user.firstName + ' ' + p.user.lastName || p.user.email}`).join('\n')}` +
      (pendingPlayers.length > 5 ? `\n...and ${pendingPlayers.length - 5} more` : '') +
      `\n\nThis action cannot be undone. Players will NOT be able to participate.`
    );
    
    if (!confirmed) return;

    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) {
      alert('You must be logged in to perform this action');
      return;
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const player of pendingPlayers) {
      try {
        const updateData: UpdateRegistrationStatusDto = {
          registrationId: player.registration.id,
          status: RegistrationStatus.REJECTED,
        };

        await this.registrationService.updateStatus(updateData, currentUser.id);
        successCount++;
      } catch (error) {
        failCount++;
        const playerName = player.user.username || player.user.firstName + ' ' + player.user.lastName || player.user.email;
        errors.push(`${playerName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    await this.loadPlayers();

    let message = `✅ Rejected ${successCount} registration${successCount !== 1 ? 's' : ''}`;
    if (failCount > 0) {
      message += `\n❌ Failed to reject ${failCount}:\n${errors.slice(0, 3).join('\n')}`;
      if (errors.length > 3) {
        message += `\n...and ${errors.length - 3} more errors`;
      }
    }
    alert(message);
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
      this.bracketForm.matchFormat = MatchFormat.BEST_OF_3_FINAL_SET_TIEBREAK;
    }
  }

  /**
   * Gets the count of accepted participants for a category who can actually play in the bracket.
   * Excludes ALTERNATE players (waiting list) but includes LUCKY_LOSER (promoted from waiting list).
   *
   * @param categoryId - The category ID
   * @returns Number of accepted participants eligible for bracket
   */
  public getAcceptedParticipantCount(categoryId: string): number {
    return this.registeredPlayers().filter(
      p => p.registration.categoryId === categoryId 
        && p.registration.status === RegistrationStatus.ACCEPTED
        && p.registration.acceptanceType !== AcceptanceType.ALTERNATE
        && p.registration.acceptanceType !== AcceptanceType.WITHDRAWN
    ).length;
  }

  /**
   * Checks if a category has accepted participants.
   *
   * @param categoryId - The category ID
   * @returns True if category has at least one accepted participant
   */
  public hasAcceptedParticipants(categoryId: string): boolean {
    return this.getAcceptedParticipantCount(categoryId) > 0;
  }

  /**
   * Gets acceptance type badge abbreviation for display.
   *
   * @param acceptanceType - The acceptance type
   * @returns Badge abbreviation (WC, SE, LL, etc.)
   */
  public getAcceptanceTypeBadge(acceptanceType: AcceptanceType | null | undefined): string | null {
    if (!acceptanceType) return null;
    
    const badges: Record<AcceptanceType, string> = {
      [AcceptanceType.WILD_CARD]: 'WC',
      [AcceptanceType.SPECIAL_EXEMPTION]: 'SE',
      [AcceptanceType.JUNIOR_EXEMPTION]: 'JE',
      [AcceptanceType.LUCKY_LOSER]: 'LL',
      [AcceptanceType.QUALIFIER]: 'Q',
      [AcceptanceType.ALTERNATE]: 'ALT',
      [AcceptanceType.DIRECT_ACCEPTANCE]: 'DA',
      [AcceptanceType.ORGANIZER_ACCEPTANCE]: 'OA',
      [AcceptanceType.WITHDRAWN]: 'WD',
    };
    
    return badges[acceptanceType] || null;
  }

  /**
   * Gets status badge color class.
   *
   * @param status - Registration status
   * @returns CSS color class
   */
  public getStatusBadgeColor(status: RegistrationStatus): string {
    const colors: Record<RegistrationStatus, string> = {
      [RegistrationStatus.PENDING]: '#f59e0b',
      [RegistrationStatus.ACCEPTED]: '#10b981',
      [RegistrationStatus.REJECTED]: '#ef4444',
      [RegistrationStatus.WITHDRAWN]: '#6b7280',
    };
    return colors[status] || '#6b7280';
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
   * Gets human-readable display info for match format.
   *
   * @param format - The match format enum value
   * @returns Object with label and description
   */
  public getMatchFormatInfo(format: MatchFormat): {label: string; description: string} {
    switch (format) {
      case MatchFormat.BEST_OF_3_FINAL_SET_TIEBREAK:
        return {
          label: 'Best of 3 (Super Tiebreak)',
          description: 'First to win 2 sets. If 1-1, play 10-point super tiebreak instead of a third set.',
        };
      case MatchFormat.BEST_OF_3_ADVANTAGE:
        return {
          label: 'Best of 3 (Advantage Final Set)',
          description: 'First to win 2 sets. If 1-1, play full advantage third set (win by 2 games).',
        };
      case MatchFormat.BEST_OF_5_FINAL_SET_TIEBREAK:
        return {
          label: 'Best of 5 (Super Tiebreak)',
          description: 'First to win 3 sets. If 2-2, play 10-point super tiebreak (modern Grand Slams).',
        };
      case MatchFormat.BEST_OF_5_ADVANTAGE:
        return {
          label: 'Best of 5 (Advantage Final Set)',
          description: 'First to win 3 sets. If 2-2, play full advantage fifth set (traditional format).',
        };
      case MatchFormat.PRO_SET:
        return {
          label: 'Pro Set',
          description: 'Single set to 8 games with tiebreak at 7-7. Fast format for practice matches.',
        };
      case MatchFormat.SHORT_SETS:
        return {
          label: 'Short Sets',
          description: 'Best of 3 short sets (first to 4 games per set). Quick format for juniors.',
        };
      case MatchFormat.FAST4:
        return {
          label: 'Fast4',
          description: 'Fast4 format with no-ad scoring, first to 4 games. Very fast matches.',
        };
      case MatchFormat.SUPER_TIEBREAK:
        return {
          label: 'Super Tiebreak Only',
          description: 'Single 10-point tiebreak (entire match). Fastest possible format.',
        };
      default:
        return {label: format, description: 'Custom match format'};
    }
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
      const newBracket = await this.bracketService.generateBracket(
        {
          tournamentId: this.tournamentId,
          categoryId: this.bracketForm.categoryId,
          bracketType: this.bracketForm.bracketType,
          matchFormat: this.bracketForm.matchFormat,
        },
        currentUser.id
      );

      alert(`${this.bracketForm.bracketType.replace(/_/g, ' ')} bracket created successfully for ${category.name}!\n\nParticipants: ${acceptedCount} players`);
      this.showBracketGeneration.set(false);
      this.bracketForm.categoryId = '';
      this.bracketForm.bracketType = BracketType.SINGLE_ELIMINATION;
      this.bracketForm.matchFormat = MatchFormat.BEST_OF_3_FINAL_SET_TIEBREAK;
      
      // Navigate to the newly created bracket to show it with the correct format
      void this.router.navigate(['/brackets', newBracket.id]);
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

  // ============================================================================
  // Add Participant Modal Methods (FR12 Manual Enrollment)
  // ============================================================================

  /**
   * Opens the Add Participant modal and loads available users.
   * Allows admin to manually enroll any system user into the tournament.
   */
  public async showAddParticipantModal(): Promise<void> {
    // Load eligible participants (PLAYER role, active users) if not already loaded
    if (this.allUsers().length === 0) {
      await this.loadEligibleParticipantsForPartnerSearch();
    }
    
    this.showAddParticipantDialog.set(true);
  }

  /**
   * Loads eligible participants (active PLAYER role users) for partner search or admin enrollment.
   * Shared by both Add Participant modal and doubles partner search.
   */
  private async loadEligibleParticipantsForPartnerSearch(): Promise<void> {
    try {
      const users = await this.userManagementService.getEligibleParticipants();
      this.allUsers.set(users);
    } catch (error) {
      console.error('❌ Failed to load users:', error);
      // Silent fail for partner search, don't block user
    }
  }

  /**
   * Closes the Add Participant modal and resets form data.
   */
  public hideAddParticipantModal(): void {
    this.showAddParticipantDialog.set(false);
    this.userSearchQuery.set('');
    this.addParticipantFormData.selectedUserId = null;
    this.addParticipantFormData.selectedUserName = null;
    this.addParticipantFormData.categoryId = null;
    this.enrollmentMode.set('system');
    this.guestEnrollFormData.firstName = '';
    this.guestEnrollFormData.lastName = '';
    this.guestEnrollFormData.categoryId = null;
  }

  /**
   * Handles user search input changes.
   * Note: Now handled directly in template via userSearchQuery.set()
   * This method is kept for backwards compatibility but is no longer used.
   */
  public searchUsers(_query: string): void {
    // No longer needed - template directly updates userSearchQuery signal
  }

  /**
   * Selects a user from the search results.
   *
   * @param user - The selected user
   */
  public selectUser(user: UserSummaryDto): void {
    this.addParticipantFormData.selectedUserId = user.id;
    this.addParticipantFormData.selectedUserName = user.username || `${user.firstName} ${user.lastName}`;
    this.userSearchQuery.set(''); // Clear search to hide dropdown
  }

  /**
   * Clears the selected user.
   */
  public clearUserSelection(): void {
    this.addParticipantFormData.selectedUserId = null;
    this.addParticipantFormData.selectedUserName = null;
  }

  /**
   * FR15: Selects a partner for doubles registration.
   * 
   * @param user - The selected partner user
   */
  public selectPartner(user: UserSummaryDto): void {
    this.selectedPartner.set(user);
    this.doublesPartnerId.set(user.id); // Update legacy signal
    this.partnerSearchQuery.set(''); // Clear search to hide dropdown
  }

  /**
   * FR15: Clears the selected partner for doubles registration.
   */
  public clearPartnerSelection(): void {
    this.selectedPartner.set(null);
    this.doublesPartnerId.set('');
    this.partnerSearchQuery.set('');
  }

  /**
   * Submits the add participant form and registers the selected user.
   * Validates form data, checks for duplicates, and creates registration.
   */
  public async addParticipantManually(): Promise<void> {
    // Validate form data
    if (!this.addParticipantFormData.selectedUserId) {
      alert('Please select a participant.');
      return;
    }

    if (!this.addParticipantFormData.categoryId) {
      alert('Please select a category.');
      return;
    }

    if (!this.tournamentId) {
      alert('Tournament ID is missing.');
      return;
    }

    // Check if user is already registered in this category
    const existingRegistration = this.registeredPlayers().find(
      p => p.user.id === this.addParticipantFormData.selectedUserId &&
           p.registration.categoryId === this.addParticipantFormData.categoryId
    );

    if (existingRegistration) {
      // Allow re-registration if the player is WITHDRAWN or CANCELLED
      if (existingRegistration.registration.status === RegistrationStatus.WITHDRAWN ||
          existingRegistration.registration.status === RegistrationStatus.CANCELLED) {
        
        const confirmed = confirm(
          `This player was previously ${existingRegistration.registration.status.toLowerCase()} from this category.\n\n` +
          `Would you like to re-register them?\n\n` +
          `• The registration will be set to PENDING\n` +
          `• You can approve it to restore their participation\n` +
          `• Quota rules will apply (ACCEPTED or ALTERNATE based on availability)`
        );
        
        if (!confirmed) {
          return;
        }
        
        // Re-register by updating existing registration to PENDING
        this.isAddingParticipant.set(true);
        try {
          const currentUser = this.authStateService.getCurrentUser();
          if (!currentUser) {
            alert('You must be logged in to perform this action.');
            return;
          }
          
          await this.registrationService.updateStatus(
            {
              registrationId: existingRegistration.registration.id!,
              status: RegistrationStatus.PENDING,
            },
            currentUser.id
          );
          
          alert(`✅ Player re-registered successfully!\n\nThe registration is now PENDING. You can approve it from the participants list.\n\nQuota logic will apply when approving.`);
          
          // Reload players to show the updated registration
          await this.loadPlayers();
          
          // Close modal and reset form
          this.hideAddParticipantModal();
        } catch (error) {
          let message = 'Failed to re-register participant.';
          
          if (error && typeof error === 'object') {
            const axiosError = error as {response?: {data?: {message?: string; error?: string}}};
            if (axiosError.response?.data?.message) {
              message = axiosError.response.data.message;
            } else if (axiosError.response?.data?.error) {
              message = axiosError.response.data.error;
            } else if (error instanceof Error) {
              message = error.message;
            }
          }
          
          console.error('Re-register error:', error);
          alert(`Error: ${message}`);
        } finally {
          this.isAddingParticipant.set(false);
        }
        return;
      }
      
      // Player is actively registered (PENDING, ACCEPTED, REJECTED)
      alert(`This user is already registered in the selected category.\n\nStatus: ${existingRegistration.registration.status}`);
      return;
    }

    this.isAddingParticipant.set(true);

    try {
      // Register the participant (initial status will be PENDING)
      await this.registrationService.registerParticipant(
        {
          tournamentId: this.tournamentId,
          categoryId: this.addParticipantFormData.categoryId,
        },
        this.addParticipantFormData.selectedUserId,
        true,
      );

      alert(`✅ Participant added successfully!\n\nThe registration is pending approval. You can now approve it from the participants list.`);
      
      // Reload players to show the new participant
      await this.loadPlayers();
      
      // Close modal and reset form
      this.hideAddParticipantModal();
    } catch (error) {
      let message = 'Failed to add participant.';
      
      if (error && typeof error === 'object') {
        const axiosError = error as {response?: {data?: {message?: string; error?: string}}};
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        } else if (axiosError.response?.data?.error) {
          message = axiosError.response.data.error;
        } else if (error instanceof Error) {
          message = error.message;
        }
      }
      
      console.error('Add participant error:', error);
      alert(`Error: ${message}`);
    } finally {
      this.isAddingParticipant.set(false);
    }
  }

  /**
   * Submits the guest enrollment form, creating a guest user and registering
   * them into the selected category without requiring REGISTRATION_OPEN status.
   * Admin-only action (FR10).
   */
  public async addGuestParticipant(): Promise<void> {
    if (!this.guestEnrollFormData.firstName.trim() || !this.guestEnrollFormData.lastName.trim()) {
      alert('Please enter first and last name.');
      return;
    }

    if (!this.guestEnrollFormData.categoryId) {
      alert('Please select a category.');
      return;
    }

    this.isAddingParticipant.set(true);
    try {
      await this.registrationService.adminEnrollGuest(
        this.guestEnrollFormData.categoryId,
        this.guestEnrollFormData.firstName.trim(),
        this.guestEnrollFormData.lastName.trim(),
      );

      alert(
        `✅ Guest participant added!\n\n` +
        `${this.guestEnrollFormData.firstName} ${this.guestEnrollFormData.lastName} ` +
        `has been registered in the selected category with PENDING status.\n\n` +
        `Please approve the registration from the participants list.`,
      );

      await this.loadPlayers();
      this.hideAddParticipantModal();
    } catch (error) {
      let message = 'Failed to enroll guest participant.';
      if (error && typeof error === 'object') {
        const axiosError = error as {response?: {data?: {message?: string; error?: string}}};
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        } else if (axiosError.response?.data?.error) {
          message = axiosError.response.data.error;
        } else if (error instanceof Error) {
          message = error.message;
        }
      }
      console.error('Guest enrollment error:', error);
      alert(`Error: ${message}`);
    } finally {
      this.isAddingParticipant.set(false);
    }
  }

  /**
   * Starts editing the seed number for a registration.
   *
   * @param registrationId - ID of the registration to edit
   * @param currentSeedNumber - Current seed number value
   */
  public startEditingSeed(registrationId: string, currentSeedNumber: number | null): void {
    this.editingSeedRegistrationId.set(registrationId);
    this.tempSeedNumber.set(currentSeedNumber);
  }

  /**
   * Cancels seed editing.
   */
  public cancelEditingSeed(): void {
    this.editingSeedRegistrationId.set(null);
    this.tempSeedNumber.set(null);
  }

  /**
   * Saves the updated seed number for a registration.
   *
   * @param registrationId - ID of the registration to update
   */
  public async saveSeedNumber(registrationId: string): Promise<void> {
    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) {
      alert('You must be logged in to update seed numbers');
      return;
    }

    const seedNumber = this.tempSeedNumber();

    // Validate seed number
    if (seedNumber !== null && (seedNumber < 1 || !Number.isInteger(seedNumber))) {
      alert('Seed number must be a positive integer');
      return;
    }

    try {
      console.log(`🔄 Updating seed number for registration ${registrationId} to ${seedNumber}`);
      const updatedRegistration = await this.registrationService.updateSeedNumber(registrationId, seedNumber, currentUser.id);
      console.log('✅ Backend update successful:', updatedRegistration);
      
      // Update the player in the list directly for immediate UI update
      const currentPlayers = this.registeredPlayers();
      const updatedPlayers = currentPlayers.map(p => 
        p.registration.id === registrationId 
          ? { ...p, registration: updatedRegistration }
          : p
      );
      this.registeredPlayers.set(updatedPlayers);
      console.log('✅ UI updated with new seed number');
      
      // Also reload all players to ensure consistency
      await this.loadPlayers();
      console.log('✅ Player list reloaded');
      
      // Clear editing state
      this.cancelEditingSeed();
      
      alert('Seed number updated successfully!');
    } catch (error) {
      let message = 'Failed to update seed number.';
      
      if (error && typeof error === 'object') {
        const axiosError = error as {response?: {data?: {message?: string; error?: string}}};
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        } else if (axiosError.response?.data?.error) {
          message = axiosError.response.data.error;
        } else if (error instanceof Error) {
          message = error.message;
        }
      }
      
      console.error('❌ Update seed number error:', error);
      alert(`Error: ${message}`);
    }
  }

  /**
   * Checks if a registration is currently being edited for seed.
   *
   * @param registrationId - ID of the registration
   * @returns True if this registration is being edited
   */
  public isEditingSeed(registrationId: string): boolean {
    return this.editingSeedRegistrationId() === registrationId;
  }

  /**
   * Opens the edit participant modal with the given registration data.
   *
   * @param player - The player data with registration information
   */
  public openEditParticipantModal(player: {user: User; registration: RegistrationDto; partner?: {user: User; registration: RegistrationDto} | null}): void {
    this.editParticipantForm = {
      registrationId: player.registration.id,
      participantName: `${player.user.firstName} ${player.user.lastName}`,
      seedNumber: player.registration.seedNumber,
      status: player.registration.status,
      acceptanceType: player.registration.acceptanceType || AcceptanceType.DIRECT_ACCEPTANCE,
      categoryId: player.registration.categoryId,
    };
    this.showEditParticipantModal.set(true);
  }

  /**
   * Closes the edit participant modal and resets form data.
   */
  public closeEditParticipantModal(): void {
    this.showEditParticipantModal.set(false);
    this.editParticipantForm = {
      registrationId: '',
      participantName: '',
      seedNumber: null,
      status: RegistrationStatus.PENDING,
      acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
      categoryId: '',
    };
  }

  /**
   * Saves the updated participant information.
   * Updates seed number, status, acceptance type, and category.
   */
  public async saveEditParticipant(): Promise<void> {
    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser) {
      alert('You must be logged in to edit participants');
      return;
    }

    const {registrationId, seedNumber, status, acceptanceType, categoryId} = this.editParticipantForm;

    // Validate seed number
    if (seedNumber !== null && (seedNumber < 1 || !Number.isInteger(seedNumber))) {
      alert('Seed number must be a positive integer');
      return;
    }

    this.isUpdatingParticipant.set(true);

    try {
      console.log(`🔄 Updating participant registration ${registrationId}`);
      console.log(`   Seed: ${seedNumber}, Status: ${status}, Type: ${acceptanceType}, Category: ${categoryId}`);

      // Update seed number
      if (seedNumber !== null) {
        await this.registrationService.updateSeedNumber(registrationId, seedNumber, currentUser.id);
        console.log('✅ Seed number updated');
      }

      // Update status and acceptance type
      const updateDto: UpdateRegistrationStatusDto = {
        registrationId,
        status,
        acceptanceType,
      };
      await this.registrationService.updateStatus(updateDto, currentUser.id);
      console.log('✅ Status and acceptance type updated');

      // Reload players to reflect changes
      await this.loadPlayers();
      console.log('✅ Player list reloaded');

      // Close modal
      this.closeEditParticipantModal();

      alert('Participant updated successfully!');
    } catch (error) {
      let message = 'Failed to update participant.';

      if (error && typeof error === 'object') {
        const axiosError = error as {response?: {data?: {message?: string; error?: string}}};
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        } else if (axiosError.response?.data?.error) {
          message = axiosError.response.data.error;
        } else if (error instanceof Error) {
          message = error.message;
        }
      }

      console.error('❌ Update participant error:', error);
      alert(`Error: ${message}`);
    } finally {
      this.isUpdatingParticipant.set(false);
    }
  }

  /**
   * Gets a human-readable label for an acceptance type.
   *
   * @param type - The acceptance type enum value
   * @returns A human-readable label
   */
  public getAcceptanceTypeLabel(type: AcceptanceType): string {
    const labels: Record<AcceptanceType, string> = {
      [AcceptanceType.ORGANIZER_ACCEPTANCE]: 'Organizer Acceptance (OA)',
      [AcceptanceType.DIRECT_ACCEPTANCE]: 'Direct Acceptance (DA)',
      [AcceptanceType.SPECIAL_EXEMPTION]: 'Special Exemption (SE)',
      [AcceptanceType.JUNIOR_EXEMPTION]: 'Junior Exemption (JE)',
      [AcceptanceType.QUALIFIER]: 'Qualifier (Q)',
      [AcceptanceType.LUCKY_LOSER]: 'Lucky Loser (LL)',
      [AcceptanceType.WILD_CARD]: 'Wild Card (WC)',
      [AcceptanceType.ALTERNATE]: 'Alternate (ALT)',
      [AcceptanceType.WITHDRAWN]: 'Withdrawn (WD)',
    };
    return labels[type] || type;
  }
}

