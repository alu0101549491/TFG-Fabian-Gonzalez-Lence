/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 6, 2026
 * @file backend/src/application/services/export.service.ts
 * @desc Export service for tournament data in ITF, TODS, PDF and Excel formats (FR61-FR63)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Repository} from 'typeorm';
import {Tournament} from '../../domain/entities/tournament.entity';
import {Match} from '../../domain/entities/match.entity';
import {Registration} from '../../domain/entities/registration.entity';
import {Bracket} from '../../domain/entities/bracket.entity';
import {stringify} from 'csv-stringify/sync';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

/**
 * Export format enumeration.
 */
export enum ExportFormat {
  ITF_CSV = 'ITF_CSV',
  TODS = 'TODS',
  PDF = 'PDF',
  EXCEL = 'EXCEL',
}

/**
 * Export service for generating tournament data exports.
 * Implements FR61 (ITF format), FR62 (TODS format), and FR63 (PDF/Excel exports).
 */
export class ExportService {
  /**
   * Creates a new instance of Export service.
   *
   * @param tournamentRepository - Tournament repository
   * @param matchRepository - Match repository
   * @param registrationRepository - Registration repository
   * @param bracketRepository - Bracket repository
   */
  public constructor(
    private readonly tournamentRepository: Repository<Tournament>,
    private readonly matchRepository: Repository<Match>,
    private readonly registrationRepository: Repository<Registration>,
    private readonly bracketRepository: Repository<Bracket>
  ) {}

