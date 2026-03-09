/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 9, 2026
 * @file backend/scripts/check-messages.ts
 * @desc Utility script to inspect recent messages and their read-receipt arrays.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const messages = await prisma.message.findMany({
    select: {
      id: true,
      content: true,
      senderId: true,
      readByUserIds: true,
    },
    take: 10,
    orderBy: {sentAt: 'desc'},
  });

  console.log('Recent messages:');
  messages.forEach((msg, i) => {
    console.log(
      `${i + 1}. ID: ${msg.id.substring(0, 8)}... | Sender: ${msg.senderId.substring(0, 8)}... | ReadBy: [${msg.readByUserIds.map(id => id.substring(0, 8)).join(', ')}]`,
    );
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
