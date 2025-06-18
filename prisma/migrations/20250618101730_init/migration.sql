/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Boss` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Boss` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Boss` ADD COLUMN `email` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Boss_email_key` ON `Boss`(`email`);
