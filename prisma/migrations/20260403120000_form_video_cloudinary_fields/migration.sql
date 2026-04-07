-- AlterTable
ALTER TABLE "FormVideoConfig" ADD COLUMN "cloudinaryPublicId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "FormVideoConfig" ADD COLUMN "metadata" JSONB;
