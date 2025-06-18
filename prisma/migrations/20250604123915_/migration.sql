-- CreateTable
CREATE TABLE `Boss` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyName` VARCHAR(191) NOT NULL,
    `siretNumber` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `directorName` VARCHAR(191) NULL,

    UNIQUE INDEX `Boss_siretNumber_key`(`siretNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Computer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `macAddress` VARCHAR(191) NOT NULL,
    `bossId` INTEGER NOT NULL,

    UNIQUE INDEX `Computer_macAddress_key`(`macAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `age` INTEGER NULL,
    `gender` VARCHAR(191) NULL,
    `bossId` INTEGER NOT NULL,

    UNIQUE INDEX `Employee_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Computer` ADD CONSTRAINT `Computer_bossId_fkey` FOREIGN KEY (`bossId`) REFERENCES `Boss`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_bossId_fkey` FOREIGN KEY (`bossId`) REFERENCES `Boss`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
