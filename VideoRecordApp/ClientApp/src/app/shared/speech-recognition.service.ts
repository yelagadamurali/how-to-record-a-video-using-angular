//import { Injectable } from '@angular/core';

//@Injectable({
//  providedIn: 'root'
//})
//export class SpeechRecognitionService {

//  constructor() { }

//  private readonly apiKey = environment.apiKey;
//  private readonly apiUrl = environment.apiUrl;

//  constructor(private http: HttpClient) {}

//  transcribeAudio(audioData: Blob): Promise<string> {
//    const formData = new FormData();
//    formData.append('audio', audioData);

//    // Make HTTP POST request to ASR API
//    return this.http.post<any>(this.apiUrl, formData, {
//      headers: { 'Content-Type': 'multipart/form-data' },
//      params: { key: this.apiKey }
//    }).toPromise()
//      .then(response => response.transcription)
//      .catch(error => {
//        console.error('Error transcribing audio:', error);
//        return '';
//      });
//  }
//}
