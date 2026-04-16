/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file tests/domain/entities/match-result.test.ts
 * @desc Unit tests for the MatchResult entity.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {MatchResult} from '@domain/entities/match-result';
import {ConfirmationStatus} from '@domain/enumerations/confirmation-status';

describe('MatchResult', () => {
  describe('constructor', () => {
    it('should create a MatchResult with default values', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'user1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7
      });

      expect(result.id).toBe('result1');
      expect(result.confirmationStatus).toBe(ConfirmationStatus.PENDING_CONFIRMATION);
      expect(result.isAdminEntry).toBe(false);
      expect(result.confirmedBy).toBeNull();
    });

    it('should create a MatchResult with custom confirmation status', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'admin1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.CONFIRMED,
        isAdminEntry: true
      });

      expect(result.confirmationStatus).toBe(ConfirmationStatus.CONFIRMED);
      expect(result.isAdminEntry).toBe(true);
    });
  });

  describe('confirm', () => {
    it('should allow confirming a pending result', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'user1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.PENDING_CONFIRMATION
      });

      expect(() => result.confirm('user2')).not.toThrow();
    });

    it('should throw error when confirming already confirmed result', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'user1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.CONFIRMED
      });

      expect(() => result.confirm('user2')).toThrow(
        'Cannot confirm result in status CONFIRMED'
      );
    });

    it('should throw error when userId is empty', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'user1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.PENDING_CONFIRMATION
      });

      expect(() => result.confirm('')).toThrow('User ID is required');
    });
  });

  describe('dispute', () => {
    it('should allow disputing a pending result', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'user1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.PENDING_CONFIRMATION
      });

      expect(() => result.dispute('user2', 'Score is incorrect')).not.toThrow();
    });

    it('should throw error when disputing confirmed result', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'user1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.CONFIRMED
      });

      expect(() => result.dispute('user2', 'Score is incorrect')).toThrow(
        'Cannot dispute result in status CONFIRMED'
      );
    });

    it('should throw error when dispute reason is empty', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'user1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.PENDING_CONFIRMATION
      });

      expect(() => result.dispute('user2', '')).toThrow('Dispute reason is required');
    });
  });

  describe('validateAsAdmin', () => {
    it('should allow admin to validate any result', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'user1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.DISPUTED
      });

      expect(() => result.validateAsAdmin('admin1', 'Validated after review')).not.toThrow();
    });

    it('should throw error when admin ID is empty', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'user1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7
      });

      expect(() => result.validateAsAdmin('', 'Notes')).toThrow('Administrator ID is required');
    });
  });

  describe('annul', () => {
    it('should allow annulling a result', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'user1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.CONFIRMED
      });

      expect(() => result.annul('admin1', 'Match cancelled due to weather')).not.toThrow();
    });

    it('should throw error when annulling already annulled result', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'user1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.ANNULLED
      });

      expect(() => result.annul('admin1', 'Reason')).toThrow('Result is already annulled');
    });

    it('should throw error when reason is empty', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'user1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7
      });

      expect(() => result.annul('admin1', '')).toThrow('Annulment reason is required');
    });
  });

  describe('canBeConfirmedBy', () => {
    it('should return true for opponent of pending result', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'player1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.PENDING_CONFIRMATION
      });

      const match = {player1Id: 'player1', player2Id: 'player2'};
      expect(result.canBeConfirmedBy('player2', match)).toBe(true);
    });

    it('should return false for submitter', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'player1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.PENDING_CONFIRMATION
      });

      const match = {player1Id: 'player1', player2Id: 'player2'};
      expect(result.canBeConfirmedBy('player1', match)).toBe(false);
    });

    it('should return false for confirmed result', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'player1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.CONFIRMED
      });

      const match = {player1Id: 'player1', player2Id: 'player2'};
      expect(result.canBeConfirmedBy('player2', match)).toBe(false);
    });

    it('should return false for non-participant', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'player1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.PENDING_CONFIRMATION
      });

      const match = {player1Id: 'player1', player2Id: 'player2'};
      expect(result.canBeConfirmedBy('player3', match)).toBe(false);
    });
  });

  describe('canBeDisputedBy', () => {
    it('should return true for opponent of pending result', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'player1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.PENDING_CONFIRMATION
      });

      const match = {player1Id: 'player1', player2Id: 'player2'};
      expect(result.canBeDisputedBy('player2', match)).toBe(true);
    });

    it('should return false for submitter', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'player1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.PENDING_CONFIRMATION
      });

      const match = {player1Id: 'player1', player2Id: 'player2'};
      expect(result.canBeDisputedBy('player1', match)).toBe(false);
    });

    it('should return false for confirmed result', () => {
      const result = new MatchResult({
        id: 'result1',
        matchId: 'match1',
        submittedBy: 'player1',
        winnerId: 'player1',
        setScores: ['6-4', '6-3'],
        player1Games: 12,
        player2Games: 7,
        confirmationStatus: ConfirmationStatus.CONFIRMED
      });

      const match = {player1Id: 'player1', player2Id: 'player2'};
      expect(result.canBeDisputedBy('player2', match)).toBe(false);
    });
  });
});
