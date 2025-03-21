/*
  Warnings:

  - You are about to drop the column `feedback` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `assessments` table. All the data in the column will be lost.
  - Added the required column `sections` to the `assessments` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[assessments] DROP CONSTRAINT [assessments_userId_fkey];

-- AlterTable
ALTER TABLE [dbo].[assessments] DROP COLUMN [feedback],
[score];
ALTER TABLE [dbo].[assessments] ADD [completedAt] DATETIME2 NOT NULL CONSTRAINT [assessments_completedAt_df] DEFAULT CURRENT_TIMESTAMP,
[description] NVARCHAR(1000),
[sections] TEXT NOT NULL,
[status] NVARCHAR(1000) NOT NULL CONSTRAINT [assessments_status_df] DEFAULT 'pending';

-- AlterTable
ALTER TABLE [dbo].[users] ALTER COLUMN [name] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[users] ALTER COLUMN [firstName] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[users] ALTER COLUMN [lastName] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[users] ADD [assessmentCompleted] BIT NOT NULL CONSTRAINT [users_assessmentCompleted_df] DEFAULT 0;

-- AddForeignKey
ALTER TABLE [dbo].[assessments] ADD CONSTRAINT [assessments_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
