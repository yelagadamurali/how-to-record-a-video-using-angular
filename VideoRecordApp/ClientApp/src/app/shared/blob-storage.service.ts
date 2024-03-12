import { Injectable } from '@angular/core';
import { BlobServiceClient } from '@azure/storage-blob';

@Injectable({
  providedIn: 'root'
})
export class BlobStorageService {

  constructor() { }

  async uploadVideo(blob: Blob, sasToken: string, folderName: string, fileName: string): Promise<boolean> {
    try {
      const blobServiceClient = new BlobServiceClient(`${sasToken}`);
      const containerClient = blobServiceClient.getContainerClient(folderName);
      const filename = fileName;
      const blockBlobClient = containerClient.getBlockBlobClient(filename);
      await blockBlobClient.uploadData(blob);
      return true;
    } catch (error) {
      console.error('Error uploading video to Blob storage:', error);
      return false;
    }
  }

  
}