  /**
   * Exports tournament results in ITF CSV format.
   * ITF format follows International Tennis Federation standards for official reporting.
   *
   * @param tournamentId - Tournament ID
   * @returns Promise resolving to CSV content as Buffer
   */
  public async exportToITF(tournamentId: string): Promise<Buffer> {
    const tournament = await this.tournamentRepository.findOne({
      where: {id: tournamentId},
      relations: ['categories'],
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Use QueryBuilder for complex joins
    const matches = await this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.bracket', 'bracket')
      .leftJoinAndSelect('bracket.category', 'category')
      .leftJoinAndSelect('category.tournament', 'tournament')
      .leftJoinAndSelect('match.participant1', 'participant1')
      .leftJoinAndSelect('match.participant2', 'participant2')
      .leftJoinAndSelect('match.winner', 'winner')
      .leftJoinAndSelect('match.court', 'court')
      .where('tournament.id = :tournamentId', {tournamentId})
      .orderBy('match.scheduledTime', 'ASC')
      .getMany();

    console.log(`[ITF Export] Found ${matches.length} matches for tournament ${tournamentId}`);

    // Handle case with no matches
    if (matches.length === 0) {
      // Return CSV with just headers
      const csv = stringify([], {
        header: true,
        columns: [
          'Tournament Name',
          'Tournament Date',
          'Match Round',
          'Match Number',
          'Player 1',
          'Player 2',
          'Score',
          'Winner',
          'Match Status',
          'Court',
          'Scheduled Time',
        ],
      });
      return Buffer.from(csv, 'utf-8');
    }

    // Prepare ITF structured data
    const itfRecords = matches.map((match) => ({
      'Tournament Name': tournament.name,
      'Tournament Date': tournament.startDate.toISOString().split('T')[0],
      'Match Round': match.round || 'N/A',
      'Match Number': match.matchNumber || 'N/A',
      'Player 1': match.participant1 ? `${match.participant1.firstName} ${match.participant1.lastName}` : 'TBD',
      'Player 2': match.participant2 ? `${match.participant2.firstName} ${match.participant2.lastName}` : 'TBD',
      'Score': match.score || 'Not played',
      'Winner': match.winner ? `${match.winner.firstName} ${match.winner.lastName}` : 'Pending',
      'Match Status': match.status,
      'Court': match.court?.name || 'Unassigned',
      'Scheduled Time': match.scheduledTime ? match.scheduledTime.toISOString() : 'Unscheduled',
    }));

    console.log(`[ITF Export] First record sample:`, itfRecords[0]);

    // Convert to CSV
    const csv = stringify(itfRecords, {
      header: true,
      columns: [
        'Tournament Name',
        'Tournament Date',
        'Match Round',
        'Match Number',
        'Player 1',
        'Player 2',
        'Score',
        'Winner',
        'Match Status',
        'Court',
        'Scheduled Time',
      ],
    });

    return Buffer.from(csv, 'utf-8');
  }

  /**
   * Exports tournament data in TODS JSON format.
   * TODS (Tennis Open Data Standards) is a JSON-based format for interoperability.
   *
   * @param tournamentId - Tournament ID
   * @returns Promise resolving to JSON content as Buffer
   */
  public async exportToTODS(tournamentId: string): Promise<Buffer> {
    const tournament = await this.tournamentRepository.findOne({
      where: {id: tournamentId},
      relations: ['categories', 'categories.brackets', 'courts'],
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Use QueryBuilder for registrations
    const registrations = await this.registrationRepository
      .createQueryBuilder('registration')
      .leftJoinAndSelect('registration.participant', 'participant')
      .leftJoinAndSelect('registration.category', 'category')
      .leftJoinAndSelect('registration.tournament', 'regTournament')
      .where('regTournament.id = :tournamentId', {tournamentId})
      .getMany();

    // Use QueryBuilder for matches
    const matches = await this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.bracket', 'bracket')
      .leftJoinAndSelect('bracket.category', 'category')
      .leftJoinAndSelect('category.tournament', 'tournament')
      .leftJoinAndSelect('match.participant1', 'participant1')
      .leftJoinAndSelect('match.participant2', 'participant2')
      .leftJoinAndSelect('match.winner', 'winner')
      .leftJoinAndSelect('match.court', 'court')
      .where('tournament.id = :tournamentId', {tournamentId})
      .getMany();

    // Prepare TODS structure
    const todsData = {
      metadata: {
        format: 'TODS',
        version: '1.0',
        exportDate: new Date().toISOString(),
        generator: 'Tennis Tournament Manager',
      },
      tournament: {
        id: tournament.id,
        name: tournament.name,
        location: tournament.location,
        surface: tournament.surface,
        type: tournament.tournamentType,
        startDate: tournament.startDate.toISOString(),
        endDate: tournament.endDate.toISOString(),
        status: tournament.status,
        maxParticipants: tournament.maxParticipants,
        registrationFee: tournament.registrationFee,
        currency: tournament.currency,
      },
      categories: tournament.categories.map((category) => ({
        id: category.id,
        name: category.name,
        gender: category.gender,
        ageGroup: category.ageGroup,
        maxParticipants: category.maxParticipants,
      })),
      players: registrations.map((reg) => ({
        id: reg.participant.id,
        firstName: reg.participant.firstName,
        lastName: reg.participant.lastName,
        username: reg.participant.username,
        ranking: reg.participant.ranking,
        categoryId: reg.category.id,
        acceptanceType: reg.acceptanceType,
        seed: reg.seedNumber,
      })),
      matches: matches.map((match) => ({
        id: match.id,
        matchNumber: match.matchNumber,
        round: match.round,
        categoryId: match.bracket.category.id,
        player1: match.participant1
          ? {
              id: match.participant1.id,
              name: `${match.participant1.firstName} ${match.participant1.lastName}`,
            }
          : null,
        player2: match.participant2
          ? {
              id: match.participant2.id,
              name: `${match.participant2.firstName} ${match.participant2.lastName}`,
            }
          : null,
        score: match.score,
        winner: match.winner
          ? {
              id: match.winner.id,
              name: `${match.winner.firstName} ${match.winner.lastName}`,
            }
          : null,
        status: match.status,
        court: match.court?.name || null,
        scheduledTime: match.scheduledTime?.toISOString() || null,
      })),
      courts: tournament.courts?.map((court) => ({
        id: court.id,
        name: court.name,
        surface: court.surface,
        isAvailable: court.isAvailable,
      })) || [],
    };

    return Buffer.from(JSON.stringify(todsData, null, 2), 'utf-8');
  }

  /**
   * Exports tournament results as PDF document.
   *
   * @param tournamentId - Tournament ID
   * @returns Promise resolving to PDF content as Buffer
   */
  public async exportResultsToPDF(tournamentId: string): Promise<Buffer> {
    const tournament = await this.tournamentRepository.findOne({
      where: {id: tournamentId},
      relations: ['categories'],
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Use QueryBuilder for complex joins
    const matches = await this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.bracket', 'bracket')
      .leftJoinAndSelect('bracket.category', 'category')
      .leftJoinAndSelect('category.tournament', 'tournament')
      .leftJoinAndSelect('match.participant1', 'participant1')
      .leftJoinAndSelect('match.participant2', 'participant2')
      .leftJoinAndSelect('match.winner', 'winner')
      .where('tournament.id = :tournamentId', {tournamentId})
      .orderBy('match.scheduledTime', 'ASC')
      .getMany();

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({size: 'A4', margin: 50});
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Color scheme matching application theme
      const primaryColor = '#1e40af'; // Royal blue for headings/labels
      const accentColor = '#dc2626'; // Red for values/status
      const textColor = '#374151'; // Dark gray for regular text

      // Title - Bold, large, centered
      doc.fontSize(24).font('Helvetica-Bold').fillColor('#000000').text(tournament.name, {align: 'center'});
      doc.moveDown(0.5);

      // Subtitle - Location and dates in primary color
      doc.fontSize(12).font('Helvetica').fillColor(primaryColor);
      doc.text(`Location: ${tournament.location}`, {align: 'center'});
      doc.text(`${tournament.startDate.toDateString()} - ${tournament.endDate.toDateString()}`, {align: 'center'});
      doc.moveDown(2);

      // Tournament Information Section
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('Tournament Information');
      doc.moveDown(0.5);
      
      doc.fontSize(11).font('Helvetica').fillColor(textColor);
      
      // Surface with styled value
      doc.text('Surface: ', {continued: true});
      doc.fillColor(accentColor).font('Helvetica-Bold').text(tournament.surface);
      
      // Type with styled value
      doc.fillColor(textColor).font('Helvetica').text('Type: ', {continued: true});
      doc.fillColor(accentColor).font('Helvetica-Bold').text(tournament.tournamentType);
      
      // Status with styled value
      doc.fillColor(textColor).font('Helvetica').text('Status: ', {continued: true});
      doc.fillColor(accentColor).font('Helvetica-Bold').text(tournament.status);
      
      doc.moveDown(2);

      // Match Results Section
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('Match Results');
      doc.moveDown(1);

      matches.forEach((match, index) => {
        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
          doc.moveDown();
        }

        // Match header - round and number
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000');
        doc.text(`Match ${match.matchNumber || index + 1} - Round ${match.round || 'N/A'}`);
        doc.moveDown(0.2);

        const player1 = match.participant1;
        const player2 = match.participant2;

        // Players
        doc.fontSize(10).font('Helvetica').fillColor(textColor);
        doc.text(`${player1?.firstName || 'TBD'} ${player1?.lastName || ''} vs ${player2?.firstName || 'TBD'} ${player2?.lastName || ''}`);
        
        // Score with styled label
        doc.text('Score: ', {continued: true});
        doc.font('Helvetica-Bold').fillColor(accentColor).text(match.score || 'Not played');
        
        // Winner if available
        if (match.winner) {
          doc.font('Helvetica').fillColor(textColor).text('Winner: ', {continued: true});
          doc.font('Helvetica-Bold').fillColor(primaryColor).text(`${match.winner.firstName} ${match.winner.lastName}`);
        }
        
        // Status
        doc.font('Helvetica').fillColor(textColor).text('Status: ', {continued: true});
        doc.font('Helvetica-Bold').fillColor(accentColor).text(match.status);
        
        doc.moveDown(0.8);
      });

      // Footer
      doc.fontSize(8).font('Helvetica').fillColor('#6b7280')
        .text(`Generated on ${new Date().toLocaleString()}`, {align: 'center'});

      doc.end();
    });
  }

  /**
   * Exports tournament results as Excel spreadsheet.
   *
   * @param tournamentId - Tournament ID
   * @returns Promise resolving to Excel content as Buffer
   */
  public async exportResultsToExcel(tournamentId: string): Promise<Buffer> {
    const tournament = await this.tournamentRepository.findOne({
      where: {id: tournamentId},
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Use QueryBuilder for complex joins
    const matches = await this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.bracket', 'bracket')
      .leftJoinAndSelect('bracket.category', 'category')
      .leftJoinAndSelect('category.tournament', 'tournament')
      .leftJoinAndSelect('match.participant1', 'participant1')
      .leftJoinAndSelect('match.participant2', 'participant2')
      .leftJoinAndSelect('match.winner', 'winner')
      .leftJoinAndSelect('match.court', 'court')
      .where('tournament.id = :tournamentId', {tournamentId})
      .orderBy('match.scheduledTime', 'ASC')
      .getMany();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Tennis Tournament Manager';
    workbook.created = new Date();

    // Tournament info sheet
    const infoSheet = workbook.addWorksheet('Tournament Info');
    infoSheet.columns = [
      {header: 'Field', key: 'field', width: 20},
      {header: 'Value', key: 'value', width: 50},
    ];

    infoSheet.addRows([
      {field: 'Tournament Name', value: tournament.name},
      {field: 'Location', value: tournament.location},
      {field: 'Surface', value: tournament.surface},
      {field: 'Type', value: tournament.tournamentType},
      {field: 'Start Date', value: tournament.startDate.toDateString()},
      {field: 'End Date', value: tournament.endDate.toDateString()},
      {field: 'Status', value: tournament.status},
      {field: 'Max Participants', value: tournament.maxParticipants},
    ]);

    // Style header
    infoSheet.getRow(1).font = {bold: true};

    // Matches sheet
    const matchesSheet = workbook.addWorksheet('Matches');
    matchesSheet.columns = [
      {header: 'Match #', key: 'number', width: 10},
      {header: 'Round', key: 'round', width: 15},
      {header: 'Player 1', key: 'player1', width: 25},
      {header: 'Player 2', key: 'player2', width: 25},
      {header: 'Score', key: 'score', width: 20},
      {header: 'Winner', key: 'winner', width: 25},
      {header: 'Status', key: 'status', width: 15},
      {header: 'Court', key: 'court', width: 15},
      {header: 'Date', key: 'date', width: 20},
    ];

    matches.forEach((match) => {
      const player1 = match.participant1;
      const player2 = match.participant2;

      matchesSheet.addRow({
        number: match.matchNumber,
        round: match.round || 'N/A',
        player1: player1 ? `${player1.firstName} ${player1.lastName}` : 'TBD',
        player2: player2 ? `${player2.firstName} ${player2.lastName}` : 'TBD',
        score: match.score || 'Not played',
        winner: match.winner ? `${match.winner.firstName} ${match.winner.lastName}` : 'Pending',
        status: match.status,
        court: match.court?.name || 'Unassigned',
        date: match.scheduledTime ? match.scheduledTime.toLocaleString() : 'Unscheduled',
      });
    });

    // Style headers
    matchesSheet.getRow(1).font = {bold: true};

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Exports bracket structure as PDF.
   *
   * @param bracketId - Bracket ID
   * @returns Promise resolving to PDF content as Buffer
   */
  public async exportBracketToPDF(bracketId: string): Promise<Buffer> {
    const bracket = await this.bracketRepository.findOne({
      where: {id: bracketId},
      relations: ['category', 'category.tournament', 'matches', 'matches.participant1', 'matches.participant2', 'matches.winner'],
    });

    if (!bracket) {
      throw new Error('Bracket not found');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({size: 'A4', layout: 'landscape', margin: 50});
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Color scheme matching application theme
      const primaryColor = '#1e40af'; // Royal blue for headings/labels
      const accentColor = '#dc2626'; // Red for values/status
      const textColor = '#374151'; // Dark gray for regular text

      // Title - Bold, large, centered
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#000000')
        .text(bracket.category.tournament.name, {align: 'center'});
      doc.moveDown(0.5);

      // Subtitle - Category and bracket type in primary color
      doc.fontSize(14).font('Helvetica').fillColor(primaryColor)
        .text(`${bracket.category.name} - ${bracket.bracketType}`, {align: 'center'});
      doc.moveDown(2);

      // Bracket information
      doc.fontSize(11).font('Helvetica').fillColor(textColor);
      doc.text('Size: ', {continued: true});
      doc.fillColor(accentColor).font('Helvetica-Bold').text(`${bracket.size} participants`);
      
      doc.fillColor(textColor).font('Helvetica').text('Published: ', {continued: true});
      doc.fillColor(accentColor).font('Helvetica-Bold').text(bracket.isPublished ? 'Yes' : 'No');
      doc.moveDown(2);

      // Matches section header
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('Matches');
      doc.moveDown(1);

      // Group matches by round
      const matchesByRound = new Map<string, typeof bracket.matches>();
      bracket.matches.forEach((match) => {
        const round = match.round ? String(match.round) : 'Unassigned';
        if (!matchesByRound.has(round)) {
          matchesByRound.set(round, []);
        }
        matchesByRound.get(round)!.push(match);
      });

      // Print matches round by round
      Array.from(matchesByRound.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([round, matches]) => {
          // Round header in primary color
          doc.fontSize(13).font('Helvetica-Bold').fillColor(primaryColor).text(round);
          doc.moveDown(0.5);

          matches.forEach((match) => {
            if (doc.y > 500) {
              doc.addPage();
              doc.moveDown();
            }

            const player1 = match.participant1;
            const player2 = match.participant2;

            // Match number and participants
            doc.fontSize(10).font('Helvetica').fillColor(textColor);
            doc.text(
              `Match ${match.matchNumber}: ${player1?.firstName || 'TBD'} ${player1?.lastName || ''} vs ${player2?.firstName || 'TBD'} ${player2?.lastName || ''}`
            );
            
            // Score if available
            if (match.score) {
              doc.text('  Score: ', {continued: true});
              doc.font('Helvetica-Bold').fillColor(accentColor).text(match.score);
            }
            
            // Winner if available
            if (match.winner) {
              doc.font('Helvetica').fillColor(textColor).text('  Winner: ', {continued: true});
              doc.font('Helvetica-Bold').fillColor(primaryColor)
                .text(`${match.winner.firstName} ${match.winner.lastName}`);
            }
            
            doc.moveDown(0.5);
          });

          doc.moveDown();
        });

      // Footer
      doc.fontSize(8).font('Helvetica').fillColor('#6b7280')
        .text(`Generated on ${new Date().toLocaleString()}`, {align: 'center'});

      doc.end();
    });
  }
}
