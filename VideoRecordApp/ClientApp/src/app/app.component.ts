import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, Renderer2 } from '@angular/core';
import { ViewChild, OnInit, ElementRef } from '@angular/core';
import { BlobServiceClient } from '@azure/storage-blob';
import { BlobClient } from '@azure/storage-blob';
import { Subject, Subscription } from 'rxjs';
import { SASTokenAPIClient, SASTokenDTO } from './shared/api.service';
import { AzurestorageService } from './shared/azurestorage.service';
import { BlobStorageService } from './shared/blob-storage.service';
import { LoaderService } from './shared/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [SASTokenAPIClient, AzurestorageService]

})
export class AppComponent implements OnInit {
  title = 'app';
  MediaRecorder: any;
  videoElement: HTMLVideoElement;
  recordVideoElement: HTMLVideoElement;
  mediaVideoRecorder: any;
  videoRecordedBlobs: Blob[];
  isRecording: boolean = false;
  downloadVideoUrl: string;
  stream: MediaStream;
  tokenResponse!: SASTokenDTO
  guId: any;
  uploadProgress: number = 0;
  displayUploadFile!: boolean;
  progress: number = 0;
  showLoader: boolean;
  progressValue: number = 0;
  showProgressBar: boolean = false;
  showLoader1: boolean = false;
  
  private readonly blobServiceUri = 'https://privacyinspectorstorage.blob.core.windows.net/';
  private readonly sasToken = '?sv=2023-11-03&se=2024-03-17T05%3A49%3A08Z&sr=c&sp=rw&sig=OOOaaoWVAH66jzfB1VKVB%2BuWkPCcBmMMPNlBtqWoqrE%3D';
  private readonly folderName = 'Recorded_Videos';

  @ViewChild('recordedVideo') recordVideoElementRef: ElementRef;
  @ViewChild('liveVideo') videoElementRef: ElementRef;
  @ViewChild('recordedAudio') recordAudioElementRef: ElementRef;
  @ViewChild('uploadProgress') uploadProgressBar: ElementRef<HTMLProgressElement>;
  private uploadFileProgress = new Subject<{ loadedBytes: number; totalBytes?: number }>();
  private uploadFolderProgress = new Subject<{ loadedBytes: number; totalBytes?: number }>();
  private progressSubscription: Subscription = new Subscription();
  constructor(private sastokenApiClient: SASTokenAPIClient, private azureService: AzurestorageService, private loaderService: LoaderService, private renderer: Renderer2, private blobService: BlobStorageService, private http: HttpClient) { }
  async ngOnInit() {
    navigator.mediaDevices.getUserMedia({
      video: {
        width: 1080
      },
      //audio: true,
      //// echoCancellation: false,
      audio: {
        echoCancellation: true, // Request echo cancellation if supported
      }
    }).then(stream => {
      this.videoElement = this.videoElementRef.nativeElement;
      this.recordVideoElement = this.recordVideoElementRef.nativeElement;
      this.stream = stream;
      this.videoElement.srcObject = this.stream;
    });
    
  }
  
  startRecording() {
    this.videoRecordedBlobs = [];
    let options: any = {
      mimeType: 'video/webm'
    };
    try {
      this.mediaVideoRecorder = new MediaRecorder(this.stream, options);
    } catch (err) {
      console.log(err);
    }
    this.mediaVideoRecorder.start();
    this.isRecording = !this.isRecording;
    this.onDataAvailableVideoEvent();
    this.onStopVideoRecordingEvent();
  }
  stopRecording() {
    this.mediaVideoRecorder.stop();
    this.isRecording = !this.isRecording;
  }
  async playRecording() {
    if (!this.videoRecordedBlobs || !this.videoRecordedBlobs.length) {
      return;
    }
    const recordedVideo = new Blob(this.videoRecordedBlobs, { type: 'video/webm' });
    this.recordVideoElement.src = URL.createObjectURL(recordedVideo);

    // Mute the video element before playing:
    this.recordVideoElement.muted = true;

    // Upload video to Azure Blob Storage
    await this.uploadVideo(recordedVideo);
  }

  fileUploadProgress(loadedBytes: number, totalBytes?: number): void {
    const progress = { loadedBytes, totalBytes };
    this.uploadFileProgress.next(progress);
  }
  getUploadFileProgress() {
    return this.uploadFileProgress.asObservable();
  }
  //this is for store file static
  async uploadVideoToBlobStorage(blob: Blob) {
    const blobServiceClient = new BlobServiceClient(`${this.blobServiceUri}${this.sasToken}`);
    const containerClient = blobServiceClient.getContainerClient(this.folderName);

    // Generate a unique filename
    const filename = `recording-${Date.now()}.webm`;

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    try {
      // Upload the video blob to Azure Blob Storage
      const uploadBlobResponse = await blockBlobClient.uploadData(blob);

      // Display alert after successful upload
      alert('Video uploaded successfully to Azure Blob Storage.');
    } catch (error) {
      // Handle error scenario here
      alert('Error uploading video to Azure Blob Storage. Please try again.');
    }
  }

