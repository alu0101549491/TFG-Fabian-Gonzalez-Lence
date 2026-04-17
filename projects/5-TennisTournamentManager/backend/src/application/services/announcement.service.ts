/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 7, 2026
 * @file backend/src/application/services/announcement.service.ts
 * @desc Service for managing announcements with privacy, scheduling, and notifications (FR47-FR49).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Repository} from 'typeorm';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Announcement, AnnouncementType} from '../../domain/entities/announcement.entity';
import {Registration} from '../../domain/entities/registration.entity';
import {User} from '../../domain/entities/user.entity';
import {AuditLog} from '../../domain/entities/audit-log.entity';
import {UserRole} from '../../domain/enumerations/user-role';
import {RegistrationStatus} from '../../domain/enumerations/registration-status';
import {AuditAction} from '../../domain/enumerations/audit-action';
import {AuditResourceType} from '../../domain/enumerations/audit-resource-type';
import {NotificationType} from '../../domain/enumerations/notification-type';
import {AppError} from '../../shared/errors/app-error';
import {generateId} from '../../shared/utils/id-generator';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {NotificationService} from './notification.service';
import {AuditService} from './audit.service';

/**
 * Interface for announcement query filters.
 */
export interface AnnouncementFilters {
  tournamentId?: string;
  tags?: string[];
  search?: string;
  type?: AnnouncementType;
  isPublished?: boolean;
  isPinned?: boolean;
}

/**
 * Service for announcement operations.
 * 
 * @remarks
 * Handles:
 * - CRUD operations for announcements
 * - Privacy filtering (PUBLIC vs PRIVATE)
 * - Tag-based filtering and search
 * - Scheduled publication
 * - Notification integration
 */
export class AnnouncementService {
  private readonly announcementRepository: Repository<Announcement>;
  private readonly registrationRepository: Repository<Registration>;
  private readonly userRepository: Repository<User>;
  private readonly notificationService: NotificationService;
  private readonly auditService: AuditService;

  constructor() {
    this.announcementRepository = AppDataSource.getRepository(Announcement);
    this.registrationRepository = AppDataSource.getRepository(Registration);
    this.userRepository = AppDataSource.getRepository(User);
    this.notificationService = new NotificationService();
    const auditLogRepository = AppDataSource.getRepository(AuditLog);
    this.auditService = new AuditService(auditLogRepository);
  }

  /**
   * Creates a new announcement.
   *
   * @param data - Announcement data
   * @param authorId - ID of the creating user
   * @returns Created announcement
   */
  public async create(data: Partial<Announcement>, authorId: string): Promise<Announcement> {
    const announcement = this.announcementRepository.create({
      ...data,
      id: generateId('ann'),
      authorId,
      type: data.type || AnnouncementType.PUBLIC,
      isPublished: data.isPublished !== undefined ? data.isPublished : true, // Publish by default
      isPinned: data.isPinned || false,
      tags: data.tags || [],
      publishedAt: data.publishedAt || (data.isPublished !== false ? new Date() : null),
    });

    const saved = await this.announcementRepository.save(announcement);

    // Audit log
    await this.auditService.log({
      userId: authorId,
      action: AuditAction.CREATE,
      resourceType: AuditResourceType.ANNOUNCEMENT,
      resourceId: saved.id,
      details: `Created announcement: ${saved.title}`,
    });

    // Send notifications if published
    if (saved.isPublished) {
      await this.sendPublicationNotifications(saved);
    }

    return saved;
  }

  /**
   * Publishes an announcement and sends notifications.
   *
   * @param announcementId - Announcement ID
   * @param userId - User performing the action
   * @returns Updated announcement
   */
  public async publish(announcementId: string, userId: string): Promise<Announcement> {
    const announcement = await this.announcementRepository.findOne({
      where: {id: announcementId},
      relations: ['tournament'],
    });

    if (!announcement) {
      throw new AppError('Announcement not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    announcement.isPublished = true;
    announcement.publishedAt = new Date();
    const updated = await this.announcementRepository.save(announcement);

    // Send notifications to participants
    await this.sendPublicationNotifications(announcement);

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.PUBLISH,
      resourceType: AuditResourceType.ANNOUNCEMENT,
      resourceId: announcement.id,
      details: `Published announcement: ${announcement.title}`,
    });

    return updated;
  }

