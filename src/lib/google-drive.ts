/**
 * Google Drive Client Library
 *
 * This library provides functions to interact with Google Drive API using OAuth2.
 * It handles authentication, file operations, and folder management.
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Types
export interface TokenInfo {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  scope: string;
  token_type: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink?: string;
  size?: number;
  createdTime: string;
  modifiedTime: string;
  parents?: string[];
  thumbnailLink?: string;
}

export interface UploadOptions {
  folderId?: string;
  mimeType?: string;
  description?: string;
  onProgress?: (progress: number) => void;
}

export interface CreateFolderOptions {
  parentId?: string;
  description?: string;
}

export interface ShareOptions {
  role: 'reader' | 'writer' | 'commenter' | 'owner';
  notify?: boolean;
  emailMessage?: string;
}

// Environment variables (must be set in .env)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Validate environment variables
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.warn('Google Drive environment variables not set. Google Drive integration will not work.');
}

// OAuth2 scopes for Google Drive
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file', // Access to files created by this app
  'https://www.googleapis.com/auth/drive.readonly', // Read access to user's Drive
];

/**
 * Create OAuth2 client with credentials
 */
export function createOAuth2Client(): OAuth2Client {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google Drive credentials not configured');
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

/**
 * Generate Google OAuth authorization URL
 * @param state - State parameter for CSRF protection
 * @returns Authorization URL
 */
export async function getAuthUrl(state: string): Promise<string> {
  const oauth2Client = createOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Get refresh token
    scope: SCOPES,
    state,
    prompt: 'consent', // Force consent to get refresh token
  });

  return authUrl;
}

/**
 * Exchange authorization code for access and refresh tokens
 * @param code - Authorization code from OAuth callback
 * @returns Token information
 */
export async function exchangeCodeForToken(code: string): Promise<TokenInfo> {
  try {
    const oauth2Client = createOAuth2Client();

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Invalid token response from Google');
    }

    // Validate required fields
    const tokenInfo: TokenInfo = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token!,
      expiry_date: tokens.expiry_date || Date.now() + ((tokens as any).expires_in || 3600) * 1000,
      scope: tokens.scope || SCOPES.join(' '),
      token_type: tokens.token_type || 'Bearer',
    };

    return tokenInfo;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw new Error('Failed to exchange authorization code for tokens');
  }
}

/**
 * Refresh access token using refresh token
 * @param refreshToken - Refresh token
 * @returns New token information
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenInfo> {
  try {
    const oauth2Client = createOAuth2Client();

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error('No access token returned from refresh');
    }

    const tokenInfo: TokenInfo = {
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token || refreshToken,
      expiry_date: credentials.expiry_date || Date.now() + ((credentials as any).expires_in || 3600) * 1000,
      scope: credentials.scope || SCOPES.join(' '),
      token_type: credentials.token_type || 'Bearer',
    };

    return tokenInfo;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw new Error('Failed to refresh access token');
  }
}

/**
 * Check if token is expired or will expire soon (within 5 minutes)
 * @param expiryDate - Token expiry date in milliseconds
 * @returns True if token is expired or will expire soon
 */
export function isTokenExpired(expiryDate: number): boolean {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes buffer
  return now + fiveMinutes >= expiryDate;
}

/**
 * Create authenticated Google Drive API client
 * @param accessToken - OAuth2 access token
 * @returns Google Drive API client
 */
