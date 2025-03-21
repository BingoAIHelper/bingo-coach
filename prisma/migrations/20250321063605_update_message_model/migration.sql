BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[assessments] DROP CONSTRAINT [assessments_userId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[documents] DROP CONSTRAINT [documents_userId_fkey];

-- AlterTable
ALTER TABLE [dbo].[messages] ADD [assessmentId] NVARCHAR(1000),
[documentId] NVARCHAR(1000),
[type] NVARCHAR(1000) NOT NULL CONSTRAINT [messages_type_df] DEFAULT 'text';

-- AddForeignKey
ALTER TABLE [dbo].[assessments] ADD CONSTRAINT [assessments_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[documents] ADD CONSTRAINT [documents_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[messages] ADD CONSTRAINT [messages_document_fkey] FOREIGN KEY ([documentId]) REFERENCES [dbo].[documents]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[messages] ADD CONSTRAINT [messages_assessment_fkey] FOREIGN KEY ([assessmentId]) REFERENCES [dbo].[assessments]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
