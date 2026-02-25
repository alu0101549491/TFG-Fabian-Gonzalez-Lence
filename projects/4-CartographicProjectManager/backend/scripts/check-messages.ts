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
    console.log(`${i + 1}. ID: ${msg.id.substring(0, 8)}... | Sender: ${msg.senderId.substring(0, 8)}... | ReadBy: [${msg.readByUserIds.map(id => id.substring(0, 8)).join(', ')}]`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
