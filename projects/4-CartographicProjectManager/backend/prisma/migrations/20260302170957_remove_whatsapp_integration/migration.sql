/*
  Warnings:

  - You are about to drop the column `notifyAssignedTasks` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `notifyDeadlineReminder` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `notifyNewMessages` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `notifyReceivedFiles` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `notifyTaskStatusChange` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `whatsappEnabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `whatsapp_notification_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "notifyAssignedTasks",
DROP COLUMN "notifyDeadlineReminder",
DROP COLUMN "notifyNewMessages",
DROP COLUMN "notifyReceivedFiles",
DROP COLUMN "notifyTaskStatusChange",
DROP COLUMN "whatsappEnabled";

-- DropTable
DROP TABLE "whatsapp_notification_logs";
