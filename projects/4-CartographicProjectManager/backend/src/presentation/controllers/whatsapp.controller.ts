/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 15, 2026
 * @file backend/src/presentation/controllers/whatsapp.controller.ts
 * @desc WhatsApp sandbox controller for optional notification integrations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Request, Response, NextFunction} from 'express';
import type {AuthenticatedRequest} from '@shared/types.js';
import {HTTP_STATUS} from '@shared/constants.js';
import {sendError, sendSuccess} from '@shared/utils.js';
import {enqueueSandboxMessage, listSandboxMessages, clearSandboxMessages} from '@infrastructure/whatsapp/whatsapp.sandbox.js';

type SendSandboxBody = {
  toUserId?: string;
  text?: string;
  meta?: Record<string, unknown> | null;
};

export class WhatsAppController {
  public async sendSandbox(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;

      if (!currentUser) {
        sendError(res, 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      const body = req.body as SendSandboxBody;
      const toUserId = typeof body.toUserId === 'string' ? body.toUserId.trim() : '';
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      const meta = body.meta && typeof body.meta === 'object' ? body.meta : null;

      if (!toUserId || !text) {
        sendError(res, 'toUserId and text are required', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      const isAdmin = currentUser.role === 'ADMINISTRATOR';
      if (!isAdmin && currentUser.id !== toUserId) {
        sendError(res, 'You can only send sandbox WhatsApp messages to yourself', HTTP_STATUS.FORBIDDEN);
        return;
      }

      const message = enqueueSandboxMessage({toUserId, text, meta});
      sendSuccess(res, message, 'Sandbox WhatsApp message queued', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  public async listSandboxOutbox(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;

      if (!currentUser) {
        sendError(res, 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      const requestedToUserId = typeof req.query.toUserId === 'string'
        ? req.query.toUserId.trim()
        : '';

      const isAdmin = currentUser.role === 'ADMINISTRATOR';
      const effectiveToUserId = requestedToUserId || currentUser.id;

      if (!isAdmin && effectiveToUserId !== currentUser.id) {
        sendError(res, 'You can only view your own sandbox outbox', HTTP_STATUS.FORBIDDEN);
        return;
      }

      const messages = listSandboxMessages({toUserId: effectiveToUserId});
      sendSuccess(res, messages);
    } catch (error) {
      next(error);
    }
  }

  public async clearSandboxOutbox(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;

      if (!currentUser) {
        sendError(res, 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      const requestedToUserId = typeof req.query.toUserId === 'string'
        ? req.query.toUserId.trim()
        : '';

      const isAdmin = currentUser.role === 'ADMINISTRATOR';
      const effectiveToUserId = requestedToUserId || currentUser.id;

      if (!isAdmin && effectiveToUserId !== currentUser.id) {
        sendError(res, 'You can only clear your own sandbox outbox', HTTP_STATUS.FORBIDDEN);
        return;
      }

      const cleared = clearSandboxMessages({toUserId: effectiveToUserId});
      sendSuccess(res, {cleared});
    } catch (error) {
      next(error);
    }
  }
}
