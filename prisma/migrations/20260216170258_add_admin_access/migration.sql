-- CreateTable
CREATE TABLE "AdminAccess" (
    "id" TEXT NOT NULL DEFAULT 'admin-access-single-record',
    "passwordHash" TEXT NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "lastAccess" TIMESTAMP(3),
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "buttonPosition" JSONB DEFAULT '{"x": 0, "y": 0}',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAccess_pkey" PRIMARY KEY ("id")
);
