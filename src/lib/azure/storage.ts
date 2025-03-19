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
    console.log(`Uploading file with name: ${fileName}`);
    console.log(`Using container: ${containerName}`);
    console.log(`Connection string is set: ${connectionString ? 'Yes' : 'No'}`);

    // Create the container if it doesn't exist
    try {
      console.log(`Checking if container ${containerName} exists...`);
      await containerClient.createIfNotExists();
      console.log(`Container ${containerName} is ready`);
    } catch (containerError) {
      console.error("Error creating container:", containerError);
      // Continue even if container creation fails, it might already exist
    }
    
    // Use the fileName directly as the blob name instead of creating a new one
    const blobName = fileName;
    console.log(`Using blob name: ${blobName}`);
    
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Upload data to the blob
    console.log(`Uploading file of size: ${file.length} bytes`);
    await blockBlobClient.upload(file, file.length);
    
    // Generate a SAS token with read permissions that lasts 24 hours
    const expiresOn = new Date();
    expiresOn.setHours(expiresOn.getHours() + 24);
    
    const sasPermissions = new BlobSASPermissions();
    sasPermissions.read = true;
    
    console.log("Generating SAS URL for Form Recognizer to access the blob");
    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: sasPermissions,
      expiresOn
    });
    
    console.log(`Generated SAS URL: ${sasUrl}`);
    
    // Return the SAS URL instead of the regular URL
    return sasUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
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
    console.log(`Attempting to delete blob at URL: ${blobUrl}`);
    
    // For SAS URLs, we need to handle them differently
    if (blobUrl.includes('?')) {
      // This is likely a SAS URL, so extract the blob path before the query params
      const urlWithoutParams = blobUrl.split('?')[0];
      console.log(`Extracted URL without SAS params: ${urlWithoutParams}`);
      
      const url = new URL(urlWithoutParams);
      
      // Extract just the blob path portion
      const pathParts = url.pathname.split('/');
      const containerPart = pathParts[1]; // First segment after domain should be container
      
      // The blob path is everything after the container name
      const blobPath = pathParts.slice(2).join('/');
      console.log(`Extracted container: ${containerPart}, blob path: ${blobPath}`);
      
      // Get a block blob client
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
      console.log(`Deleting blob at path: ${blobPath}`);
      
      // Check if blob exists before deleting
      const exists = await blockBlobClient.exists();
      if (!exists) {
        console.log(`Blob does not exist at path: ${blobPath}`);
        return; // Skip deletion if blob doesn't exist
      }
      
      // Delete the blob
      await blockBlobClient.delete();
      console.log(`Successfully deleted blob at path: ${blobPath}`);
    } else {
      // This is a regular URL, handle as before
      const url = new URL(blobUrl);
      
      // Extract the blob name - need to handle various formats
      let blobName;
      if (url.pathname.includes(containerName)) {
        // If the container name is in the path, extract everything after it
        const containerIndex = url.pathname.indexOf(containerName);
        blobName = url.pathname.substring(containerIndex + containerName.length + 1);
      } else {
        // Otherwise just use the path directly
        blobName = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
      }
      
      console.log(`Extracted blob name for deletion: ${blobName}`);
      
      // Get a block blob client
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      // Check if blob exists before deleting
      const exists = await blockBlobClient.exists();
      if (!exists) {
        console.log(`Blob does not exist at path: ${blobName}`);
        return; // Skip deletion if blob doesn't exist
      }
      
      // Delete the blob
      await blockBlobClient.delete();
      console.log(`Successfully deleted blob at path: ${blobName}`);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    // Log the error but don't throw, so the document can still be deleted from the database
    console.error("Delete operation will continue for database record");
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