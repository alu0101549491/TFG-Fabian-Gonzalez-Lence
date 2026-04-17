/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 17, 2026
 * @file backend/src/application/services/__tests__/notification.service.test.ts
 * @desc Unit tests for NotificationService channel dispatch and critical notification workflows.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

const emitNotificationMock = jest.fn();
const sendNotificationEmailMock = jest.fn();
const sendNotificationMessageMock = jest.fn();
const sendPushNotificationMock = jest.fn();

jest.mock('../../../infrastructure/database/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock('../../../websocket-server', () => ({
  emitNotification: (...args: unknown[]) => emitNotificationMock(...args),
}));

jest.mock('../../../infrastructure/email/email.service', () => ({
  EmailService: class {
    public sendNotificationEmail = sendNotificationEmailMock;
  },
}));

jest.mock('../../../infrastructure/telegram/telegram.service', () => ({
  TelegramService: class {
    public sendNotificationMessage = sendNotificationMessageMock;
  },
}));

jest.mock('../../../infrastructure/push/web-push.service', () => ({
  WebPushService: class {
    public sendPushNotification = sendPushNotificationMock;
  },
}));

import {AppDataSource} from '../../../infrastructure/database/data-source';
import {NotificationService} from '../notification.service';
import {NotificationChannel} from '../../../domain/enumerations/notification-channel';
import {NotificationType} from '../../../domain/enumerations/notification-type';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepository: {
    create: jest.Mock;
    save: jest.Mock;
  };
  let preferencesRepository: {
    findOne: jest.Mock;
  };
  let userRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
  };
  let pushSubscriptionRepository: {
    find: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    notificationRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    preferencesRepository = {
      findOne: jest.fn(),
    };
    userRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
    };
    pushSubscriptionRepository = {
      find: jest.fn(),
      remove: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      switch (entity?.name) {
        case 'Notification':
          return notificationRepository;
        case 'NotificationPreferences':
          return preferencesRepository;
        case 'User':
          return userRepository;
        case 'PushSubscription':
          return pushSubscriptionRepository;
        default:
          throw new Error(`Unexpected repository request for ${String(entity?.name ?? entity)}`);
      }
    });

    notificationRepository.create.mockImplementation((data) => ({
      id: 'notif-1',
      createdAt: new Date('2026-04-17T10:00:00.000Z'),
      ...data,
    }));
    notificationRepository.save.mockImplementation(async (notification) => notification);

    service = new NotificationService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates and emits an in-app notification when preferences allow it', async () => {
    preferencesRepository.findOne.mockResolvedValue(null);

    const result = await service.createNotification(
      'user-1',
      NotificationType.MATCH_SCHEDULED,
      'Title',
      'Body',
      {matchId: 'match-1'},
    );

    expect(notificationRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user-1',
      channels: [NotificationChannel.IN_APP],
      type: NotificationType.MATCH_SCHEDULED,
    }));
    expect(emitNotificationMock).toHaveBeenCalledWith('user-1', expect.objectContaining({
      id: result?.id,
      type: NotificationType.MATCH_SCHEDULED,
    }));
    expect(result).toEqual(expect.objectContaining({
      id: expect.any(String),
      type: NotificationType.MATCH_SCHEDULED,
    }));
  });

  it('returns null when the notification type is disabled by user preferences', async () => {
    preferencesRepository.findOne.mockResolvedValue({
      isTypeEnabled: jest.fn().mockReturnValue(false),
      isChannelEnabled: jest.fn(),
    });

    const result = await service.createNotification(
      'user-2',
      NotificationType.ANNOUNCEMENT,
      'Blocked',
      'Should not be created',
    );

    expect(result).toBeNull();
    expect(notificationRepository.create).not.toHaveBeenCalled();
    expect(sendNotificationEmailMock).not.toHaveBeenCalled();
  });

  it('delivers enabled external channels even when in-app notifications are disabled', async () => {
    preferencesRepository.findOne.mockResolvedValue({
      isTypeEnabled: jest.fn().mockReturnValue(true),
      isChannelEnabled: jest.fn((channel: NotificationChannel) => channel === NotificationChannel.EMAIL),
    });
    userRepository.findOne.mockResolvedValue({
      email: 'player@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    const result = await service.createNotification(
      'user-3',
      NotificationType.RESULT_ENTERED,
      'Email Only',
      'External delivery',
    );

    expect(result).toBeNull();
    expect(notificationRepository.create).not.toHaveBeenCalled();
    expect(sendNotificationEmailMock).toHaveBeenCalledWith(
      'player@example.com',
      'Ada Lovelace',
      NotificationType.RESULT_ENTERED,
      'Email Only',
      'External delivery',
      undefined,
    );
  });

  it('removes expired push subscriptions while continuing delivery to remaining devices', async () => {
    preferencesRepository.findOne.mockResolvedValue({
      isTypeEnabled: jest.fn().mockReturnValue(true),
      isChannelEnabled: jest.fn((channel: NotificationChannel) =>
        channel === NotificationChannel.IN_APP || channel === NotificationChannel.WEB_PUSH,
      ),
    });
    pushSubscriptionRepository.find.mockResolvedValue([
      {
        id: 'sub-expired',
        endpoint: 'https://push.example.com/expired',
        p256dhKey: 'key-1',
        authKey: 'auth-1',
      },
      {
        id: 'sub-valid',
        endpoint: 'https://push.example.com/valid',
        p256dhKey: 'key-2',
        authKey: 'auth-2',
      },
    ]);
    sendPushNotificationMock
      .mockRejectedValueOnce(new Error('subscription expired'))
      .mockResolvedValueOnce(undefined);

    await service.createNotification(
      'user-4',
      NotificationType.MATCH_RESUMED,
      'Push Test',
      'Resumed',
      {matchId: 'match-2'},
    );

    expect(sendPushNotificationMock).toHaveBeenCalledTimes(2);
    expect(pushSubscriptionRepository.remove).toHaveBeenCalledWith(expect.objectContaining({id: 'sub-expired'}));
  });

  it('formats scheduled-match notifications through the shared createNotification path', async () => {
    const createNotificationSpy = jest.spyOn(service, 'createNotification').mockResolvedValue(null);
    const scheduledTime = new Date('2026-05-01T15:30:00.000Z');

    await service.notifyMatchScheduled(
      'match-10',
      'user-5',
      'Rival Player',
      scheduledTime,
      'Court 3',
      'tournament-10',
      'Spring Open',
    );

    expect(createNotificationSpy).toHaveBeenCalledWith(
      'user-5',
      NotificationType.MATCH_SCHEDULED,
      '📅 Match Scheduled',
      expect.stringContaining('Court 3'),
      expect.objectContaining({
        matchId: 'match-10',
        scheduledTime: scheduledTime.toISOString(),
        tournamentId: 'tournament-10',
        tournamentName: 'Spring Open',
      }),
    );
  });

  it('fans out disputed-result notifications to every administrator', async () => {
    const createNotificationSpy = jest.spyOn(service, 'createNotification').mockResolvedValue(null);

    await service.notifyResultDisputed('match-11', ['admin-10', 'admin-11'], 'Player One', 'Wrong score');

    expect(createNotificationSpy).toHaveBeenCalledTimes(2);
    expect(createNotificationSpy).toHaveBeenNthCalledWith(
      1,
      'admin-10',
      NotificationType.RESULT_ENTERED,
      '⚠️ Match Result Disputed',
      expect.stringContaining('Wrong score'),
      {matchId: 'match-11', disputeReason: 'Wrong score'},
    );
  });

  it('uses the shared notification path for result entry and confirmation flows', async () => {
    const createNotificationSpy = jest.spyOn(service, 'createNotification').mockResolvedValue(null);

    await service.notifyResultEntered('match-18', 'player-18', 'Submitter Name');
    await service.notifyResultConfirmed('match-18', 'player-19', 'Confirmer Name');

    expect(createNotificationSpy).toHaveBeenNthCalledWith(
      1,
      'player-18',
      NotificationType.RESULT_ENTERED,
      '🎾 Match Result Pending Confirmation',
      expect.stringContaining('Submitter Name'),
      {matchId: 'match-18'},
    );
    expect(createNotificationSpy).toHaveBeenNthCalledWith(
      2,
      'player-19',
      NotificationType.RESULT_ENTERED,
      '✅ Match Result Confirmed',
      expect.stringContaining('Confirmer Name'),
      {matchId: 'match-18'},
    );
  });

  it.each([
    ['DIRECT_ACCEPTANCE', 'Your registration has been accepted!'],
    ['WILD_CARD', 'You have been granted a Wild Card entry!'],
    ['ALTERNATE', 'You have been accepted as an Alternate.'],
    ['LUCKY_LOSER', 'Your registration has been accepted!'],
  ])('formats registration confirmation messages for %s', async (acceptanceType, expectedMessage) => {
    const createNotificationSpy = jest.spyOn(service, 'createNotification').mockResolvedValue(null);

    await service.notifyRegistrationConfirmed('player-7', 'Autumn Open', 'tournament-7', acceptanceType);

    expect(createNotificationSpy).toHaveBeenCalledWith(
      'player-7',
      NotificationType.REGISTRATION_CONFIRMED,
      '✅ Registration Accepted',
      `${expectedMessage} Autumn Open`,
      {tournamentId: 'tournament-7', acceptanceType},
    );
  });

  it('notifies every participant when order of play is published', async () => {
    const createNotificationSpy = jest.spyOn(service, 'createNotification').mockResolvedValue(null);
    const publishDate = new Date('2026-05-02T00:00:00.000Z');

    await service.notifyOrderOfPlayPublished('tournament-8', ['player-8', 'player-9'], publishDate);

    expect(createNotificationSpy).toHaveBeenCalledTimes(2);
    expect(createNotificationSpy).toHaveBeenCalledWith(
      'player-8',
      NotificationType.ORDER_OF_PLAY_PUBLISHED,
      '📅 Order of Play Published',
      expect.stringContaining('May'),
      {tournamentId: 'tournament-8', date: publishDate.toISOString()},
    );
  });

  it('publishes announcement notifications to all listed participants', async () => {
    const createNotificationSpy = jest.spyOn(service, 'createNotification').mockResolvedValue(null);

    await service.notifyAnnouncementPublished('tournament-9', ['player-20', 'player-21'], 'Rain Delay', 'announcement-9');

    expect(createNotificationSpy).toHaveBeenCalledTimes(2);
    expect(createNotificationSpy).toHaveBeenCalledWith(
      'player-20',
      NotificationType.ANNOUNCEMENT,
      '📢 New Announcement',
      'New announcement: Rain Delay',
      {tournamentId: 'tournament-9', announcementId: 'announcement-9'},
    );
  });

  it('notifies both participants when a match is suspended', async () => {
    const createNotificationSpy = jest.spyOn(service, 'createNotification').mockResolvedValue(null);

    await service.notifyMatchSuspended('match-19', 'player-22', 'player-23', 'Rain');

    expect(createNotificationSpy).toHaveBeenCalledTimes(2);
    expect(createNotificationSpy).toHaveBeenCalledWith(
      'player-22',
      NotificationType.MATCH_SUSPENDED,
      '⏸ Match Suspended',
      'Your match has been suspended. Reason: Rain',
      {matchId: 'match-19', reason: 'Rain'},
    );
  });

  it('uses the correct resume message with and without a scheduled time', async () => {
    const createNotificationSpy = jest.spyOn(service, 'createNotification').mockResolvedValue(null);

    await service.notifyMatchResumed('match-12', 'player-10', null, new Date('2026-05-03T09:15:00.000Z'));
    await service.notifyMatchResumed('match-13', 'player-11', null);

    expect(createNotificationSpy).toHaveBeenNthCalledWith(
      1,
      'player-10',
      NotificationType.MATCH_RESUMED,
      '▶️ Match Resumed',
      expect.stringContaining('rescheduled'),
      expect.objectContaining({matchId: 'match-12', scheduledTime: expect.any(String)}),
    );
    expect(createNotificationSpy).toHaveBeenNthCalledWith(
      2,
      'player-11',
      NotificationType.MATCH_RESUMED,
      '▶️ Match Resumed',
      'Your suspended match has been resumed. Please check the schedule.',
      {matchId: 'match-13', scheduledTime: undefined},
    );
  });

  it('includes optional dispute-resolution notes only when provided', async () => {
    const createNotificationSpy = jest.spyOn(service, 'createNotification').mockResolvedValue(null);

    await service.notifyDisputeResolved('match-14', 'player-12', null, 'Player Winner', 'Verified scorecard');
    await service.notifyDisputeResolved('match-15', 'player-13', null, 'Player Winner');

    expect(createNotificationSpy).toHaveBeenNthCalledWith(
      1,
      'player-12',
      NotificationType.DISPUTE_RESOLVED,
      '⚖️ Dispute Resolved',
      expect.stringContaining('Notes: Verified scorecard'),
      {matchId: 'match-14', winnerName: 'Player Winner'},
    );
    expect(createNotificationSpy).toHaveBeenNthCalledWith(
      2,
      'player-13',
      NotificationType.DISPUTE_RESOLVED,
      '⚖️ Dispute Resolved',
      'Your match dispute has been resolved by an admin. Winner: Player Winner.',
      {matchId: 'match-15', winnerName: 'Player Winner'},
    );
  });

  it('formats match-default notifications for walkovers and defaults', async () => {
    const createNotificationSpy = jest.spyOn(service, 'createNotification').mockResolvedValue(null);

    await service.notifyMatchDefault('match-16', 'player-14', 'WALKOVER');
    await service.notifyMatchDefault('match-17', 'player-15', 'DEFAULT', 'Medical withdrawal');

    expect(createNotificationSpy).toHaveBeenNthCalledWith(
      1,
      'player-14',
      NotificationType.MATCH_DEFAULT,
      '🎾 Match Ended: Walkover (WO)',
      'A match has ended by Walkover (WO). Please check your match schedule.',
      {matchId: 'match-16', matchStatus: 'WALKOVER', reason: undefined},
    );
    expect(createNotificationSpy).toHaveBeenNthCalledWith(
      2,
      'player-15',
      NotificationType.MATCH_DEFAULT,
      '🎾 Match Ended: Default (DEF)',
      'A match has ended by Default (DEF). Reason: Medical withdrawal',
      {matchId: 'match-17', matchStatus: 'DEFAULT', reason: 'Medical withdrawal'},
    );
  });

  it('notifies all admins about pending doubles registrations', async () => {
    const createNotificationSpy = jest.spyOn(service, 'createNotification').mockResolvedValue(null);
    userRepository.find.mockResolvedValue([{id: 'admin-20'}, {id: 'admin-21'}]);

    await service.notifyAdminPendingRegistration('tournament-20', 'registration-20');

    expect(userRepository.find).toHaveBeenCalledWith({
      where: [{role: 'SYSTEM_ADMIN'}, {role: 'TOURNAMENT_ADMIN'}],
    });
    expect(createNotificationSpy).toHaveBeenCalledTimes(2);
    expect(createNotificationSpy).toHaveBeenCalledWith(
      'admin-20',
      NotificationType.REGISTRATION_CONFIRMED,
      '📋 New Registration for Approval',
      'A new doubles pair registration is pending your approval.',
      {tournamentId: 'tournament-20', registrationId: 'registration-20'},
    );
  });

  it('covers partner invitation lifecycle wrappers', async () => {
    const createNotificationSpy = jest.spyOn(service, 'createNotification').mockResolvedValue(null);

    await service.notifyPartnerInvitation('invitee-1', 'inviter-1', 'Open Doubles', 'Senior', 'inv-1', 'tournament-21');
    await service.notifyPartnerInvitationAccepted('inviter-1', 'invitee-1', 'Open Doubles', 'Senior', 'tournament-21');
    await service.notifyPartnerInvitationDeclined('inviter-1', 'invitee-1', 'Open Doubles', 'Senior', 'tournament-21');
    await service.notifyPartnerMutualWithdrawal('partner-1', 'withdrawer-1', 'Open Doubles');

    expect(createNotificationSpy).toHaveBeenCalledWith(
      'invitee-1',
      NotificationType.REGISTRATION_CONFIRMED,
      '✉️ Partner Invitation Received',
      expect.stringContaining('Open Doubles'),
      expect.objectContaining({invitationId: 'inv-1', inviterId: 'inviter-1'}),
    );
    expect(createNotificationSpy).toHaveBeenCalledWith(
      'partner-1',
      NotificationType.REGISTRATION_CONFIRMED,
      '🤝 Partner Withdrawal - Mutual Withdrawal',
      expect.stringContaining('automatically withdrawn'),
      {withdrawingParticipantId: 'withdrawer-1', tournamentName: 'Open Doubles'},
    );
  });

  it('retrieves system and tournament administrator IDs for admin notifications', async () => {
    userRepository.find.mockResolvedValue([{id: 'admin-1'}, {id: 'admin-2'}]);

    const adminIds = await service.getAdminUserIds();

    expect(userRepository.find).toHaveBeenCalledWith({
      where: [
        {role: 'SYSTEM_ADMIN'},
        {role: 'TOURNAMENT_ADMIN'},
      ],
      select: ['id'],
    });
    expect(adminIds).toEqual(['admin-1', 'admin-2']);
  });
});