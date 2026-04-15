/**
 * Debug script to check consolation draw status
 * 
 * Usage: npx tsx scripts/debug-consolation.ts <tournamentId>
 */

import {AppDataSource} from './src/infrastructure/database/data-source';
import {Phase} from './src/domain/entities/phase.entity';
import {Match} from './src/domain/entities/match.entity';
import {Bracket} from './src/domain/entities/bracket.entity';

async function debugConsolation(tournamentId: string): Promise<void> {
  await AppDataSource.initialize();

  const phaseRepository = AppDataSource.getRepository(Phase);
  const matchRepository = AppDataSource.getRepository(Match);
  const bracketRepository = AppDataSource.getRepository(Bracket);

  console.log('\n🔍 Consolation Draw Debug Info\n');
  console.log(`Tournament ID: ${tournamentId}\n`);

  // Get all brackets for this tournament
  const brackets = await bracketRepository.find({
    where: {tournamentId},
  });

  console.log(`📋 Brackets found: ${brackets.length}`);
  for (const bracket of brackets) {
    console.log(`   - ${bracket.name} (${bracket.id})`);
  }

  if (brackets.length === 0) {
    console.log('\n❌ No brackets found\n');
    await AppDataSource.destroy();
    return;
  }

  const bracketId = brackets[0].id;

  // Get all phases
  const phases = await phaseRepository.find({
    where: {bracketId},
    order: {sequenceOrder: 'ASC'},
  });

  console.log(`\n📋 Phases found: ${phases.length}`);
  for (const phase of phases) {
    console.log(`   - ${phase.name} (${phase.id})`);
    console.log(`     Order: ${phase.order}, Sequence: ${phase.sequenceOrder}`);
    console.log(`     Match Count: ${phase.matchCount}`);
    console.log(`     Next Phase: ${phase.nextPhaseId || 'none'}`);
  }

  // Find consolation phases
  const consolationPhases = phases.filter(p => p.name.toLowerCase().includes('consolation'));
  
  if (consolationPhases.length === 0) {
    console.log('\n⚠️  No consolation phases found\n');
  } else {
    console.log(`\n🏆 Consolation Phases: ${consolationPhases.length}`);
    
    for (const consPhase of consolationPhases) {
      console.log(`\n   Phase: ${consPhase.name}`);
      
      // Find linked main phase
      const mainPhase = await phaseRepository.findOne({
        where: {nextPhaseId: consPhase.id},
      });
      
      if (mainPhase) {
        console.log(`   ✅ Linked to: ${mainPhase.name}`);
        
        // Check matches in main phase
        const mainMatches = await matchRepository.find({
          where: {
            bracketId: mainPhase.bracketId,
            round: mainPhase.order,
          },
        });
        
        const completed = mainMatches.filter(m => m.status === 'COMPLETED' && m.winnerId);
        console.log(`   Main phase matches: ${mainMatches.length} total, ${completed.length} completed`);
        
        if (completed.length > 0) {
          console.log(`   ✅ ${completed.length} losers available for consolation`);
        } else {
          console.log(`   ⚠️  No completed matches - run complete-next-round.ts first`);
        }
      } else {
        console.log(`   ❌ NO MAIN PHASE LINKED!`);
      }
      
      // Check matches in consolation phase
      const consMatches = await matchRepository.find({
        where: {
          bracketId: consPhase.bracketId,
          round: consPhase.order,
        },
      });
      
      console.log(`   Consolation matches: ${consMatches.length}`);
      
      if (consMatches.length === 0) {
        console.log(`   ⚠️  No matches generated yet - click "Populate with Losers"  `);
      }
    }
  }

  console.log('\n');
  await AppDataSource.destroy();
}

const tournamentId = process.argv[2];

if (!tournamentId) {
  console.error('\n❌ Usage: npx tsx scripts/debug-consolation.ts <tournamentId>\n');
  process.exit(1);
}

debugConsolation(tournamentId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
