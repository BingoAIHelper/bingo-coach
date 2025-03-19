/*
  Warnings:

  - Made the column `expertise` on table `Coach` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Coach] ALTER COLUMN [expertise] TEXT NOT NULL;
ALTER TABLE [dbo].[Coach] ADD CONSTRAINT [Coach_expertise_df] DEFAULT '[]' FOR [expertise];
ALTER TABLE [dbo].[Coach] ADD [assessmentTypes] TEXT NOT NULL CONSTRAINT [Coach_assessmentTypes_df] DEFAULT '[]',
[certifications] TEXT NOT NULL CONSTRAINT [Coach_certifications_df] DEFAULT '[]',
[coachingStyle] TEXT,
[industries] TEXT NOT NULL CONSTRAINT [Coach_industries_df] DEFAULT '[]',
[languages] TEXT NOT NULL CONSTRAINT [Coach_languages_df] DEFAULT '[]',
[specialties] TEXT NOT NULL CONSTRAINT [Coach_specialties_df] DEFAULT '[]',
[yearsExperience] INT;

-- CreateTable
CREATE TABLE [dbo].[CoachMatch] (
    [id] NVARCHAR(1000) NOT NULL,
    [coachId] NVARCHAR(1000) NOT NULL,
    [seekerId] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [matchScore] FLOAT(53) NOT NULL,
    [matchReason] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CoachMatch_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [CoachMatch_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Conversation] (
    [id] NVARCHAR(1000) NOT NULL,
    [coachId] NVARCHAR(1000) NOT NULL,
    [seekerId] NVARCHAR(1000) NOT NULL,
    [matchId] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Conversation_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Conversation_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Conversation_matchId_key] UNIQUE NONCLUSTERED ([matchId])
);

-- CreateTable
CREATE TABLE [dbo].[Message] (
    [id] NVARCHAR(1000) NOT NULL,
    [conversationId] NVARCHAR(1000) NOT NULL,
    [senderId] NVARCHAR(1000) NOT NULL,
    [content] TEXT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Message_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Message_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[CoachMatch] ADD CONSTRAINT [CoachMatch_coachId_fkey] FOREIGN KEY ([coachId]) REFERENCES [dbo].[Coach]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CoachMatch] ADD CONSTRAINT [CoachMatch_seekerId_fkey] FOREIGN KEY ([seekerId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Conversation] ADD CONSTRAINT [Conversation_coachId_fkey] FOREIGN KEY ([coachId]) REFERENCES [dbo].[Coach]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Conversation] ADD CONSTRAINT [Conversation_seekerId_fkey] FOREIGN KEY ([seekerId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Conversation] ADD CONSTRAINT [Conversation_matchId_fkey] FOREIGN KEY ([matchId]) REFERENCES [dbo].[CoachMatch]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_conversationId_fkey] FOREIGN KEY ([conversationId]) REFERENCES [dbo].[Conversation]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_senderId_fkey] FOREIGN KEY ([senderId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
