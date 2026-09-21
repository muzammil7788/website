-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL DEFAULT '',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Page` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL DEFAULT '',
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isHome` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Page_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Post` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` VARCHAR(191) NOT NULL DEFAULT '',
    `content` VARCHAR(191) NOT NULL DEFAULT '',
    `coverImage` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Post_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Menu` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Menu_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MenuItem` (
    `id` VARCHAR(191) NOT NULL,
    `menuId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL DEFAULT 'page',
    `refId` VARCHAR(191) NULL,
    `url` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Media` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MenuItem` ADD CONSTRAINT `MenuItem_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `Menu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
