-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SUPERVISOR', 'INSPECTOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('CHECKBOX', 'NUMBER', 'TEXT', 'TEXTAREA', 'PHOTO', 'FILE', 'DROPDOWN', 'MULTISELECT', 'GPS', 'SIGNATURE', 'DATE', 'TIME', 'DATETIME', 'RATING');

-- CreateEnum
CREATE TYPE "ChecksheetStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('OK', 'NOT_OK', 'NA', 'PENDING');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ASSIGNMENT', 'REMINDER', 'APPROVAL', 'REJECTION', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'INSPECTOR',
    "organizationId" TEXT,
    "department" TEXT,
    "location" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT,
    "country" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checksheet" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "industry" TEXT,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "isAIGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiPrompt" TEXT,
    "status" "ChecksheetStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "creatorId" TEXT NOT NULL,
    "organizationId" TEXT,
    "tags" TEXT[],
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Checksheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "id" TEXT NOT NULL,
    "checksheetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "fieldType" "FieldType" NOT NULL,
    "config" JSONB,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "section" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecksheetAssignment" (
    "id" TEXT NOT NULL,
    "checksheetId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "frequency" "Frequency",
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecksheetAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecksheetResult" (
    "id" TEXT NOT NULL,
    "checksheetId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "status" "ResultStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "overallScore" DOUBLE PRECISION,
    "location" TEXT,
    "gpsLat" DOUBLE PRECISION,
    "gpsLng" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecksheetResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckpointResponse" (
    "id" TEXT NOT NULL,
    "checkpointId" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "value" JSONB,
    "textValue" TEXT,
    "numberValue" DOUBLE PRECISION,
    "boolValue" BOOLEAN,
    "dateValue" TIMESTAMP(3),
    "photoUrls" TEXT[],
    "fileUrls" TEXT[],
    "gpsLat" DOUBLE PRECISION,
    "gpsLng" DOUBLE PRECISION,
    "status" "ResponseStatus" NOT NULL DEFAULT 'OK',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckpointResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BestPracticeTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "industry" TEXT,
    "templateData" JSONB NOT NULL,
    "tags" TEXT[],
    "language" TEXT NOT NULL DEFAULT 'en',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BestPracticeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Checksheet_creatorId_idx" ON "Checksheet"("creatorId");

-- CreateIndex
CREATE INDEX "Checksheet_organizationId_idx" ON "Checksheet"("organizationId");

-- CreateIndex
CREATE INDEX "Checksheet_category_idx" ON "Checksheet"("category");

-- CreateIndex
CREATE INDEX "Checksheet_status_idx" ON "Checksheet"("status");

-- CreateIndex
CREATE INDEX "Checkpoint_checksheetId_idx" ON "Checkpoint"("checksheetId");

-- CreateIndex
CREATE INDEX "Checkpoint_order_idx" ON "Checkpoint"("order");

-- CreateIndex
CREATE INDEX "ChecksheetAssignment_checksheetId_idx" ON "ChecksheetAssignment"("checksheetId");

-- CreateIndex
CREATE INDEX "ChecksheetAssignment_assigneeId_idx" ON "ChecksheetAssignment"("assigneeId");

-- CreateIndex
CREATE INDEX "ChecksheetAssignment_status_idx" ON "ChecksheetAssignment"("status");

-- CreateIndex
CREATE INDEX "ChecksheetResult_checksheetId_idx" ON "ChecksheetResult"("checksheetId");

-- CreateIndex
CREATE INDEX "ChecksheetResult_inspectorId_idx" ON "ChecksheetResult"("inspectorId");

-- CreateIndex
CREATE INDEX "ChecksheetResult_status_idx" ON "ChecksheetResult"("status");

-- CreateIndex
CREATE INDEX "CheckpointResponse_checkpointId_idx" ON "CheckpointResponse"("checkpointId");

-- CreateIndex
CREATE INDEX "CheckpointResponse_resultId_idx" ON "CheckpointResponse"("resultId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "BestPracticeTemplate_category_idx" ON "BestPracticeTemplate"("category");

-- CreateIndex
CREATE INDEX "BestPracticeTemplate_industry_idx" ON "BestPracticeTemplate"("industry");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checksheet" ADD CONSTRAINT "Checksheet_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checksheet" ADD CONSTRAINT "Checksheet_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkpoint" ADD CONSTRAINT "Checkpoint_checksheetId_fkey" FOREIGN KEY ("checksheetId") REFERENCES "Checksheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecksheetAssignment" ADD CONSTRAINT "ChecksheetAssignment_checksheetId_fkey" FOREIGN KEY ("checksheetId") REFERENCES "Checksheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecksheetAssignment" ADD CONSTRAINT "ChecksheetAssignment_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecksheetResult" ADD CONSTRAINT "ChecksheetResult_checksheetId_fkey" FOREIGN KEY ("checksheetId") REFERENCES "Checksheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecksheetResult" ADD CONSTRAINT "ChecksheetResult_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointResponse" ADD CONSTRAINT "CheckpointResponse_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointResponse" ADD CONSTRAINT "CheckpointResponse_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "ChecksheetResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
