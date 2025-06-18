/*
  Warnings:

  - A unique constraint covering the columns `[employeeId]` on the table `Computer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Computer` ADD COLUMN `employeeId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Computer_employeeId_key` ON `Computer`(`employeeId`);

-- AddForeignKey
ALTER TABLE `Computer` ADD CONSTRAINT `Computer_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
