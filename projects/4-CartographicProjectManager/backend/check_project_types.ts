import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const oldTypeProjects = await prisma.project.findMany({
    where: {
      type: {
        in: ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'PUBLIC']
      }
    },
    select: {
      id: true,
      code: true,
      type: true
    }
  });
  
  console.log(`Found ${oldTypeProjects.length} projects with old type values:`);
  console.log(JSON.stringify(oldTypeProjects, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
