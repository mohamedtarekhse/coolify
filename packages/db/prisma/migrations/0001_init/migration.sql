-- CreateTable
CREATE TABLE `Client` (
    `id` VARCHAR(191) NOT NULL,
    `clientCode` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameAr` VARCHAR(191) NULL,
    `industry` VARCHAR(191) NULL,
    `contact` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    `contractStart` DATETIME(3) NULL,
    `contractEnd` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#0070f2',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Client_clientCode_key`(`clientCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameAr` VARCHAR(191) NULL,
    `role` ENUM('admin', 'manager', 'technician', 'user') NOT NULL DEFAULT 'user',
    `clientId` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FunctionalLocation` (
    `id` VARCHAR(191) NOT NULL,
    `flCode` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('Rig', 'Workshop', 'Yard', 'Warehouse', 'Other') NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `clientId` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FunctionalLocation_flCode_key`(`flCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inspector` (
    `id` VARCHAR(191) NOT NULL,
    `inspectorNumber` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `experienceYears` INTEGER NULL,
    `experienceDesc` TEXT NULL,
    `cvFile` VARCHAR(191) NULL,
    `cvUrl` VARCHAR(191) NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#0070f2',
    `education` JSON NULL,
    `trainings` JSON NULL,
    `trainingCerts` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Inspector_inspectorNumber_key`(`inspectorNumber`),
    UNIQUE INDEX `Inspector_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asset` (
    `id` VARCHAR(191) NOT NULL,
    `assetNumber` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `assetType` ENUM('Hoisting Equipment', 'Drilling Equipment', 'Mud System Low Pressure', 'Mud System High Pressure', 'Wirelines', 'Structure', 'Well Control', 'Tubular') NOT NULL,
    `status` ENUM('operation', 'stacked') NOT NULL DEFAULT 'operation',
    `clientId` VARCHAR(191) NULL,
    `functionalLocationId` VARCHAR(191) NULL,
    `serialNumber` VARCHAR(191) NULL,
    `manufacturer` VARCHAR(191) NULL,
    `model` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Asset_assetNumber_key`(`assetNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Certificate` (
    `id` VARCHAR(191) NOT NULL,
    `certNumber` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `certType` ENUM('CAT III', 'CAT IV', 'ORIGINAL COC', 'LOAD TEST', 'LIFTING', 'NDT', 'TUBULAR') NOT NULL,
    `assetId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `inspectorId` VARCHAR(191) NULL,
    `issuedBy` VARCHAR(191) NOT NULL,
    `relatedStandard` VARCHAR(191) NULL,
    `issueDate` DATETIME(3) NOT NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `fileName` VARCHAR(191) NULL,
    `fileUrl` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `approvalStatus` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `rejectionReason` TEXT NULL,
    `uploadedById` VARCHAR(191) NULL,
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Certificate_certNumber_key`(`certNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CertificateHistory` (
    `id` VARCHAR(191) NOT NULL,
    `certificateId` VARCHAR(191) NOT NULL,
    `certNumber` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `certType` ENUM('CAT III', 'CAT IV', 'ORIGINAL COC', 'LOAD TEST', 'LIFTING', 'NDT', 'TUBULAR') NULL,
    `relatedStandard` VARCHAR(191) NULL,
    `assetId` VARCHAR(191) NULL,
    `clientId` VARCHAR(191) NULL,
    `issuedBy` VARCHAR(191) NULL,
    `issueDate` DATETIME(3) NULL,
    `expiryDate` DATETIME(3) NULL,
    `approvalStatus` ENUM('pending', 'approved', 'rejected') NULL,
    `fileName` VARCHAR(191) NULL,
    `fileUrl` VARCHAR(191) NULL,
    `actionType` VARCHAR(191) NOT NULL,
    `changedById` VARCHAR(191) NULL,
    `snapshotJson` JSON NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CertificateFile` (
    `id` VARCHAR(191) NOT NULL,
    `certificateId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `jobNumber` VARCHAR(191) NULL,
    `certType` ENUM('CAT III', 'CAT IV', 'ORIGINAL COC', 'LOAD TEST', 'LIFTING', 'NDT', 'TUBULAR') NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileSize` BIGINT NULL,
    `mimeType` VARCHAR(191) NULL,
    `storageKey` VARCHAR(191) NOT NULL,
    `versionNo` INTEGER NOT NULL DEFAULT 1,
    `isCurrent` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('active', 'deleted') NOT NULL DEFAULT 'active',
    `scanStatus` ENUM('pending', 'clean', 'infected', 'failed') NOT NULL DEFAULT 'pending',
    `uploadedById` VARCHAR(191) NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CertificateFile_storageKey_key`(`storageKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NULL,
    `refType` VARCHAR(191) NULL,
    `refId` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PushSubscription` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `p256dh` VARCHAR(191) NOT NULL,
    `auth` VARCHAR(191) NOT NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PushSubscription_userId_endpoint_key`(`userId`, `endpoint`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Job` (
    `id` VARCHAR(191) NOT NULL,
    `jobNumber` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `functionalLocationId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `status` ENUM('active', 'technician_done', 'closed', 'reopened') NOT NULL DEFAULT 'active',
    `createdById` VARCHAR(191) NULL,
    `finishedById` VARCHAR(191) NULL,
    `closedById` VARCHAR(191) NULL,
    `reopenedById` VARCHAR(191) NULL,
    `finishedAt` DATETIME(3) NULL,
    `closedAt` DATETIME(3) NULL,
    `reopenedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Job_jobNumber_key`(`jobNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobInspector` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `inspectorId` VARCHAR(191) NOT NULL,
    `assignedById` VARCHAR(191) NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `JobInspector_jobId_inspectorId_key`(`jobId`, `inspectorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobEvent` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `actorUserId` VARCHAR(191) NULL,
    `payloadJson` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FunctionalLocation` ADD CONSTRAINT `FunctionalLocation_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asset` ADD CONSTRAINT `Asset_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asset` ADD CONSTRAINT `Asset_functionalLocationId_fkey` FOREIGN KEY (`functionalLocationId`) REFERENCES `FunctionalLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `Asset`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_inspectorId_fkey` FOREIGN KEY (`inspectorId`) REFERENCES `Inspector`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CertificateHistory` ADD CONSTRAINT `CertificateHistory_certificateId_fkey` FOREIGN KEY (`certificateId`) REFERENCES `Certificate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CertificateFile` ADD CONSTRAINT `CertificateFile_certificateId_fkey` FOREIGN KEY (`certificateId`) REFERENCES `Certificate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CertificateFile` ADD CONSTRAINT `CertificateFile_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CertificateFile` ADD CONSTRAINT `CertificateFile_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PushSubscription` ADD CONSTRAINT `PushSubscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_functionalLocationId_fkey` FOREIGN KEY (`functionalLocationId`) REFERENCES `FunctionalLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_finishedById_fkey` FOREIGN KEY (`finishedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_closedById_fkey` FOREIGN KEY (`closedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_reopenedById_fkey` FOREIGN KEY (`reopenedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobInspector` ADD CONSTRAINT `JobInspector_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobInspector` ADD CONSTRAINT `JobInspector_inspectorId_fkey` FOREIGN KEY (`inspectorId`) REFERENCES `Inspector`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobEvent` ADD CONSTRAINT `JobEvent_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobEvent` ADD CONSTRAINT `JobEvent_actorUserId_fkey` FOREIGN KEY (`actorUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

