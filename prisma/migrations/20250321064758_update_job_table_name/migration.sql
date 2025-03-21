/*
  Warnings:

  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[applications] DROP CONSTRAINT [applications_jobId_fkey];

-- DropTable
DROP TABLE [dbo].[Job];

-- CreateTable
CREATE TABLE [dbo].[jobs] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [company] NVARCHAR(1000) NOT NULL,
    [location] NVARCHAR(1000) NOT NULL,
    [description] TEXT NOT NULL,
    [requirements] TEXT NOT NULL,
    [salary] NVARCHAR(1000),
    [contactEmail] NVARCHAR(1000),
    [contactPhone] NVARCHAR(1000),
    [postedDate] DATETIME2 NOT NULL CONSTRAINT [jobs_postedDate_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [jobs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[applications] ADD CONSTRAINT [applications_jobId_fkey] FOREIGN KEY ([jobId]) REFERENCES [dbo].[jobs]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