  /**
   * Updates an existing announcement.
   *
   * @param announcementId - Announcement ID
   * @param data - Update data
   * @param userId - User performing the action
   * @returns Updated announcement
   */
  public async update(
    announcementId: string,
    data: Partial<Announcement>,
    userId: string,
  ): Promise<Announcement> {
    const announcement = await this.announcementRepository.findOne({
      where: {id: announcementId},
    });

    if (!announcement) {
      throw new AppError('Announcement not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    // Update fields
    Object.assign(announcement, {
      ...data,
      id: announcement.id, // Prevent ID change
      authorId: announcement.authorId, // Prevent author change
      updatedAt: new Date(),
    });

    const updated = await this.announcementRepository.save(announcement);

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.UPDATE,
      resourceType: AuditResourceType.ANNOUNCEMENT,
      resourceId: announcement.id,
      details: `Updated announcement: ${announcement.title}`,
    });

    return updated;
  }

  /**
   * Deletes an announcement.
   *
   * @param announcementId - Announcement ID
   * @param userId - User performing the action
   */
  public async delete(announcementId: string, userId: string): Promise<void> {
    const announcement = await this.announcementRepository.findOne({
      where: {id: announcementId},
    });

    if (!announcement) {
      throw new AppError('Announcement not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    await this.announcementRepository.remove(announcement);

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.DELETE,
      resourceType: AuditResourceType.ANNOUNCEMENT,
      resourceId: announcementId,
      details: `Deleted announcement: ${announcement.title}`,
    });
  }

