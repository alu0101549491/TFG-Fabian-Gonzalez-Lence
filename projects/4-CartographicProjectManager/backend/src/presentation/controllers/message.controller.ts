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
import type {AuthenticatedRequest} from '@shared/types.js';
import {MessageRepository} from '@infrastructure/repositories/message.repository.js';
import {PermissionRepository} from '@infrastructure/repositories/permission.repository.js';
import {ProjectRepository} from '@infrastructure/repositories/project.repository.js';
import {sendSuccess, sendError} from '@shared/utils.js';
import {HTTP_STATUS} from '@shared/constants.js';
import {emitToProject} from '@infrastructure/websocket/index.js';

export class MessageController {
  private readonly messageRepository: MessageRepository;
  private readonly projectRepository: ProjectRepository;
  private readonly permissionRepository: PermissionRepository;

  public constructor() {
    this.messageRepository = new MessageRepository();
    this.projectRepository = new ProjectRepository();
    this.permissionRepository = new PermissionRepository();
  }

  private async canViewProjectMessages(userId: string, userRole: string, projectId: string): Promise<boolean> {
    if (userRole === 'ADMINISTRATOR') {
      return true;
    }

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      return false;
    }

    if (userRole === 'CLIENT' && project.clientId === userId) {
      return true;
    }

    if (userRole === 'SPECIAL_USER' && project.creatorId === userId) {
      return true;
    }

    if (userRole === 'SPECIAL_USER') {
      const permission = await this.permissionRepository.findByUserAndProject(userId, projectId);
      return Boolean(permission && (permission.rights.includes('VIEW') || permission.rights.includes('SEND_MESSAGE')));
    }

    return false;
  }

  private async canSendProjectMessage(userId: string, userRole: string, projectId: string): Promise<boolean> {
    if (userRole === 'ADMINISTRATOR') {
      return true;
    }

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      return false;
    }

    if (userRole === 'CLIENT' && project.clientId === userId) {
      return true;
    }

    if (userRole === 'SPECIAL_USER' && project.creatorId === userId) {
      return true;
    }

    if (userRole === 'SPECIAL_USER') {
      const permission = await this.permissionRepository.findByUserAndProject(userId, projectId);
      return Boolean(permission && permission.rights.includes('SEND_MESSAGE'));
    }

    return false;
  }

  public async getByProjectId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;

      if (!currentUser) {
        return sendError(res, 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }

      const projectId = req.params.projectId as string;
      const canView = await this.canViewProjectMessages(currentUser.id, currentUser.role, projectId);
      if (!canView) {
        return sendError(res, 'You do not have permission to view messages for this project', HTTP_STATUS.FORBIDDEN);
      }

      const messages = await this.messageRepository.findByProjectId(projectId);
      sendSuccess(res, messages);
    } catch (error) {
      next(error);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;

      if (!currentUser) {
        return sendError(res, 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }

      const {projectId, content, fileIds} = req.body as {
        projectId?: unknown;
        content?: unknown;
        fileIds?: unknown;
        senderId?: unknown;
        readByUserIds?: unknown;
      };

      if (typeof projectId !== 'string' || projectId.length === 0) {
        return sendError(res, 'projectId is required', HTTP_STATUS.BAD_REQUEST);
      }

      if (typeof content !== 'string' || content.trim().length === 0) {
        return sendError(res, 'content is required', HTTP_STATUS.BAD_REQUEST);
      }

      const canSend = await this.canSendProjectMessage(currentUser.id, currentUser.role, projectId);
      if (!canSend) {
        return sendError(res, 'You do not have permission to send messages to this project', HTTP_STATUS.FORBIDDEN);
      }

      const sanitizedFileIds = Array.isArray(fileIds)
        ? (fileIds.filter((id): id is string => typeof id === 'string') as string[])
        : [];

      const message = await this.messageRepository.create({
        projectId,
        senderId: currentUser.id,
        content,
        readByUserIds: [],
        fileIds: sanitizedFileIds,
      });

      emitToProject(message.projectId, 'message:new', message);
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

  public async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = req.params.projectId as string;
      const {userId} = req.body;
      if (!userId) throw new Error('userId is required in request body');
      await this.messageRepository.markAllAsRead(projectId, userId);
      sendSuccess(res, null, 'Messages marked as read');
    } catch (error) {
      next(error);
    }
  }
}
