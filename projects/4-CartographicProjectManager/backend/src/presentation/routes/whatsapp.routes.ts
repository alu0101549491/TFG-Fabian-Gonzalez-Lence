/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 15, 2026
 * @file backend/src/presentation/routes/whatsapp.routes.ts
 * @desc WhatsApp sandbox routes (optional/GAP feature) used for E2E verification.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Router} from 'express';
import {authenticate} from '@infrastructure/auth/auth.middleware.js';
import {WhatsAppController} from '../controllers/whatsapp.controller.js';

export const whatsappRoutes = Router();
const controller = new WhatsAppController();

whatsappRoutes.use(authenticate);

// Sandbox endpoints (in-memory) for testing WhatsApp integration.
whatsappRoutes.post('/sandbox/send', controller.sendSandbox.bind(controller));
whatsappRoutes.get('/sandbox/outbox', controller.listSandboxOutbox.bind(controller));
whatsappRoutes.delete('/sandbox/outbox', controller.clearSandboxOutbox.bind(controller));
