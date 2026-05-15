-- Optional consultant / agent portrait (path under /uploads or external URL).
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "ownerPhotoUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PropertySubmission" ADD COLUMN IF NOT EXISTS "ownerPhotoUrl" TEXT NOT NULL DEFAULT '';
