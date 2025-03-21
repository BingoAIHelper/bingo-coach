BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [firstName] NVARCHAR(1000) NOT NULL,
    [lastName] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL,
    [profileImage] NVARCHAR(1000),
    [bio] NVARCHAR(1000),
    [location] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    [isCoach] BIT NOT NULL CONSTRAINT [User_isCoach_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
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
    [expertise] NVARCHAR(1000),
    [profileImage] NVARCHAR(1000),
    [hourlyRate] FLOAT(53),
    [rating] FLOAT(53),
    [availability] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Coach_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Coach_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Coach_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Resume] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [content] TEXT NOT NULL,
    [file] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Resume_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Resume_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Assessment] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [score] INT,
    [feedback] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Assessment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Assessment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Application] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [jobId] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [coverLetter] TEXT,
    [resumeId] NVARCHAR(1000),
    [feedback] TEXT,
    [submittedDate] DATETIME2 NOT NULL CONSTRAINT [Application_submittedDate_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Application_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Document] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [fileName] NVARCHAR(1000) NOT NULL,
    [fileUrl] NVARCHAR(1000) NOT NULL,
    [fileType] NVARCHAR(1000) NOT NULL,
    [fileSize] INT NOT NULL,
    [analyzeStatus] NVARCHAR(1000) NOT NULL CONSTRAINT [Document_analyzeStatus_df] DEFAULT 'pending',
    [analyzeResults] TEXT,
    [analyzeError] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Document_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Document_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Resume] ADD CONSTRAINT [Resume_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Assessment] ADD CONSTRAINT [Assessment_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Application] ADD CONSTRAINT [Application_jobId_fkey] FOREIGN KEY ([jobId]) REFERENCES [dbo].[Job]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Application] ADD CONSTRAINT [Application_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Document] ADD CONSTRAINT [Document_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
