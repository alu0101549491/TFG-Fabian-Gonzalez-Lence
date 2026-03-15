/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/presentation/routes/index.ts
 * @desc Main router combining all API routes
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Router} from 'express';
import {authRoutes} from './auth.routes.js';
import {userRoutes} from './user.routes.js';
import {projectRoutes} from './project.routes.js';
import {taskRoutes} from './task.routes.js';
import {messageRoutes} from './message.routes.js';
import {notificationRoutes} from './notification.routes.js';
import {fileRoutes} from './file.routes.js';
import {whatsappRoutes} from './whatsapp.routes.js';
import auditLogRoutes from './audit-log.routes.js';
import exportRoutes from './export.routes.js';
import backupRoutes from './backup.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/files', fileRoutes);
apiRouter.use('/whatsapp', whatsappRoutes);
apiRouter.use('/audit-logs', auditLogRoutes);
apiRouter.use('/export', exportRoutes);
apiRouter.use('/backup', backupRoutes);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({success: true, message: 'API is healthy', timestamp: new Date()});
});
