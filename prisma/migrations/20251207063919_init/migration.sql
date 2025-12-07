-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('NEWSLETTER', 'COOKIES_ESSENTIAL', 'COOKIES_ANALYTICS', 'COOKIES_MARKETING');

-- CreateTable
CREATE TABLE "subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "confirmToken" TEXT,
    "confirmTokenExp" TIMESTAMP(3),
    "unsubToken" TEXT NOT NULL,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "consentVersion" TEXT DEFAULT '1.0',
    "allowAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "allowMarketing" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_logs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "consentType" "ConsentType" NOT NULL,
    "consentGiven" BOOLEAN NOT NULL,
    "consentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',

    CONSTRAINT "consent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_confirmToken_key" ON "subscribers"("confirmToken");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_unsubToken_key" ON "subscribers"("unsubToken");

-- CreateIndex
CREATE INDEX "subscribers_email_idx" ON "subscribers"("email");

-- CreateIndex
CREATE INDEX "subscribers_status_idx" ON "subscribers"("status");

-- CreateIndex
CREATE INDEX "subscribers_subscribedAt_idx" ON "subscribers"("subscribedAt");

-- CreateIndex
CREATE INDEX "subscribers_status_subscribedAt_idx" ON "subscribers"("status", "subscribedAt");

-- CreateIndex
CREATE INDEX "consent_logs_email_idx" ON "consent_logs"("email");

-- CreateIndex
CREATE INDEX "consent_logs_consentDate_idx" ON "consent_logs"("consentDate");

-- CreateIndex
CREATE INDEX "consent_logs_email_consentType_idx" ON "consent_logs"("email", "consentType");

-- CreateIndex
CREATE INDEX "consent_logs_consentType_consentDate_idx" ON "consent_logs"("consentType", "consentDate");
