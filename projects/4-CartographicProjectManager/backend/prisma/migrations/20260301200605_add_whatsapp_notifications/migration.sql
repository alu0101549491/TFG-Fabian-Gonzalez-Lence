-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notifyAssignedTasks" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyDeadlineReminder" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyNewMessages" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyReceivedFiles" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyTaskStatusChange" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "whatsapp_notification_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "whatsapp_notification_logs_userId_projectId_sentAt_idx" ON "whatsapp_notification_logs"("userId", "projectId", "sentAt");
