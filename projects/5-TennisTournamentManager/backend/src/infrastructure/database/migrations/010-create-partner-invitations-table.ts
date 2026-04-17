/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 12, 2026
 * @file backend/src/infrastructure/database/migrations/010-create-partner-invitations-table.ts
 * @desc Database migration to create partner_invitations table for doubles registration workflow
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {MigrationInterface, QueryRunner, Table, TableForeignKey} from 'typeorm';

/**
 * Migration to create partner_invitations table for doubles tournament registration workflow.
 * 
 * Workflow:
 * 1. Player A selects Player B as partner and clicks "Register"
 * 2. System creates partner invitation record (PENDING status)
 * 3. Player B receives notification and can accept/decline
 * 4. If accepted: Both players get registrations created (PENDING admin approval)
 * 5. Admin approves/rejects the pair
 * 
 * Business Rules:
 * - Players can only have one active doubles registration per tournament
 * - If one partner withdraws, both are automatically withdrawn
 * - No invitation expiry (remains PENDING until action taken)
 */
export class CreatePartnerInvitationsTable1712966400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create partner_invitations table
    await queryRunner.createTable(
      new Table({
        name: 'partner_invitations',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '50',
            isPrimary: true,
            comment: 'Unique invitation identifier (e.g., "inv_abc123")',
          },
          {
            name: 'tournamentId',
            type: 'varchar',
            length: '50',
            comment: 'Tournament for which the invitation is sent',
          },
          {
            name: 'categoryId',
            type: 'varchar',
            length: '50',
            comment: 'Category within the tournament',
          },
          {
            name: 'inviterId',
            type: 'varchar',
            length: '50',
            comment: 'User ID of the player who sent the invitation (Player A)',
          },
          {
            name: 'inviteeId',
            type: 'varchar',
            length: '50',
            comment: 'User ID of the player being invited (Player B)',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED'],
            default: "'PENDING'",
            comment: 'Invitation status: PENDING (waiting for response), ACCEPTED (partner confirmed), DECLINED (partner rejected), CANCELLED (inviter withdrew)',
          },
          {
            name: 'message',
            type: 'text',
            isNullable: true,
            comment: 'Optional message from inviter to invitee',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: 'When the invitation was sent',
          },
          {
            name: 'respondedAt',
            type: 'timestamp',
            isNullable: true,
            comment: 'When the invitee accepted or declined',
          },
          {
            name: 'inviterRegistrationId',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Registration ID created for inviter after acceptance',
          },
          {
            name: 'inviteeRegistrationId',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Registration ID created for invitee after acceptance',
          },
        ],
        indices: [
          {
            name: 'IDX_PARTNER_INVITATION_TOURNAMENT',
            columnNames: ['tournamentId'],
          },
          {
            name: 'IDX_PARTNER_INVITATION_CATEGORY',
            columnNames: ['categoryId'],
          },
          {
            name: 'IDX_PARTNER_INVITATION_INVITER',
            columnNames: ['inviterId'],
          },
          {
            name: 'IDX_PARTNER_INVITATION_INVITEE',
            columnNames: ['inviteeId'],
          },
          {
            name: 'IDX_PARTNER_INVITATION_STATUS',
            columnNames: ['status'],
          },
          {
            name: 'IDX_PARTNER_INVITATION_COMPOSITE',
            columnNames: ['tournamentId', 'inviterId', 'status'],
          },
        ],
      }),
      true
    );

    // Add foreign key to tournaments table
    await queryRunner.createForeignKey(
      'partner_invitations',
      new TableForeignKey({
        name: 'FK_PARTNER_INVITATION_TOURNAMENT',
        columnNames: ['tournamentId'],
        referencedTableName: 'tournaments',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // Add foreign key to categories table
    await queryRunner.createForeignKey(
      'partner_invitations',
      new TableForeignKey({
        name: 'FK_PARTNER_INVITATION_CATEGORY',
        columnNames: ['categoryId'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // Add foreign key to users table for inviter
    await queryRunner.createForeignKey(
      'partner_invitations',
      new TableForeignKey({
        name: 'FK_PARTNER_INVITATION_INVITER',
        columnNames: ['inviterId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // Add foreign key to users table for invitee
    await queryRunner.createForeignKey(
      'partner_invitations',
      new TableForeignKey({
        name: 'FK_PARTNER_INVITATION_INVITEE',
        columnNames: ['inviteeId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // Add foreign key to registrations table for inviter registration
    await queryRunner.createForeignKey(
      'partner_invitations',
      new TableForeignKey({
        name: 'FK_PARTNER_INVITATION_INVITER_REG',
        columnNames: ['inviterRegistrationId'],
        referencedTableName: 'registrations',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      })
    );

    // Add foreign key to registrations table for invitee registration
    await queryRunner.createForeignKey(
      'partner_invitations',
      new TableForeignKey({
        name: 'FK_PARTNER_INVITATION_INVITEE_REG',
        columnNames: ['inviteeRegistrationId'],
        referencedTableName: 'registrations',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      })
    );

    console.log('✅ Migration 010: partner_invitations table created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.dropForeignKey('partner_invitations', 'FK_PARTNER_INVITATION_INVITEE_REG');
    await queryRunner.dropForeignKey('partner_invitations', 'FK_PARTNER_INVITATION_INVITER_REG');
    await queryRunner.dropForeignKey('partner_invitations', 'FK_PARTNER_INVITATION_INVITEE');
    await queryRunner.dropForeignKey('partner_invitations', 'FK_PARTNER_INVITATION_INVITER');
    await queryRunner.dropForeignKey('partner_invitations', 'FK_PARTNER_INVITATION_CATEGORY');
    await queryRunner.dropForeignKey('partner_invitations', 'FK_PARTNER_INVITATION_TOURNAMENT');

    // Drop table
    await queryRunner.dropTable('partner_invitations');

    console.log('✅ Migration 010: partner_invitations table dropped successfully');
  }
}
