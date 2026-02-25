/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 25, 2026
 * @file scripts/mark-sender-messages-read.ts
 * @desc Script to mark all existing messages as read by their senders
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🔄 Updating messages to mark senders as having read their own messages...');

  // Get all messages
  const messages = await prisma.message.findMany({
    select: {
      id: true,
      senderId: true,
      readByUserIds: true,
    },
  });

  console.log(`Found ${messages.length} messages to process`);

  let updated = 0;
  let skipped = 0;

  for (const message of messages) {
    // Check if sender is already in readByUserIds
    if (!message.readByUserIds.includes(message.senderId)) {
      await prisma.message.update({
        where: {id: message.id},
        data: {
          readByUserIds: {
            push: message.senderId,
          },
        },
      });
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`✅ Done! Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
