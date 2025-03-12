import { BlobServiceClient, ContainerClient, BlobSASPermissions } from "@azure/storage-blob";

// Initialize Storage client
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
const containerName = process.env.AZURE_STORAGE_CONTAINER || "bingo-container";

// Initialize the BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Get a reference to a container
const containerClient = blobServiceClient.getContainerClient(containerName);

/**
 * Upload a file to Azure Blob Storage
 * @param file The file to upload
 * @param fileName The name to give the file in storage
 * @returns The URL of the uploaded file
 */
export async function uploadFile(file: Buffer, fileName: string): Promise<string> {
  try {
    // Create a unique name for the blob
    const blobName = `${Date.now()}-${fileName}`;
    
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Upload data to the blob
    await blockBlobClient.upload(file, file.length);
    
    // Return the URL to the blob
    return blockBlobClient.url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * Upload a resume file to Azure Blob Storage
 * @param file The resume file to upload
 * @param userId The ID of the user who owns the resume
 * @param fileName The original file name
 * @returns The URL of the uploaded resume
 */
export async function uploadResume(file: Buffer, userId: string, fileName: string): Promise<string> {
  try {
    // Create a unique name for the blob
    const extension = fileName.split('.').pop();
    const blobName = `resumes/${userId}/${Date.now()}.${extension}`;
    
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Upload data to the blob
    await blockBlobClient.upload(file, file.length);
    
    // Return the URL to the blob
    return blockBlobClient.url;
  } catch (error) {
    console.error("Error uploading resume:", error);
    throw error;
  }
}

/**
 * Delete a file from Azure Blob Storage
 * @param blobUrl The URL of the blob to delete
 */
export async function deleteFile(blobUrl: string): Promise<void> {
  try {
    // Extract the blob name from the URL
    const url = new URL(blobUrl);
    const blobName = url.pathname.substring(containerName.length + 2); // +2 for the leading slash and trailing slash
    
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Delete the blob
    await blockBlobClient.delete();
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

/**
 * List all files in a directory
 * @param directory The directory to list files from
 * @returns An array of blob URLs
 */
export async function listFiles(directory: string): Promise<string[]> {
  try {
    const fileUrls: string[] = [];
    
    // List all blobs in the directory
    for await (const blob of containerClient.listBlobsFlat({ prefix: directory })) {
      const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
      fileUrls.push(blockBlobClient.url);
    }
    
    return fileUrls;
  } catch (error) {
    console.error(`Error listing files in directory ${directory}:`, error);
    return [];
  }
}

/**
 * Get a shared access signature (SAS) URL for a blob
 * @param blobUrl The URL of the blob
 * @param expiresInMinutes How long the SAS should be valid for (in minutes)
 * @returns The SAS URL
 */
export async function getSasUrl(blobUrl: string, expiresInMinutes: number = 60): Promise<string> {
  try {
    // Extract the blob name from the URL
    const url = new URL(blobUrl);
    const blobName = url.pathname.substring(containerName.length + 2); // +2 for the leading slash and trailing slash
    
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Create a SAS token that expires in the specified time
    const expiresOn = new Date();
    expiresOn.setMinutes(expiresOn.getMinutes() + expiresInMinutes);
    
    const sasPermissions = new BlobSASPermissions();
    sasPermissions.read = true;
    
    const sasToken = await blockBlobClient.generateSasUrl({
      permissions: sasPermissions,
      expiresOn
    });
    
    return sasToken;
  } catch (error) {
    console.error("Error generating SAS URL:", error);
    throw error;
  }
} 