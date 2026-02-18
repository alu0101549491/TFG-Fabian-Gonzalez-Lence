/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/presentation/controllers/file.controller.ts
 * @desc File controller
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import type {Request, Response, NextFunction} from 'express';
import {FileRepository} from '@infrastructure/repositories/file.repository.js';
import {sendSuccess} from '@shared/utils.js';
import {HTTP_STATUS} from '@shared/constants.js';

export class FileController {
  private readonly fileRepository: FileRepository;

  public constructor() {
    this.fileRepository = new FileRepository();
  }

  public async getByProjectId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = await this.fileRepository.findByProjectId(req.params.projectId);
      sendSuccess(res, files);
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = await this.fileRepository.findById(req.params.id);
      sendSuccess(res, file);
    } catch (error) {
      next(error);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = await this.fileRepository.create(req.body);
      sendSuccess(res, file, 'File uploaded successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.fileRepository.delete(req.params.id);
      sendSuccess(res, null, 'File deleted successfully', HTTP_STATUS.NO_CONTENT);
    } catch (error) {
      next(error);
    }
  }
}
