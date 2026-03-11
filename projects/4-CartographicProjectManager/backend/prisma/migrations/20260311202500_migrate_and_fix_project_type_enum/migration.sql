-- Step 1: Migrate old enum values to MISCELLANEOUS before changing enum
-- This ensures no data is lost when we recreate the enum
UPDATE "projects" 
SET "type" = 'MISCELLANEOUS'::text 
WHERE "type" IN ('RESIDENTIAL', 'COMMERCIAL', 'PUBLIC');

-- Step 2: Now safely alter the enum to include all current types
BEGIN;
CREATE TYPE "ProjectType_new" AS ENUM ('TOPOGRAPHY', 'CADASTRE', 'GIS', 'HYDROLOGY', 'INDUSTRIAL', 'CIVIL_ENGINEERING', 'ENVIRONMENTAL_DOCUMENT', 'STUDY_OF_ALTERNATIVES', 'GEOLOGICAL_STUDY', 'HYDROGEOLOGICAL_STUDY', 'RISK_STUDY', 'CONSTRUCTION_MANAGEMENT', 'MISCELLANEOUS');
ALTER TABLE "projects" ALTER COLUMN "type" TYPE "ProjectType_new" USING ("type"::text::"ProjectType_new");
ALTER TYPE "ProjectType" RENAME TO "ProjectType_old";
ALTER TYPE "ProjectType_new" RENAME TO "ProjectType";
DROP TYPE "ProjectType_old";
COMMIT;
