/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 2, 2026
 * @file backend/src/application/services/export.service.ts
 * @desc Service for exporting project and task data to various formats
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import { createObjectCsvWriter } from 'csv-writer';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';
import { Readable } from 'stream';

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'pdf' | 'excel';

/**
 * Service for exporting data to different formats
 */
export class ExportService {
  private prisma: PrismaClient;

  /**
   * Creates an instance of ExportService
   * @param prisma - Prisma client instance
   */
  public constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Export projects to CSV format
   * @param filters - Optional filters for projects
   * @returns CSV content as string
   */
  public async exportProjectsToCSV(filters?: {
    clientId?: string;
    year?: number;
    status?: string;
  }): Promise<string> {
    const projects = await this.prisma.project.findMany({
      where: {
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.year && { year: filters.year }),
        ...(filters?.status && { status: filters.status as any }),
      },
      include: {
        client: true,
        creator: true,
      },
      orderBy: { deliveryDate: 'desc' },
    });

    const csvData = projects.map((project) => ({
      code: project.code,
      name: project.name,
      year: project.year,
      type: project.type,
      client: project.client.username,
      status: project.status,
      coordinateX: project.coordinateX || '',
      coordinateY: project.coordinateY || '',
      contractDate: project.contractDate.toISOString().split('T')[0],
      deliveryDate: project.deliveryDate.toISOString().split('T')[0],
      createdAt: project.createdAt.toISOString().split('T')[0],
      creator: project.creator?.username || 'N/A',
    }));

    const header = [
      { id: 'code', title: 'Code' },
      { id: 'name', title: 'Name' },
      { id: 'year', title: 'Year' },
      { id: 'type', title: 'Type' },
      { id: 'client', title: 'Client' },
      { id: 'status', title: 'Status' },
      { id: 'coordinateX', title: 'Coordinate X' },
      { id: 'coordinateY', title: 'Coordinate Y' },
      { id: 'contractDate', title: 'Contract Date' },
      { id: 'deliveryDate', title: 'Delivery Date' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'creator', title: 'Creator' },
    ];