  //store video by SAS Token
  async uploadVideoToBlobStorage2(blob: Blob) {
    this.showLoader = true;
    try {
      // Call the SASTokenAPIClient service to get a fresh SAS token
      const sasTokenResponse = await this.sastokenApiClient.addSasToken().toPromise();
      const sasToken = sasTokenResponse?.sasToken; // Extract the SAS token

      const blobServiceClient = new BlobServiceClient(`${sasToken}`);
      const containerClient = blobServiceClient.getContainerClient(this.folderName);

      // Generate a unique filename
      const filename = `recording-${sasTokenResponse?.guid}.webm`;

      // Get a block blob client
      const blockBlobClient = containerClient.getBlockBlobClient(filename);

      try {
        //const uploadOptions: any = {
        //  onProgress: (ev: any) => {
        //    const percentCompleted = (ev.loadedBytes / ev.totalBytes) * 100;
        //    this.uploadProgress = percentCompleted;
        //    console.log('Progress:', percentCompleted); // Add this line
        //  }
        //};

        // Upload the video blob to Azure Blob Storage
        const uploadBlobResponse = await blockBlobClient.uploadData(blob);
        alert('Video uploaded successfully to Azure Blob Storage.');
        this.showLoader = false
      } catch (error) {
        alert('Error uploading video to Azure Blob Storage. Please try again.');
      }
      finally {
        this.showLoader = false; // Hide the loader after upload (success or error)
      }
    } catch (error) {
      alert('Error fetching SAS token:');
    }
    finally {
      this.showLoader = false; // Ensure loader is hidden even on initial errors
    }

  }

  onUpload(blob: Blob): void {
    //let Link;
    //const file = fileInputEvent.target.files[0];
    //let a = file.name.split('.');
    //let extensions = a[a.length - 1];
    this.sastokenApiClient.addSasToken()
      .subscribe(
        (sasToken: SASTokenDTO) => {
          this.tokenResponse = sasToken;
          this.guId = sasToken.guid;
          this.azureService.fileUpload(blob, sasToken.guid ?? "", sasToken.sasToken ?? "").then((result) => {
          });
        },
        (err) => {
          alert('Error adding SAS token')
        });
  }

  fileProgress() {
    this.progressSubscription = this.azureService.getUploadFileProgress().subscribe(
      (progress: { loadedBytes: number; totalBytes?: number }) => {
        if (progress.totalBytes !== undefined) {
          this.uploadProgress = Math.round((progress.loadedBytes / progress.totalBytes) * 100);
        } else {
          console.warn('Total bytes not available. Unable to calculate progress.');
        }
        if (this.uploadProgress >= 100) {
          this.uploadProgress = 0;
        }
      }
    );
  }

  onDataAvailableVideoEvent() {
    try {
      this.mediaVideoRecorder.ondataavailable = (event: any) => {
        if (event.data && event.data.size > 0) {
          this.videoRecordedBlobs.push(event.data);
        }
      };
    } catch (error) {
      console.log(error);
    }
  }
  onStopVideoRecordingEvent() {
    try {
      this.mediaVideoRecorder.onstop = (event: Event) => {
        const videoBuffer = new Blob(this.videoRecordedBlobs, {
          type: 'video/webm'
        });
        this.downloadVideoUrl = window.URL.createObjectURL(videoBuffer);
        this.recordVideoElement.src = this.downloadVideoUrl;
      };
    } catch (error) {
      console.log(error);
    }
  }
  async uploadVideo(blob: Blob) {
    this.showLoader = true;
    try {
      const sasTokenResponse = await this.sastokenApiClient.addSasToken().toPromise();
      const sasToken = sasTokenResponse?.sasToken ?? "";
      const folderName = this.folderName;
      const filename = `recording-${sasTokenResponse?.guid}.webm`;
      const success = await this.blobService.uploadVideo(blob, sasToken, folderName, filename);
      if (success) {
        alert('Video uploaded successfully to Azure Blob Storage.');
      } else {
        alert('Error uploading video to Azure Blob Storage. Please try again.');
      }
    } catch (error) {
      alert('Error fetching SAS token. Please try again.');
    } finally {
      this.showLoader = false;
    }
  }
 
}
