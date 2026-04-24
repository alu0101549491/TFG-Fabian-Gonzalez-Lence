/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 24, 2026
 * @file scripts/complete-qualifying-bracket.ts
 * @desc Script to complete all qualifying bracket matches with results
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import { AppDataSource } from '../src/infrastructure/database/data-source';
import { Match } from '../src/domain/entities/match.entity';
import { Score } from '../src/domain/entities/score.entity';

const BRACKET_ID = 'brk_bf22bdea';

async function completeQualifyingBracket(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('✓ Database connected\n');

    const matchRepository = AppDataSource.getRepository(Match);
    const scoreRepository = AppDataSource.getRepository(Score);

    // Get all matches for the qualifying bracket, ordered by phase and match number
    const matches = await matchRepository.find({
      where: { bracketId: BRACKET_ID },
      relations: ['phase', 'participant1', 'participant2'],
      order: {
        phase: { phaseOrder: 'ASC' },
        matchNumber: 'ASC'
      }
    });

    console.log(`📋 Found ${matches.length} matches in qualifying bracket\n`);

    // Group matches by phase
    const round1Matches = matches.filter(m => m.phase.phaseName === 'Round of 16');
    const quarterMatches = matches.filter(m => m.phase.phaseName === 'Quarterfinals');

    console.log(`Round of 16: ${round1Matches.length} matches`);
    console.log(`Quarterfinals: ${quarterMatches.length} matches\n`);

    // Complete Round of 16 matches
    console.log('🎾 Completing Round of 16 matches...\n');
    for (const match of round1Matches) {
      const winner = match.participant1Id;
      const loser = match.participant2Id;
      
      // Create scores for 2-set match (6-4, 6-3)
      const score1 = new Score();
      score1.matchId = match.id;
      score1.setNumber = 1;
      score1.participant1Games = 6;
      score1.participant2Games = 4;
      await scoreRepository.save(score1);

      const score2 = new Score();
      score2.matchId = match.id;
      score2.setNumber = 2;
      score2.participant1Games = 6;
      score2.participant2Games = 3;
      await scoreRepository.save(score2);

      // Update match with winner
      match.winnerId = winner;
      match.loserId = loser;
      match.status = 'COMPLETED';
      match.completedAt = new Date();
      await matchRepository.save(match);

      console.log(`✅ Match ${match.matchNumber}: ${match.participant1?.firstName || 'P1'} defeats ${match.participant2?.firstName || 'P2'} (6-4, 6-3)`);
    }

    console.log('\n🎾 Completing Quarterfinals matches...\n');
    
    // Refresh quarterfinals matches to get updated participant assignments
    const updatedQuarterMatches = await matchRepository.find({
      where: { bracketId: BRACKET_ID },
      relations: ['phase', 'participant1', 'participant2'],
      order: {
        phase: { phaseOrder: 'ASC' },
        matchNumber: 'ASC'
      }
    });
    
    const finalRound = updatedQuarterMatches.filter(m => m.phase.phaseName === 'Quarterfinals');
    
    for (const match of finalRound) {
      if (!match.participant1Id || !match.participant2Id) {
        console.log(`⚠️  Match ${match.matchNumber}: Waiting for participants (${match.participant1Id || 'TBD'} vs ${match.participant2Id || 'TBD'})`);
        continue;
      }

      const winner = match.participant1Id;
      const loser = match.participant2Id;
      
      // Create scores for 2-set match (6-2, 7-5)
      const score1 = new Score();
      score1.matchId = match.id;
      score1.setNumber = 1;
      score1.participant1Games = 6;
      score1.participant2Games = 2;
      await scoreRepository.save(score1);

      const score2 = new Score();
      score2.matchId = match.id;
      score2.setNumber = 2;
      score2.participant1Games = 7;
      score2.participant2Games = 5;
      await scoreRepository.save(score2);

      // Update match with winner
      match.winnerId = winner;
      match.loserId = loser;
      match.status = 'COMPLETED';
      match.completedAt = new Date();
      await matchRepository.save(match);

      console.log(`✅ Match ${match.matchNumber}: ${match.participant1?.firstName || 'P1'} defeats ${match.participant2?.firstName || 'P2'} (6-2, 7-5)`);
      console.log(`   🏆 QUALIFIER: ${match.participant1?.firstName || winner} advances to Main Draw`);
    }

    console.log('\n✨ Qualifying bracket completed!');
    console.log('🎯 Check console logs for automatic qualifier registrations in Main Draw\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

completeQualifyingBracket();
