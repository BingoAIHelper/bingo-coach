BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [firstName] NVARCHAR(1000) NOT NULL,
    [lastName] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'seeker',
    [isCoach] BIT NOT NULL CONSTRAINT [User_isCoach_df] DEFAULT 0,
    [bio] NVARCHAR(1000),
    [location] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    [lastActive] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
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
    [totalReviews] INT NOT NULL CONSTRAINT [User_totalReviews_df] DEFAULT 0,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Job] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [company] NVARCHAR(1000) NOT NULL,
    [location] NVARCHAR(1000) NOT NULL,
    [description] TEXT NOT NULL,
    [requirements] TEXT NOT NULL,
    [salary] NVARCHAR(1000),
    [contactEmail] NVARCHAR(1000),
    [contactPhone] NVARCHAR(1000),
    [postedDate] DATETIME2 NOT NULL CONSTRAINT [Job_postedDate_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Job_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Coach] (
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
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Coach_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Coach_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Coach_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[resumes] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [content] TEXT NOT NULL,
    [file] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [resumes_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [resumes_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[assessments] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [score] INT,
    [feedback] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [assessments_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [assessments_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[applications] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [jobId] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [coverLetter] TEXT,
    [resumeId] NVARCHAR(1000),
    [feedback] TEXT,
    [submittedDate] DATETIME2 NOT NULL CONSTRAINT [applications_submittedDate_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [applications_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[documents] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [fileName] NVARCHAR(1000) NOT NULL,
    [fileUrl] NVARCHAR(1000) NOT NULL,
    [fileType] NVARCHAR(1000) NOT NULL,
    [fileSize] INT NOT NULL,
    [analyzeStatus] NVARCHAR(1000) NOT NULL CONSTRAINT [documents_analyzeStatus_df] DEFAULT 'pending',
    [analyzeResults] TEXT,
    [analyzeError] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [documents_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [documents_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[coach_matches] (
    [id] NVARCHAR(1000) NOT NULL,
    [coachId] NVARCHAR(1000) NOT NULL,
    [seekerId] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [matchScore] FLOAT(53) NOT NULL,
    [matchReason] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [coach_matches_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [coach_matches_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[conversations] (
    [id] NVARCHAR(1000) NOT NULL,
    [coachId] NVARCHAR(1000) NOT NULL,
    [seekerId] NVARCHAR(1000) NOT NULL,
    [matchId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [conversations_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [conversations_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [conversations_matchId_key] UNIQUE NONCLUSTERED ([matchId])
);

-- CreateTable
CREATE TABLE [dbo].[messages] (
    [id] NVARCHAR(1000) NOT NULL,
    [conversationId] NVARCHAR(1000) NOT NULL,
    [senderId] NVARCHAR(1000) NOT NULL,
    [receiverId] NVARCHAR(1000) NOT NULL,
    [content] TEXT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [messages_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [messages_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[resumes] ADD CONSTRAINT [resumes_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[assessments] ADD CONSTRAINT [assessments_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[applications] ADD CONSTRAINT [applications_jobId_fkey] FOREIGN KEY ([jobId]) REFERENCES [dbo].[Job]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[applications] ADD CONSTRAINT [applications_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[documents] ADD CONSTRAINT [documents_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[coach_matches] ADD CONSTRAINT [coach_matches_coach_fkey] FOREIGN KEY ([coachId]) REFERENCES [dbo].[Coach]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[coach_matches] ADD CONSTRAINT [coach_matches_seeker_fkey] FOREIGN KEY ([seekerId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[coach_matches] ADD CONSTRAINT [coach_matches_coach_user_fkey] FOREIGN KEY ([coachId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[conversations] ADD CONSTRAINT [conversations_coachId_fkey] FOREIGN KEY ([coachId]) REFERENCES [dbo].[Coach]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[conversations] ADD CONSTRAINT [conversations_seekerId_fkey] FOREIGN KEY ([seekerId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[conversations] ADD CONSTRAINT [conversations_matchId_fkey] FOREIGN KEY ([matchId]) REFERENCES [dbo].[coach_matches]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[messages] ADD CONSTRAINT [messages_conversation_fkey] FOREIGN KEY ([conversationId]) REFERENCES [dbo].[conversations]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[messages] ADD CONSTRAINT [messages_sender_user_fkey] FOREIGN KEY ([senderId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[messages] ADD CONSTRAINT [messages_receiver_user_fkey] FOREIGN KEY ([receiverId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