export function createDriveClient(accessToken: string) {
  const auth = new OAuth2Client();
  auth.setCredentials({
    access_token: accessToken,
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * Upload file to Google Drive
 * @param file - File to upload
 * @param folderId - Parent folder ID (optional)
 * @param accessToken - OAuth2 access token
 * @param options - Upload options
 * @returns Uploaded file information
 */
export async function uploadFile(
  file: File | Buffer,
  folderId: string,
  accessToken: string,
  options: UploadOptions = {}
): Promise<DriveFile> {
  try {
    const drive = createDriveClient(accessToken);

    const fileMetadata: any = {
      name: file instanceof File ? file.name : 'unnamed',
    };

    if (folderId || options.folderId) {
      fileMetadata.parents = [folderId || options.folderId!];
    }

    if (options.description) {
      fileMetadata.description = options.description;
    }

    const media: any = {
      mimeType: options.mimeType || (file instanceof File ? file.type : 'application/octet-stream'),
      body: file,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,name,mimeType,webViewLink,webContentLink,size,createdTime,modifiedTime,parents,thumbnailLink',
    });

    if (!response.data) {
      throw new Error('No data returned from Drive API');
    }

    return mapDriveFile(response.data);
  } catch (error) {
    console.error('Error uploading file to Drive:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download file from Google Drive
 * @param fileId - Google Drive file ID
 * @param accessToken - OAuth2 access token
 * @returns File buffer and metadata
 */
export async function downloadFile(
  fileId: string,
  accessToken: string
): Promise<{ buffer: Buffer; metadata: DriveFile }> {
  try {
    const drive = createDriveClient(accessToken);

    // Get file metadata
    const fileResponse = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime,parents',
    });

    if (!fileResponse.data) {
      throw new Error('File not found');
    }

    // Download file content
    const contentResponse = await drive.files.get(
      {
        fileId,
        alt: 'media',
      },
      { responseType: 'stream' }
    );

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      (contentResponse.data as any).on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      (contentResponse.data as any).on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          buffer,
          metadata: mapDriveFile(fileResponse.data),
        });
      });

      (contentResponse.data as any).on('error', (error: Error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error downloading file from Drive:', error);
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create folder in Google Drive
 * @param name - Folder name
 * @param parentId - Parent folder ID (optional)
 * @param accessToken - OAuth2 access token
 * @param options - Create folder options
 * @returns Created folder information
 */
export async function createFolder(
  name: string,
  parentId: string,
  accessToken: string,
  options: CreateFolderOptions = {}
): Promise<DriveFile> {
  try {
    const drive = createDriveClient(accessToken);

    const fileMetadata: any = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentId || options.parentId) {
      fileMetadata.parents = [parentId || options.parentId!];
    }

    if (options.description) {
      fileMetadata.description = options.description;
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id,name,mimeType,webViewLink,createdTime,modifiedTime,parents',
    });

    if (!response.data) {
      throw new Error('No data returned from Drive API');
    }

    return mapDriveFile(response.data);
  } catch (error) {
    console.error('Error creating folder in Drive:', error);
    throw new Error(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Share folder or file with email
 * @param fileId - File or folder ID
 * @param email - Email address to share with
 * @param role - Permission role (reader, writer, commenter, owner)
 * @param accessToken - OAuth2 access token
 * @param options - Share options
 */
export async function shareFolder(
  fileId: string,
  email: string,
  role: ShareOptions['role'],
  accessToken: string,
  options: Partial<ShareOptions> = {}
): Promise<void> {
  try {
    const drive = createDriveClient(accessToken);

    const permission = {
      type: 'user',
      role,
      emailAddress: email,
    };

    await drive.permissions.create({
      fileId,
      requestBody: permission,
      sendNotificationEmail: options.notify !== false,
      emailMessage: options.emailMessage,
    });

    console.log(`Successfully shared ${fileId} with ${email} as ${role}`);
  } catch (error) {
    console.error('Error sharing folder:', error);
    throw new Error(`Failed to share folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List files in a folder
 * @param folderId - Folder ID (root for entire drive)
 * @param accessToken - OAuth2 access token
 * @returns List of files
 */
export async function listFiles(folderId: string, accessToken: string): Promise<DriveFile[]> {
  try {
    const drive = createDriveClient(accessToken);

    const query = folderId === 'root'
      ? "'root' in parents"
      : `'${folderId}' in parents`;

    const response = await drive.files.list({
      q: query,
      fields: 'files(id,name,mimeType,webViewLink,webContentLink,size,createdTime,modifiedTime,parents,thumbnailLink)',
      orderBy: 'createdTime desc',
      pageSize: 100,
    });

    const files = response.data.files || [];
    return files.map(mapDriveFile);
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete file or folder from Google Drive
 * @param fileId - File or folder ID
 * @param accessToken - OAuth2 access token
 */
export async function deleteFile(fileId: string, accessToken: string): Promise<void> {
  try {
    const drive = createDriveClient(accessToken);

    await drive.files.delete({
      fileId,
    });

    console.log(`Successfully deleted file ${fileId}`);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get file information
 * @param fileId - File or folder ID
 * @param accessToken - OAuth2 access token
 * @returns File information
 */
export async function getFileInfo(fileId: string, accessToken: string): Promise<DriveFile> {
  try {
    const drive = createDriveClient(accessToken);

    const response = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,webViewLink,webContentLink,size,createdTime,modifiedTime,parents,thumbnailLink,description',
    });

    if (!response.data) {
      throw new Error('File not found');
    }

    return mapDriveFile(response.data);
  } catch (error) {
    console.error('Error getting file info:', error);
    throw new Error(`Failed to get file info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search files by name
 * @param query - Search query
 * @param accessToken - OAuth2 access token
 * @returns List of matching files
 */
export async function searchFiles(query: string, accessToken: string): Promise<DriveFile[]> {
  try {
    const drive = createDriveClient(accessToken);

    const response = await drive.files.list({
      q: `name contains '${query}'`,
      fields: 'files(id,name,mimeType,webViewLink,webContentLink,size,createdTime,modifiedTime,parents,thumbnailLink)',
      orderBy: 'createdTime desc',
      pageSize: 50,
    });

    const files = response.data.files || [];
    return files.map(mapDriveFile);
  } catch (error) {
    console.error('Error searching files:', error);
    throw new Error(`Failed to search files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create project folder structure in Google Drive
 * @param orderId - Order ID
 * @param accessToken - OAuth2 access token
 * @returns Object with folder IDs
 */
export async function createProjectFolders(
  orderId: string,
  accessToken: string
): Promise<{
  orderFolder: DriveFile;
  documentsFolder: DriveFile;
  imagesFolder: DriveFile;
  videosFolder: DriveFile;
  chatsFolder: DriveFile;
}> {
  try {
    // First, ensure ARCHI-COLL root folder exists
    const drive = createDriveClient(accessToken);

    // Search for ARCHI-COLL root folder
    let rootFolderId: string | undefined;
    const rootSearch = await drive.files.list({
      q: "name = 'ARCHI-COLL' and mimeType = 'application/vnd.google-apps.folder'",
      fields: 'files(id,name)',
    });

    if (rootSearch.data.files && rootSearch.data.files.length > 0) {
      rootFolderId = rootSearch.data.files[0].id;
    } else {
      // Create root folder
      const rootFolder = await createFolder('ARCHI-COLL', 'root', accessToken);
      rootFolderId = rootFolder.id;
    }

    // Create Orders folder
    let ordersFolderId: string | undefined;
    const ordersSearch = await drive.files.list({
      q: `name = 'Orders' and '${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
      fields: 'files(id,name)',
    });

    if (ordersSearch.data.files && ordersSearch.data.files.length > 0) {
      ordersFolderId = ordersSearch.data.files[0].id;
    } else {
      const ordersFolder = await createFolder('Orders', rootFolderId!, accessToken);
      ordersFolderId = ordersFolder.id;
    }

    // Create order-specific folder
    const orderFolder = await createFolder(`Order-${orderId}`, ordersFolderId!, accessToken);

    // Create subfolders
    const documentsFolder = await createFolder('Documents', orderFolder.id, accessToken);
    const imagesFolder = await createFolder('Images', orderFolder.id, accessToken);
    const videosFolder = await createFolder('Videos', orderFolder.id, accessToken);
    const chatsFolder = await createFolder('Chats', orderFolder.id, accessToken);

    return {
      orderFolder,
      documentsFolder,
      imagesFolder,
      videosFolder,
      chatsFolder,
    };
  } catch (error) {
    console.error('Error creating project folders:', error);
    throw new Error(`Failed to create project folders: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Map Google Drive API response to DriveFile interface
 * @param file - Google Drive file object
 * @returns DriveFile object
 */
function mapDriveFile(file: any): DriveFile {
  return {
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    webViewLink: file.webViewLink || '',
    webContentLink: file.webContentLink || undefined,
    size: file.size ? parseInt(file.size, 10) : undefined,
    createdTime: file.createdTime || '',
    modifiedTime: file.modifiedTime || '',
    parents: file.parents || [],
    thumbnailLink: file.thumbnailLink || undefined,
  };
}

/**
 * Get file by name in a folder
 * @param name - File name to search
 * @param folderId - Folder ID to search in
 * @param accessToken - OAuth2 access token
 * @returns File information or null if not found
 */
export async function getFileByName(
  name: string,
  folderId: string,
  accessToken: string
): Promise<DriveFile | null> {
  try {
    const drive = createDriveClient(accessToken);

    const response = await drive.files.list({
      q: `name = '${name}' and '${folderId}' in parents`,
      fields: 'files(id,name,mimeType,webViewLink,webContentLink,size,createdTime,modifiedTime,parents,thumbnailLink)',
      pageSize: 1,
    });

    if (response.data.files && response.data.files.length > 0) {
      return mapDriveFile(response.data.files[0]);
    }

    return null;
  } catch (error) {
    console.error('Error getting file by name:', error);
    throw new Error(`Failed to get file by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
