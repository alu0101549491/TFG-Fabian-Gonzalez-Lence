/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/infrastructure/repositories/message.repository.ts
 * @desc Message repository implementation using Prisma
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Message} from '@prisma/client';
import type {IMessageRepository} from '@domain/repositories/message.repository.interface.js';
import {prisma} from '../database/prisma.client.js';
import {DatabaseError} from '@shared/errors.js';

export class MessageRepository implements IMessageRepository {
  public async findById(id: string): Promise<Message | null> {
    try {
      return await prisma.message.findUnique({
        where: {id},
        include: {project: true, sender: true},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find message by ID');
    }
  }

  public async findByProjectId(projectId: string): Promise<Message[]> {
    try {
      return await prisma.message.findMany({
        where: {projectId},
        include: {sender: true},
        orderBy: {sentAt: 'asc'},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find messages by project ID');
    }
  }

  public async findBySenderId(senderId: string): Promise<Message[]> {
    try {
      return await prisma.message.findMany({
        where: {senderId},
        include: {project: true},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find messages by sender ID');
    }
  }

  public async create(data: Omit<Message, 'id' | 'sentAt'>): Promise<Message> {
    try {
      return await prisma.message.create({data});
    } catch (error) {
      throw new DatabaseError('Failed to create message');
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await prisma.message.delete({where: {id}});
    } catch (error) {
      throw new DatabaseError('Failed to delete message');
    }
  }
}
