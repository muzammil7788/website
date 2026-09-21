-- AlterTable
ALTER TABLE `page` MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `post` MODIFY `excerpt` TEXT NOT NULL,
    MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `setting` MODIFY `value` TEXT NOT NULL;
