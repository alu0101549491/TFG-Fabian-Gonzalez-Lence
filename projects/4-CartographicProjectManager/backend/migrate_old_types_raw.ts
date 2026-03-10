import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Use raw SQL to update projects since old enum values are no longer in the schema
  const result = await prisma.$executeRaw`
    UPDATE "Project" 
    SET type = 'MISCELLANEOUS'::"ProjectType"
    WHERE type::text IN ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'PUBLIC')
  `;
  
  console.log(`Updated ${result} projects to MISCELLANEOUS type`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
