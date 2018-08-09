import { Injectable } from '@angular/core';

import { Uploader } from './uploader';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private uploader: Uploader = new Uploader();

  constructor() {
  }
}
