import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Google Drive Service for uploading PDFs
 */
@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);
  private drive: any;

  constructor(private configService: ConfigService) {
    this.initializeDrive();
  }

  /**
   * Initialize Google Drive API
   */
  private async initializeDrive() {
    try {
      const credentials = this.configService.get('GOOGLE_CREDENTIALS');
      if (!credentials) {
        this.logger.warn('Google credentials not configured. Drive upload will be disabled.');
        return;
      }

      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(credentials),
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });

      this.drive = google.drive({ version: 'v3', auth });
      this.logger.log('Google Drive API initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Google Drive API', error);
    }
  }

  /**
   * Upload PDF to Google Drive
   * Creates folder structure: /Profema/Pacientky/[Last Name First Name]
   */
  async uploadPdfToDrive(
    pdfBuffer: Buffer,
    fileName: string,
    patientName: string,
  ): Promise<string> {
    if (!this.drive) {
      this.logger.warn('Google Drive not initialized, skipping upload');
      return null;
    }

    try {
      // 1. Find or create Profema folder
      const profemaFolderId = await this.findOrCreateFolder('Profema', 'root');

      // 2. Find or create Pacientky folder
      const pacientkyFolderId = await this.findOrCreateFolder('Pacientky', profemaFolderId);

      // 3. Find or create patient folder
      const patientFolderId = await this.findOrCreateFolder(patientName, pacientkyFolderId);

      // 4. Upload PDF file
      const fileMetadata = {
        name: fileName,
        parents: [patientFolderId],
      };

      const media = {
        mimeType: 'application/pdf',
        body: require('stream').Readable.from(pdfBuffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      });

      this.logger.log(`PDF uploaded to Google Drive: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      this.logger.error('Failed to upload PDF to Google Drive', error);
      throw error;
    }
  }

  /**
   * Find or create a folder in Google Drive
   */
  private async findOrCreateFolder(folderName: string, parentId: string): Promise<string> {
    // Search for existing folder
    const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentId}' in parents and trashed=false`;

    const response = await this.drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (response.data.files && response.data.files.length > 0) {
      // Folder exists
      return response.data.files[0].id;
    }

    // Create new folder
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    };

    const folder = await this.drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    this.logger.log(`Created folder: ${folderName} (${folder.data.id})`);
    return folder.data.id;
  }

  /**
   * Get file URL
   */
  async getFileUrl(fileId: string): Promise<string> {
    if (!this.drive || !fileId) {
      return null;
    }

    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'webViewLink',
      });

      return response.data.webViewLink;
    } catch (error) {
      this.logger.error('Failed to get file URL', error);
      return null;
    }
  }
}
