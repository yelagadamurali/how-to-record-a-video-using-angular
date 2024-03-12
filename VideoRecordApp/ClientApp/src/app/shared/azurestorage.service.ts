import { Injectable } from '@angular/core';
import { BlobClient, BlobServiceClient, BlockBlobClient, BlockBlobUploadOptions, ContainerClient } from '@azure/storage-blob';
import { promises } from 'dns';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AzurestorageService {

  progress: number = 0;

  account = "your_storage_path/url";

  sas = "?sv=2023-11-03&se=2023-11-29T09%3A14%3A42Z&sr=c&sp=w&sig=hkR%2B0EJsfOvGno03PDFEL5nQc2%2FiBIFXNRmqnDKwPCg%3D";

  blobServiceClient = new BlobServiceClient(`https://${this.account}${this.sas}`);

  containerName = "your_containerName";
  constructor() {

  }

  private uploadFileProgress = new Subject<{ loadedBytes: number; totalBytes?: number }>();
  private uploadFolderProgress = new Subject<{ loadedBytes: number; totalBytes?: number }>();

  fileUploadProgress(loadedBytes: number, totalBytes?: number): void {
    const progress = { loadedBytes, totalBytes };
    this.uploadFileProgress.next(progress);
  }
  folderUploadProgress(loadedBytes: number, totalBytes?: number): void {
    const progress = { loadedBytes, totalBytes };
    this.uploadFolderProgress.next(progress);
  }

  getUploadFileProgress() {
    return this.uploadFileProgress.asObservable();
  }

  getUploadFolderProgress() {
    return this.uploadFolderProgress.asObservable();
  }
  async fileUpload(blob: Blob, name?: string, sas?: string) {
    debugger;
    //let link;
    this.progress = 1;
    const uploadOptions: any = {
      onProgress: (ev: CustomProgressEvent) => {
        this.fileUploadProgress(ev.loadedBytes, ev.totalBytes);
      }
    };
    const blobName = name ?? "";
    let containerClient = new ContainerClient(sas ?? "");

    try {
      const res = await containerClient.uploadBlockBlob(blobName, blob, blob.size, uploadOptions);
      //link = res;
    } catch (error) {
      // Handle the error if needed
      console.error('File upload failed:', error);
    }
    /*return link?.blockBlobClient.url;*/
  };

  async folderUpload(file: any, contexttype?: string, name?: string, sas?: string): Promise<any> {
    let link;
    const blobName = name ?? "" + contexttype;
    let containerClient = new ContainerClient(sas ?? "");
    try {
      const res = await containerClient.uploadBlockBlob(blobName, file, file.size);
      link = res;
    } catch (error) {
      console.error('Folder upload failed:', error);
    }
    return link?.blockBlobClient.url;
  };
}


interface CustomProgressEvent {
  loadedBytes: number;
  totalBytes: number;
}