    // Convert to CSV manually since we need to return string
    const headerRow = header.map((h) => h.title).join(',');
    const dataRows = csvData
      .map((row) =>
        header
          .map((h) => {
            const value = row[h.id as keyof typeof row];
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    return `${headerRow}\n${dataRows}`;
  }

  /**
   * Export tasks to CSV format
   * @param filters - Optional filters for tasks
   * @returns CSV content as string
   */
  public async exportTasksToCSV(filters?: {
    projectId?: string;
    status?: string;
    assigneeId?: string;
  }): Promise<string> {
    const tasks = await this.prisma.task.findMany({
      where: {
        ...(filters?.projectId && { projectId: filters.projectId }),
        ...(filters?.status && { status: filters.status as any }),
        ...(filters?.assigneeId && { assigneeId: filters.assigneeId }),
      },
      include: {
        project: true,
        creator: true,
        assignee: true,
      },
      orderBy: { dueDate: 'desc' },
    });

    const csvData = tasks.map((task) => ({
      id: task.id,
      project: task.project.name,
      projectCode: task.project.code,
      description: task.description.replace(/[\r\n]+/g, ' '),
      status: task.status,
      priority: task.priority,
      creator: task.creator.username,
      assignee: task.assignee.username,
      dueDate: task.dueDate.toISOString().split('T')[0],
      createdAt: task.createdAt.toISOString().split('T')[0],
      completedAt: task.completedAt ? task.completedAt.toISOString().split('T')[0] : '',
      confirmedAt: task.confirmedAt ? task.confirmedAt.toISOString().split('T')[0] : '',
    }));

    const header = [
      { id: 'id', title: 'ID' },
      { id: 'project', title: 'Project' },
      { id: 'projectCode', title: 'Project Code' },
      { id: 'description', title: 'Description' },
      { id: 'status', title: 'Status' },
      { id: 'priority', title: 'Priority' },
      { id: 'creator', title: 'Creator' },
      { id: 'assignee', title: 'Assignee' },
      { id: 'dueDate', title: 'Due Date' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'completedAt', title: 'Completed At' },
      { id: 'confirmedAt', title: 'Confirmed At' },
    ];

    const headerRow = header.map((h) => h.title).join(',');
    const dataRows = csvData
      .map((row) =>
        header
          .map((h) => {
            const value = row[h.id as keyof typeof row];
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    return `${headerRow}\n${dataRows}`;
  }

  /**
   * Export projects to PDF format
   * @param filters - Optional filters for projects
   * @returns PDF document as Buffer
   */
  public async exportProjectsToPDF(filters?: {
    clientId?: string;
    year?: number;
    status?: string;
  }): Promise<Buffer> {
    const projects = await this.prisma.project.findMany({
      where: {
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.year && { year: filters.year }),
        ...(filters?.status && { status: filters.status as any }),
      },
      include: {
        client: true,
        creator: true,
        tasks: true,
      },
      orderBy: { deliveryDate: 'desc' },
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(20).text('Projects Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);

      // Projects
      projects.forEach((project, index) => {
        if (index > 0) {
          doc.addPage();
        }

        doc.fontSize(16).text(`${project.code} - ${project.name}`, { underline: true });
        doc.moveDown();

        doc.fontSize(12);
        doc.text(`Year: ${project.year}`);
        doc.text(`Type: ${project.type}`);
        doc.text(`Client: ${project.client.username}`);
        doc.text(`Status: ${project.status}`);
        doc.text(`Contract Date: ${project.contractDate.toLocaleDateString()}`);
        doc.text(`Delivery Date: ${project.deliveryDate.toLocaleDateString()}`);
        
        if (project.coordinateX != null && project.coordinateY != null) {
          doc.text(`Coordinates: ${project.coordinateX}, ${project.coordinateY}`);
        }
        
        doc.moveDown();
        doc.fontSize(14).text('Tasks Summary:', { underline: true });
        doc.fontSize(10);
        
        const taskCounts = {
          PENDING: project.tasks.filter((t) => t.status === 'PENDING').length,
          IN_PROGRESS: project.tasks.filter((t) => t.status === 'IN_PROGRESS').length,
          PARTIAL: project.tasks.filter((t) => t.status === 'PARTIAL').length,
          PERFORMED: project.tasks.filter((t) => t.status === 'PERFORMED').length,
          COMPLETED: project.tasks.filter((t) => t.status === 'COMPLETED').length,
        };

        doc.text(`Total Tasks: ${project.tasks.length}`);
        doc.text(`Pending: ${taskCounts.PENDING}`);
        doc.text(`In Progress: ${taskCounts.IN_PROGRESS}`);
        doc.text(`Partial: ${taskCounts.PARTIAL}`);
        doc.text(`Performed: ${taskCounts.PERFORMED}`);
        doc.text(`Completed: ${taskCounts.COMPLETED}`);
      });

      doc.end();
    });
  }

  /**
   * Export projects to Excel format
   * @param filters - Optional filters for projects
   * @returns Excel workbook as Buffer
   */
  public async exportProjectsToExcel(filters?: {
    clientId?: string;
    year?: number;
    status?: string;
  }): Promise<Buffer> {
    const projects = await this.prisma.project.findMany({
      where: {
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.year && { year: filters.year }),
        ...(filters?.status && { status: filters.status as any }),
      },
      include: {
        client: true,
        creator: true,
        tasks: true,
      },
      orderBy: { deliveryDate: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Cartographic Project Manager';
    workbook.created = new Date();

    // Projects sheet
    const projectSheet = workbook.addWorksheet('Projects');
    projectSheet.columns = [
      { header: 'Code', key: 'code', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Client', key: 'client', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Coordinate X', key: 'coordinateX', width: 15 },
      { header: 'Coordinate Y', key: 'coordinateY', width: 15 },
      { header: 'Contract Date', key: 'contractDate', width: 15 },
      { header: 'Delivery Date', key: 'deliveryDate', width: 15 },
      { header: 'Total Tasks', key: 'totalTasks', width: 12 },
      { header: 'Completed Tasks', key: 'completedTasks', width: 15 },
    ];

    projects.forEach((project) => {
      projectSheet.addRow({
        code: project.code,
        name: project.name,
        year: project.year,
        type: project.type,
        client: project.client.username,
        status: project.status,
        coordinateX: project.coordinateX || '',
        coordinateY: project.coordinateY || '',
        contractDate: project.contractDate.toISOString().split('T')[0],
        deliveryDate: project.deliveryDate.toISOString().split('T')[0],
        totalTasks: project.tasks.length,
        completedTasks: project.tasks.filter((t) => t.status === 'COMPLETED').length,
      });
    });

    // Style header row
    projectSheet.getRow(1).font = { bold: true };
    projectSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    // Tasks sheet
    const taskSheet = workbook.addWorksheet('All Tasks');
    taskSheet.columns = [
      { header: 'Project Code', key: 'projectCode', width: 15 },
      { header: 'Project Name', key: 'projectName', width: 25 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'Assignee', key: 'assignee', width: 20 },
      { header: 'Due Date', key: 'dueDate', width: 12 },
    ];

    projects.forEach((project) => {
      project.tasks.forEach((task) => {
        taskSheet.addRow({
          projectCode: project.code,
          projectName: project.name,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignee: '', // Will be filled with actual assignee data if needed
          dueDate: task.dueDate.toISOString().split('T')[0],
        });
      });
    });

    // Style header row
    taskSheet.getRow(1).font = { bold: true };
    taskSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }
}
