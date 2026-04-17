/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 6, 2026
 * @file backend/src/presentation/controllers/export.controller.ts
 * @desc Export controller for tournament data exports (FR61-FR63)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Request, Response} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Tournament} from '../../domain/entities/tournament.entity';
import {Match} from '../../domain/entities/match.entity';
import {Registration} from '../../domain/entities/registration.entity';
import {Bracket} from '../../domain/entities/bracket.entity';
import {ExportService} from '../../application/services/export.service';

/**
 * Export controller.
 * Handles HTTP requests for tournament data exports in various formats.
 */
export class ExportController {
  /**
   * Export service instance.
   */
  private readonly exportService: ExportService;

  /**
   * Creates a new instance of ExportController.
   */
  public constructor() {
    this.exportService = new ExportService(
      AppDataSource.getRepository(Tournament),
      AppDataSource.getRepository(Match),
      AppDataSource.getRepository(Registration),
      AppDataSource.getRepository(Bracket)
    );
  }

  /**
   * Exports tournament in ITF CSV format.
   * GET /api/export/tournament/:tournamentId/itf
   *
   * @param req - Express request
   * @param res - Express response
   */
  public async exportToITF(req: Request, res: Response): Promise<void> {
    try {
      const {tournamentId} = req.params;

      if (!tournamentId) {
        res.status(400).json({
          success: false,
          error: 'Tournament ID is required',
        });
        return;
      }

      const buffer = await this.exportService.exportToITF(tournamentId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ITF_Tournament_${tournamentId}.csv"`);
      res.send(buffer);
    } catch (error) {
      console.error('Error exporting to ITF:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export tournament in ITF format',
        details: (error as Error).message,
      });
    }
  }

  /**
   * Exports tournament in TODS JSON format.
   * GET /api/export/tournament/:tournamentId/tods
   *
   * @param req - Express request
   * @param res - Express response
   */
  public async exportToTODS(req: Request, res: Response): Promise<void> {
    try {
      const {tournamentId} = req.params;

      if (!tournamentId) {
        res.status(400).json({
          success: false,
          error: 'Tournament ID is required',
        });
        return;
      }

      const buffer = await this.exportService.exportToTODS(tournamentId);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="TODS_Tournament_${tournamentId}.json"`);
      res.send(buffer);
    } catch (error) {
      console.error('Error exporting to TODS:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export tournament in TODS format',
        details: (error as Error).message,
      });
    }
  }

  /**
   * Exports tournament results as PDF.
   * GET /api/export/tournament/:tournamentId/pdf
   *
   * @param req - Express request
   * @param res - Express response
   */
  public async exportResultsToPDF(req: Request, res: Response): Promise<void> {
    try {
      const {tournamentId} = req.params;

      if (!tournamentId) {
        res.status(400).json({
          success: false,
          error: 'Tournament ID is required',
        });
        return;
      }

      const buffer = await this.exportService.exportResultsToPDF(tournamentId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Tournament_Results_${tournamentId}.pdf"`);
      res.send(buffer);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export tournament results as PDF',
        details: (error as Error).message,
      });
    }
  }

  /**
   * Exports tournament results as Excel spreadsheet.
   * GET /api/export/tournament/:tournamentId/excel
   *
   * @param req - Express request
   * @param res - Express response
   */
  public async exportResultsToExcel(req: Request, res: Response): Promise<void> {
    try {
      const {tournamentId} = req.params;

      if (!tournamentId) {
        res.status(400).json({
          success: false,
          error: 'Tournament ID is required',
        });
        return;
      }

      const buffer = await this.exportService.exportResultsToExcel(tournamentId);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="Tournament_Results_${tournamentId}.xlsx"`);
      res.send(buffer);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export tournament results as Excel',
        details: (error as Error).message,
      });
    }
  }

  /**
   * Exports bracket as PDF.
   * GET /api/export/bracket/:bracketId/pdf
   *
   * @param req - Express request
   * @param res - Express response
   */
  public async exportBracketToPDF(req: Request, res: Response): Promise<void> {
    try {
      const {bracketId} = req.params;

      if (!bracketId) {
        res.status(400).json({
          success: false,
          error: 'Bracket ID is required',
        });
        return;
      }

      const buffer = await this.exportService.exportBracketToPDF(bracketId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Bracket_${bracketId}.pdf"`);
      res.send(buffer);
    } catch (error) {
      console.error('Error exporting bracket to PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export bracket as PDF',
        details: (error as Error).message,
      });
    }
  }
}
