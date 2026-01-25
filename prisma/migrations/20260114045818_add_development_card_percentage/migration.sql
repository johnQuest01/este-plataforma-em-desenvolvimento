-- CreateTable
CREATE TABLE "DevelopmentCardPercentage" (
    "id" TEXT NOT NULL DEFAULT 'development-card-single-record',
    "percentage" INTEGER NOT NULL DEFAULT 69,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "lastManualUpdate" TIMESTAMP(3),
    "lastAutoUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DevelopmentCardPercentage_pkey" PRIMARY KEY ("id")
);
