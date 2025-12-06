-- CreateTable
CREATE TABLE "consent_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL,
    "consentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0'
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_subscribers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "confirmToken" TEXT,
    "confirmTokenExp" DATETIME,
    "unsubToken" TEXT NOT NULL,
    "subscribedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" DATETIME,
    "unsubscribedAt" DATETIME,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" DATETIME,
    "consentVersion" TEXT DEFAULT '1.0',
    "allowAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "allowMarketing" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_subscribers" ("confirmToken", "confirmTokenExp", "confirmedAt", "email", "id", "ipAddress", "status", "subscribedAt", "unsubToken", "unsubscribedAt", "userAgent") SELECT "confirmToken", "confirmTokenExp", "confirmedAt", "email", "id", "ipAddress", "status", "subscribedAt", "unsubToken", "unsubscribedAt", "userAgent" FROM "subscribers";
DROP TABLE "subscribers";
ALTER TABLE "new_subscribers" RENAME TO "subscribers";
CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");
CREATE UNIQUE INDEX "subscribers_confirmToken_key" ON "subscribers"("confirmToken");
CREATE UNIQUE INDEX "subscribers_unsubToken_key" ON "subscribers"("unsubToken");
CREATE INDEX "subscribers_email_idx" ON "subscribers"("email");
CREATE INDEX "subscribers_status_idx" ON "subscribers"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "consent_logs_email_idx" ON "consent_logs"("email");

-- CreateIndex
CREATE INDEX "consent_logs_consentDate_idx" ON "consent_logs"("consentDate");
