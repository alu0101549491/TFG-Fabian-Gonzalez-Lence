/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/infrastructure/auth/auth.middleware.ts
 * @desc Authentication middleware for Express routes
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Request, Response, NextFunction} from 'express';
import {UserRole} from '@prisma/client';
import {verifyAccessToken, extractTokenFromHeader} from './jwt.service.js';
import {BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError} from '@shared/errors.js';
import type {AuthenticatedRequest} from '@shared/types.js';
import {logDebug} from '@shared/logger.js';
import {prisma} from '@infrastructure/database/prisma.client.js';

type AuthUser = NonNullable<AuthenticatedRequest['user']>;

function getAuthenticatedUser(req: Request): AuthUser {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new UnauthorizedError('User not authenticated');
  }
  return user;
}

async function ensureProjectAccessOrThrow(projectId: string, userId: string): Promise<void> {
  const project = await prisma.project.findUnique({
    where: {id: projectId},
    select: {
      id: true,
      creatorId: true,
      clientId: true,
      specialUsers: {select: {userId: true}},
    },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  const isCreator = project.creatorId === userId;
  const isClient = project.clientId === userId;
  const isSpecialUser = project.specialUsers.some(su => su.userId === userId);

  if (!isCreator && !isClient && !isSpecialUser) {
    throw new ForbiddenError('Insufficient permissions');
  }
}

/**
 * Middleware to authenticate requests using JWT
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware function
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to authorize based on user role
 *
 * @param allowedRoles - Array of allowed roles
 * @returns Express middleware function
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = (req as AuthenticatedRequest).user;

      if (!user) {
        throw new UnauthorizedError('User not authenticated');
      }

      if (!allowedRoles.includes(user.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Optional authentication middleware (doesn't throw if no token)
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware function
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = verifyAccessToken(token);
      (req as AuthenticatedRequest).user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    }

    next();
  } catch (error) {
    logDebug('optionalAuth: invalid token provided; proceeding as anonymous', {
      path: req.path,
      method: req.method,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    next();
  }
}

/**
 * Middleware to authorize resource owner or administrator
 * Checks if the user is accessing their own resource (via :id param) or is an admin
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware function
 */
export function authorizeOwnerOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const resourceId = req.params.id;
    const isOwner = resourceId === user.id;
    const isAdmin = user.role === UserRole.ADMINISTRATOR;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to ensure the authenticated user is a member of a project (or admin).
 *
 * This is a coarse, route-level authorization check that complements controller-
 * level enforcement.
 *
 * @param paramName - Route param name that contains the project id
 */
export function authorizeProjectMemberOrAdmin(paramName: string): (req: Request, res: Response, next: NextFunction) => void {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = getAuthenticatedUser(req);
      if (user.role === UserRole.ADMINISTRATOR) return next();

      const projectId = req.params[paramName];
      if (typeof projectId !== 'string' || projectId.length === 0) {
        throw new BadRequestError('projectId is required');
      }

      await ensureProjectAccessOrThrow(projectId, user.id);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Same as authorizeProjectMemberOrAdmin, but reads the project id from req.body.
 * Useful for POST routes where the project id is not part of the URL.
 */
export function authorizeProjectMemberOrAdminFromBody(bodyKey: string): (req: Request, res: Response, next: NextFunction) => void {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = getAuthenticatedUser(req);
      if (user.role === UserRole.ADMINISTRATOR) return next();

      const projectId = (req.body as Record<string, unknown>)[bodyKey];
      if (typeof projectId !== 'string' || projectId.length === 0) {
        throw new BadRequestError('projectId is required');
      }

      await ensureProjectAccessOrThrow(projectId, user.id);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to ensure access to a task based on its project membership.
 */
export function authorizeTaskMemberOrAdmin(paramName: string): (req: Request, res: Response, next: NextFunction) => void {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = getAuthenticatedUser(req);
      if (user.role === UserRole.ADMINISTRATOR) return next();

      const taskId = req.params[paramName];
      if (typeof taskId !== 'string' || taskId.length === 0) {
        throw new BadRequestError('taskId is required');
      }

      const task = await prisma.task.findUnique({
        where: {id: taskId},
        select: {projectId: true},
      });

      if (!task) {
        throw new NotFoundError('Task not found');
      }

      await ensureProjectAccessOrThrow(task.projectId, user.id);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to ensure access to a file based on its project membership.
 */
export function authorizeFileMemberOrAdmin(paramName: string): (req: Request, res: Response, next: NextFunction) => void {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = getAuthenticatedUser(req);
      if (user.role === UserRole.ADMINISTRATOR) return next();

      const fileId = req.params[paramName];
      if (typeof fileId !== 'string' || fileId.length === 0) {
        throw new BadRequestError('fileId is required');
      }

      const file = await prisma.file.findUnique({
        where: {id: fileId},
        select: {projectId: true},
      });

      if (!file) {
        throw new NotFoundError('File not found');
      }

      await ensureProjectAccessOrThrow(file.projectId, user.id);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to ensure access to a notification by ownership (or admin).
 */
export function authorizeNotificationOwnerOrAdmin(paramName: string): (req: Request, res: Response, next: NextFunction) => void {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = getAuthenticatedUser(req);
      if (user.role === UserRole.ADMINISTRATOR) return next();

      const notificationId = req.params[paramName];
      if (typeof notificationId !== 'string' || notificationId.length === 0) {
        throw new BadRequestError('notificationId is required');
      }

      const notification = await prisma.notification.findUnique({
        where: {id: notificationId},
        select: {userId: true},
      });

      if (!notification) {
        throw new NotFoundError('Notification not found');
      }

      if (notification.userId !== user.id) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to ensure a userId route/query target refers to the authenticated
 * user (or the requester is an admin).
 */
export function authorizeUserIdParamOrQueryOrAdmin(paramName: string): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = getAuthenticatedUser(req);
      if (user.role === UserRole.ADMINISTRATOR) return next();

      const paramUserId = req.params[paramName];
      const queryUserId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
      const targetUserId = paramUserId || queryUserId;

      if (!targetUserId) {
        throw new BadRequestError('userId is required');
      }

      if (targetUserId !== user.id) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
