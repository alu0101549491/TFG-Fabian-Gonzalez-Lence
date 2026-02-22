/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/presentation/controllers/message.controller.ts
 * @desc Message controller
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import type {Request, Response, NextFunction} from 'express';
import {MessageRepository} from '@infrastructure/repositories/message.repository.js';
import {sendSuccess} from '@shared/utils.js';
import {HTTP_STATUS} from '@shared/constants.js';
import {emitToProject} from '@infrastructure/websocket/index.js';

export class MessageController {
  private readonly messageRepository: MessageRepository;

  public constructor() {
    this.messageRepository = new MessageRepository();
  }

  public async getByProjectId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const messages = await this.messageRepository.findByProjectId(req.params.projectId as string);
      sendSuccess(res, messages);
    } catch (error) {
      next(error);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await this.messageRepository.create(req.body);
      
      // Emit WebSocket event
      emitToProject(message.projectId, 'message:received', message);
      
      sendSuccess(res, message, 'Message sent successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  public async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = req.params.projectId as string;
      const {userId} = req.query;
      if (!userId) throw new Error('userId query parameter is required');
      const count = await this.messageRepository.countUnreadByProjectAndUser(projectId, userId as string);
      sendSuccess(res, {count});
    } catch (error) {
      next(error);
    }
  }
}
