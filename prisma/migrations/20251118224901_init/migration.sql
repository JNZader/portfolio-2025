-- CreateTable
CREATE TABLE "subscribers" (
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
    "deletedAt" DATETIME
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
CREATE INDEX "subscribers_confirmToken_idx" ON "subscribers"("confirmToken");

-- CreateIndex
CREATE INDEX "subscribers_unsubToken_idx" ON "subscribers"("unsubToken");