  /**
   * Retrieves announcements with privacy filtering.
   *
   * @param filters - Query filters
   * @param userId - Current user ID (for privacy checks)
   * @returns Filtered announcements
   */
  public async findAll(filters: AnnouncementFilters, userId?: string): Promise<Announcement[]> {
    const queryBuilder = this.announcementRepository
      .createQueryBuilder('announcement')
      .leftJoinAndSelect('announcement.author', 'author')
      .leftJoinAndSelect('announcement.tournament', 'tournament');

    // Filter by tournament
    if (filters.tournamentId) {
      queryBuilder.andWhere('announcement.tournamentId = :tournamentId', {
        tournamentId: filters.tournamentId,
      });
    }

    // Filter by publication status (default: only published)
    if (filters.isPublished !== undefined) {
      queryBuilder.andWhere('announcement.isPublished = :isPublished', {
        isPublished: filters.isPublished,
      });
    } else {
      queryBuilder.andWhere('announcement.isPublished = true');
    }

    // Filter by pinned status
    if (filters.isPinned !== undefined) {
      queryBuilder.andWhere('announcement.isPinned = :isPinned', {
        isPinned: filters.isPinned,
      });
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('announcement.tags && ARRAY[:...tags]::varchar[]', {
        tags: filters.tags,
      });
    }

    // Search in title and content
    if (filters.search) {
      queryBuilder.andWhere(
        '(announcement.title ILIKE :search OR announcement.content ILIKE :search OR announcement.longText ILIKE :search)',
        {search: `%${filters.search}%`},
      );
    }

    // Check expiration
    queryBuilder.andWhere(
      '(announcement.expirationDate IS NULL OR announcement.expirationDate > :now)',
      {now: new Date()},
    );

    // Privacy filtering
    if (userId) {
      console.log('[Announcement Privacy] userId:', userId);
      const user = await this.userRepository.findOne({where: {id: userId}});
      const isAdmin =
        user && (user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.TOURNAMENT_ADMIN);
      console.log('[Announcement Privacy] user:', {id: user?.id, role: user?.role, isAdmin});

      if (!isAdmin) {
        // For non-admin users, show PUBLIC announcements
        // and PRIVATE announcements only if ACCEPTED in tournament
        const registrations = await this.registrationRepository.find({
          where: {
            participantId: userId,
            status: RegistrationStatus.ACCEPTED,
          },
        });
        const registeredTournamentIds = registrations.map((r) => r.tournamentId);
        console.log('[Announcement Privacy] ACCEPTED registrations:', registrations.length, 'tournaments:', registeredTournamentIds);

        queryBuilder.andWhere(
          '(announcement.type = :publicType OR (announcement.type = :privateType AND announcement.tournamentId IN (:...tournamentIds)))',
          {
            publicType: AnnouncementType.PUBLIC,
            privateType: AnnouncementType.PRIVATE,
            tournamentIds: registeredTournamentIds.length > 0 ? registeredTournamentIds : [''],
          },
        );
      }
    } else {
      console.log('[Announcement Privacy] No userId - showing only PUBLIC');
      // Public users only see PUBLIC announcements
      queryBuilder.andWhere('announcement.type = :publicType', {
        publicType: AnnouncementType.PUBLIC,
      });
    }

    // Order by: pinned first, then by publication date descending
    queryBuilder.orderBy('announcement.isPinned', 'DESC');
    queryBuilder.addOrderBy('announcement.publishedAt', 'DESC');
    queryBuilder.addOrderBy('announcement.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Retrieves a single announcement by ID with privacy check.
   *
   * @param announcementId - Announcement ID
   * @param userId - Current user ID (for privacy checks)
   * @returns Announcement or null
   */
  public async findById(announcementId: string, userId?: string): Promise<Announcement | null> {
    const announcement = await this.announcementRepository.findOne({
      where: {id: announcementId},
      relations: ['author', 'tournament'],
    });

    if (!announcement) {
      return null;
    }

    // Check privacy
    if (announcement.type === AnnouncementType.PRIVATE && userId) {
      const user = await this.userRepository.findOne({where: {id: userId}});
      const isAdmin =
        user && (user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.TOURNAMENT_ADMIN);

      if (!isAdmin) {
        // Check if user is ACCEPTED in tournament
        const registration = await this.registrationRepository.findOne({
          where: {
            participantId: userId,
            tournamentId: announcement.tournamentId,
            status: RegistrationStatus.ACCEPTED,
          },
        });

        if (!registration) {
          throw new AppError(
            'You do not have permission to view this announcement',
            HTTP_STATUS.FORBIDDEN,
            ERROR_CODES.FORBIDDEN,
          );
        }
      }
    } else if (announcement.type === AnnouncementType.PRIVATE && !userId) {
      throw new AppError(
        'You must be logged in to view this announcement',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    return announcement;
  }

  /**
   * Processes scheduled announcements (called by cron job).
   */
  public async processScheduledPublications(): Promise<void> {
    const now = new Date();

    const scheduledAnnouncements = await this.announcementRepository.find({
      where: {
        isPublished: false,
      },
    });

    for (const announcement of scheduledAnnouncements) {
      if (
        announcement.scheduledPublishAt &&
        announcement.scheduledPublishAt <= now &&
        !announcement.isPublished
      ) {
        announcement.isPublished = true;
        announcement.publishedAt = now;
        await this.announcementRepository.save(announcement);

        // Send notifications
        await this.sendPublicationNotifications(announcement);

        console.log(`Auto-published announcement: ${announcement.id}`);
      }
    }
  }

  /**
   * Sends notifications to tournament participants when announcement is published.
   *
   * @param announcement - Published announcement
   */
  private async sendPublicationNotifications(announcement: Announcement): Promise<void> {
    try {
      // Get ACCEPTED tournament participants
      const registrations = await this.registrationRepository.find({
        where: {
          tournamentId: announcement.tournamentId,
          status: RegistrationStatus.ACCEPTED,
        },
      });

      const participantIds = registrations.map((r) => r.participantId);

      // For PRIVATE announcements, only notify ACCEPTED participants
      // For PUBLIC announcements, notify all ACCEPTED participants
      if (participantIds.length === 0) {
        return;
      }

      // Send notifications using NotificationService
      await this.notificationService.notifyAnnouncementPublished(
        announcement.tournamentId,
        participantIds,
        announcement.title,
        announcement.id,
      );
      
      console.log(`📧 Sent announcement notifications to ${participantIds.length} participants`);
    } catch (error) {
      console.error('Error sending announcement notifications:', error);
      // Don't throw - notification failure shouldn't break announcement publication
    }
  }
}
