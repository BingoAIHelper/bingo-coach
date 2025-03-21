/*
  Warnings:

  - You are about to drop the `Coach` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[applications] DROP CONSTRAINT [applications_userId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[assessments] DROP CONSTRAINT [assessments_userId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[coach_matches] DROP CONSTRAINT [coach_matches_coach_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[coach_matches] DROP CONSTRAINT [coach_matches_coach_user_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[coach_matches] DROP CONSTRAINT [coach_matches_seeker_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[conversations] DROP CONSTRAINT [conversations_coachId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[conversations] DROP CONSTRAINT [conversations_seekerId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[documents] DROP CONSTRAINT [documents_userId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[messages] DROP CONSTRAINT [messages_receiver_user_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[messages] DROP CONSTRAINT [messages_sender_user_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[resumes] DROP CONSTRAINT [resumes_userId_fkey];

-- DropTable
DROP TABLE [dbo].[Coach];

-- DropTable
DROP TABLE [dbo].[User];

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [firstName] NVARCHAR(1000) NOT NULL,
    [lastName] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [users_role_df] DEFAULT 'seeker',
    [isCoach] BIT NOT NULL CONSTRAINT [users_isCoach_df] DEFAULT 0,
    [bio] NVARCHAR(1000),
    [location] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    [lastActive] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [experience] NVARCHAR(1000),
    [expertise] TEXT,
    [specialties] TEXT,
    [yearsExperience] INT,
    [industries] TEXT,
    [coachingStyle] NVARCHAR(1000),
    [hourlyRate] FLOAT(53),
    [availability] TEXT,
    [languages] TEXT,
    [certifications] TEXT,
    [rating] FLOAT(53),
    [totalReviews] INT NOT NULL CONSTRAINT [users_totalReviews_df] DEFAULT 0,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[coaches] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [bio] TEXT,
    [expertise] TEXT,
    [specialties] TEXT,
    [industries] TEXT,
    [languages] TEXT,
    [certifications] TEXT,
    [profileImage] NVARCHAR(1000),
    [hourlyRate] FLOAT(53),
    [rating] FLOAT(53),
    [availability] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [coaches_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [coaches_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [coaches_email_key] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [coaches_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- AddForeignKey
ALTER TABLE [dbo].[coaches] ADD CONSTRAINT [coaches_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[resumes] ADD CONSTRAINT [resumes_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[assessments] ADD CONSTRAINT [assessments_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[applications] ADD CONSTRAINT [applications_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[documents] ADD CONSTRAINT [documents_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[coach_matches] ADD CONSTRAINT [coach_matches_coach_fkey] FOREIGN KEY ([coachId]) REFERENCES [dbo].[coaches]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[coach_matches] ADD CONSTRAINT [coach_matches_seeker_fkey] FOREIGN KEY ([seekerId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[conversations] ADD CONSTRAINT [conversations_coachId_fkey] FOREIGN KEY ([coachId]) REFERENCES [dbo].[coaches]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[conversations] ADD CONSTRAINT [conversations_seekerId_fkey] FOREIGN KEY ([seekerId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[messages] ADD CONSTRAINT [messages_sender_user_fkey] FOREIGN KEY ([senderId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[messages] ADD CONSTRAINT [messages_receiver_user_fkey] FOREIGN KEY ([receiverId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
