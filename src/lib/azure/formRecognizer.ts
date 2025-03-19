import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";

// Get environment variables
const apiKey = process.env.AZURE_FORM_RECOGNIZER_KEY || "";
const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT || "";

if (!apiKey || !endpoint) {
  console.error("Azure Form Recognizer credentials not configured properly");
}

/**
 * Creates and returns a Document Analysis client for Azure Form Recognizer
 */
export function getDocumentAnalysisClient() {
  if (!apiKey || !endpoint) {
    throw new Error("Azure Form Recognizer credentials not configured properly");
  }
  
  return new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
}

/**
 * Analyzes a document using the Azure Form Recognizer service
 * @param documentUrl - URL of the document to analyze
 * @param modelId - The model ID to use for analysis (default: "prebuilt-document")
 * @returns Analysis results
 */
export async function analyzeDocument(documentUrl: string, modelId: string = "prebuilt-document") {
  try {
    console.log(`Analyzing document at URL: ${documentUrl}`);
    
    // Determine the appropriate model based on file extension
    // This helps with specialized handling for different file types
    const fileExtension = documentUrl.split('.').pop()?.toLowerCase();
    let selectedModelId = modelId;
    
    if (fileExtension === 'docx') {
      // Use prebuilt-read for Word documents which might work better
      selectedModelId = "prebuilt-read";
      console.log(`Detected DOCX file, using ${selectedModelId} model`);
    } else if (fileExtension === 'pdf') {
      // Use prebuilt-document for PDFs
      selectedModelId = "prebuilt-document";
      console.log(`Detected PDF file, using ${selectedModelId} model`);
    } else {
      console.log(`Using default model ${selectedModelId} for file type: ${fileExtension}`);
    }
    
    console.log(`Using endpoint: ${endpoint}`);
    console.log(`API Key is set: ${apiKey ? 'Yes' : 'No'}`);
    
    const client = getDocumentAnalysisClient();
    
    // Configure options for the analysis
    const options = {
      // Enable features that can help with certain file types
      pages: "1-",  // Analyze all pages
      locale: "en-US"  // Set language
    };
    
    console.log(`Starting document analysis with model: ${selectedModelId}...`);
    const poller = await client.beginAnalyzeDocumentFromUrl(selectedModelId, documentUrl, options);
    
    console.log("Waiting for analysis to complete...");
    const result = await poller.pollUntilDone();
    
    console.log("Analysis completed successfully");
    
    // Handle the result even if it's partially successful
    if (!result || (!result.content && (!result.documents || result.documents.length === 0))) {
      console.log("Warning: Analysis completed but returned limited results");
    }
    
    return result;
  } catch (error) {
    console.error("Error analyzing document:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    // Create a simplified error result so we have something to store
    const errorResult = {
      error: true,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      content: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      documents: [],
      pages: [],
      tables: [],
      paragraphs: []
    };
    
    return errorResult;
  }
}

/**
 * Extracts text content from a document analysis result
 * @param analysisResult - The document analysis result
 * @returns Extracted text content
 */
export function extractTextContent(analysisResult: any): string {
  if (!analysisResult || !analysisResult.content) {
    return "";
  }
  
  return analysisResult.content;
}

/**
 * Extracts structured data from a document analysis result
 * @param analysisResult - The document analysis result
 * @returns Extracted structured data
 */
export function extractStructuredData(analysisResult: any): any {
  if (!analysisResult || !analysisResult.documents || analysisResult.documents.length === 0) {
    return {};
  }
  
  // Return the first document's fields
  return analysisResult.documents[0].fields;
}