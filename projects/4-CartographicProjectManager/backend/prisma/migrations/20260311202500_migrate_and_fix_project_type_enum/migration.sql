-- Step 1: Temporarily convert column to TEXT to allow data migration
ALTER TABLE "projects" ALTER COLUMN "type" TYPE TEXT;

-- Step 2: Update old enum values to MISCELLANEOUS
UPDATE "projects" 
SET "type" = 'MISCELLANEOUS' 
WHERE "type" IN ('RESIDENTIAL', 'COMMERCIAL', 'PUBLIC');

-- Step 3: Create the new enum with all current types
CREATE TYPE "ProjectType_new" AS ENUM ('TOPOGRAPHY', 'CADASTRE', 'GIS', 'HYDROLOGY', 'INDUSTRIAL', 'CIVIL_ENGINEERING', 'ENVIRONMENTAL_DOCUMENT', 'STUDY_OF_ALTERNATIVES', 'GEOLOGICAL_STUDY', 'HYDROGEOLOGICAL_STUDY', 'RISK_STUDY', 'CONSTRUCTION_MANAGEMENT', 'MISCELLANEOUS');

-- Step 4: Drop the old enum (we can do this now since column is TEXT)
DROP TYPE "ProjectType";

-- Step 5: Rename new enum to the original name
ALTER TYPE "ProjectType_new" RENAME TO "ProjectType";

-- Step 6: Convert column back to the new enum type
ALTER TABLE "projects" ALTER COLUMN "type" TYPE "ProjectType" USING ("type"::text::"ProjectType");
