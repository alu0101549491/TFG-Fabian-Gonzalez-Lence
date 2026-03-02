/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 2, 2026
 * @file backend/src/presentation/controllers/export.controller.ts
 * @desc Controller for data export endpoints
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ExportService, ExportFormat } from '../../application/services/export.service.js';

const prisma = new PrismaClient();

/**
 * Controller for handling export HTTP requests
 * Provides endpoints for administrators to export data
 */
export class ExportController {
  private exportService: ExportService;

  /**
   * Creates an instance of ExportController
   */
  public constructor() {
    this.exportService = new ExportService(prisma);
  }

  /**
   * Export projects in specified format
   * GET /api/v1/export/projects?format=csv&year=2026
   * @param req - HTTP request with format and filter query parameters
   * @param res - HTTP response
   */
  public async exportProjects(req: Request, res: Response): Promise<void> {
    try {
      const { format = 'csv', clientId, year, status } = req.query;

      const filters = {
        ...(clientId && typeof clientId === 'string' && { clientId }),
        ...(year && { year: parseInt(year as string, 10) }),
        ...(status && typeof status === 'string' && { status }),
      };

      const exportFormat = (format as string).toLowerCase() as ExportFormat;

      switch (exportFormat) {
        case 'csv': {
          const csv = await this.exportService.exportProjectsToCSV(filters);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="projects_${new Date().toISOString().split('T')[0]}.csv"`
          );
          res.status(200).send(csv);
          break;
        }

        case 'pdf': {
          const pdf = await this.exportService.exportProjectsToPDF(filters);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="projects_${new Date().toISOString().split('T')[0]}.pdf"`
          );
          res.status(200).send(pdf);
          break;
        }

        case 'excel': {
          const excel = await this.exportService.exportProjectsToExcel(filters);
          res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          );
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="projects_${new Date().toISOString().split('T')[0]}.xlsx"`
          );
          res.status(200).send(excel);
          break;
        }

        default:
          res.status(400).json({
            success: false,
            error: 'Invalid export format. Supported formats: csv, pdf, excel',
          });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to export projects',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Export tasks in specified format
   * GET /api/v1/export/tasks?format=csv&projectId=xxx
   * @param req - HTTP request with format and filter query parameters
   * @param res - HTTP response
   */
  public async exportTasks(req: Request, res: Response): Promise<void> {
    try {
      const { format = 'csv', projectId, status, assigneeId } = req.query;

      const filters = {
        ...(projectId && typeof projectId === 'string' && { projectId }),
        ...(status && typeof status === 'string' && { status }),
        ...(assigneeId && typeof assigneeId === 'string' && { assigneeId }),
      };

      const exportFormat = (format as string).toLowerCase() as ExportFormat;

      switch (exportFormat) {
        case 'csv': {
          const csv = await this.exportService.exportTasksToCSV(filters);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="tasks_${new Date().toISOString().split('T')[0]}.csv"`
          );
          res.status(200).send(csv);
          break;
        }

        case 'pdf':
        case 'excel':
          res.status(501).json({
            success: false,
            error: 'PDF and Excel export for tasks not yet implemented. Use CSV format.',
          });
          break;

        default:
          res.status(400).json({
            success: false,
            error: 'Invalid export format. Supported formats: csv',
          });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to export tasks',
        message: (error as Error).message,
      });
    }
  }
}
