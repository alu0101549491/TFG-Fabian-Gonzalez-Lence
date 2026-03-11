/*
  Warnings:

  - The values [RESIDENTIAL,COMMERCIAL,PUBLIC] on the enum `ProjectType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProjectType_new" AS ENUM ('TOPOGRAPHY', 'CADASTRE', 'GIS', 'HYDROLOGY', 'INDUSTRIAL', 'CIVIL_ENGINEERING', 'ENVIRONMENTAL_DOCUMENT', 'STUDY_OF_ALTERNATIVES', 'GEOLOGICAL_STUDY', 'HYDROGEOLOGICAL_STUDY', 'RISK_STUDY', 'CONSTRUCTION_MANAGEMENT', 'MISCELLANEOUS');
ALTER TABLE "projects" ALTER COLUMN "type" TYPE "ProjectType_new" USING ("type"::text::"ProjectType_new");
ALTER TYPE "ProjectType" RENAME TO "ProjectType_old";
ALTER TYPE "ProjectType_new" RENAME TO "ProjectType";
DROP TYPE "ProjectType_old";
COMMIT;
