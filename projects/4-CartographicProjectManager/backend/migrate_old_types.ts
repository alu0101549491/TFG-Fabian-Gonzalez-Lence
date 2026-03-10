import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update all projects with old types to MISCELLANEOUS
  const result = await prisma.project.updateMany({
    where: {
      type: {
        in: ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'PUBLIC']
      }
    },
    data: {
      type: 'MISCELLANEOUS'
    }
  });
  
  console.log(`Updated ${result.count} projects to MISCELLANEOUS type`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
