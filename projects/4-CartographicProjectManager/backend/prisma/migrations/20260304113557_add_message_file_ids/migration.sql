-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "fileIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
