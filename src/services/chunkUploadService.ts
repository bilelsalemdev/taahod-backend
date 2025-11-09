import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import logger from '../utils/logger';

interface ChunkMetadata {
  uploadId: string;
  filename: string;
  totalChunks: number;
  uploadedChunks: Set<number>;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

class ChunkUploadService {
  private uploads: Map<string, ChunkMetadata> = new Map();
  private tempDir: string;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.tempDir = path.join(__dirname, '../../uploads/temp');
    this.ensureTempDir();
    
    // Cleanup old uploads every hour
    this.cleanupInterval = setInterval(() => this.cleanupOldUploads(), 3600000);
  }

  private ensureTempDir(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Initialize a new chunked upload
   */
  initializeUpload(filename: string, totalChunks: number, fileSize: number, mimeType: string): string {
    const uploadId = crypto.randomBytes(16).toString('hex');
    
    this.uploads.set(uploadId, {
      uploadId,
      filename,
      totalChunks,
      uploadedChunks: new Set(),
      fileSize,
      mimeType,
      createdAt: new Date(),
    });

    // Create upload directory
    const uploadDir = path.join(this.tempDir, uploadId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    logger.info(`Initialized chunked upload: ${uploadId} for ${filename}`);
    return uploadId;
  }

  /**
   * Save a chunk
   */
  async saveChunk(uploadId: string, chunkIndex: number, chunkData: Buffer): Promise<void> {
    const metadata = this.uploads.get(uploadId);
    if (!metadata) {
      throw new Error('Upload not found');
    }

    const chunkPath = path.join(this.tempDir, uploadId, `chunk_${chunkIndex}`);
    await fs.promises.writeFile(chunkPath, chunkData);
    
    metadata.uploadedChunks.add(chunkIndex);
    logger.debug(`Saved chunk ${chunkIndex + 1}/${metadata.totalChunks} for upload ${uploadId}`);
  }

  /**
   * Check if upload is complete
   */
  isUploadComplete(uploadId: string): boolean {
    const metadata = this.uploads.get(uploadId);
    if (!metadata) {
      return false;
    }
    return metadata.uploadedChunks.size === metadata.totalChunks;
  }

  /**
   * Get upload progress
   */
  getProgress(uploadId: string): { uploaded: number; total: number; percentage: number } | null {
    const metadata = this.uploads.get(uploadId);
    if (!metadata) {
      return null;
    }

    const uploaded = metadata.uploadedChunks.size;
    const total = metadata.totalChunks;
    const percentage = Math.round((uploaded / total) * 100);

    return { uploaded, total, percentage };
  }

  /**
   * Merge all chunks into final file
   */
  async mergeChunks(uploadId: string, destinationPath: string): Promise<void> {
    const metadata = this.uploads.get(uploadId);
    if (!metadata) {
      throw new Error('Upload not found');
    }

    if (!this.isUploadComplete(uploadId)) {
      throw new Error('Upload not complete');
    }

    const uploadDir = path.join(this.tempDir, uploadId);
    const writeStream = fs.createWriteStream(destinationPath);

    try {
      // Merge chunks in order
      for (let i = 0; i < metadata.totalChunks; i++) {
        const chunkPath = path.join(uploadDir, `chunk_${i}`);
        const chunkData = await fs.promises.readFile(chunkPath);
        writeStream.write(chunkData);
      }

      writeStream.end();

      // Wait for write to complete
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve());
        writeStream.on('error', reject);
      });

      logger.info(`Merged ${metadata.totalChunks} chunks for upload ${uploadId}`);

      // Cleanup temp files
      await this.cleanupUpload(uploadId);
    } catch (error) {
      writeStream.destroy();
      throw error;
    }
  }

  /**
   * Get upload metadata
   */
  getMetadata(uploadId: string): ChunkMetadata | undefined {
    return this.uploads.get(uploadId);
  }

  /**
   * Cleanup a specific upload
   */
  async cleanupUpload(uploadId: string): Promise<void> {
    const uploadDir = path.join(this.tempDir, uploadId);
    
    try {
      if (fs.existsSync(uploadDir)) {
        await fs.promises.rm(uploadDir, { recursive: true, force: true });
      }
      this.uploads.delete(uploadId);
      logger.debug(`Cleaned up upload ${uploadId}`);
    } catch (error) {
      logger.error(`Failed to cleanup upload ${uploadId}:`, error);
    }
  }

  /**
   * Cleanup uploads older than 24 hours
   */
  private async cleanupOldUploads(): Promise<void> {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [uploadId, metadata] of this.uploads.entries()) {
      const age = now.getTime() - metadata.createdAt.getTime();
      if (age > maxAge) {
        await this.cleanupUpload(uploadId);
        logger.info(`Cleaned up old upload ${uploadId}`);
      }
    }
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

export default new ChunkUploadService();
