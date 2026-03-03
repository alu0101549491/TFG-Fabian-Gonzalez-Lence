-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "readByUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
