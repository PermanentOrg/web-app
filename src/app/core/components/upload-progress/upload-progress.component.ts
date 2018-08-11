import { Component, OnInit } from '@angular/core';

import { UploadService } from '@core/services/upload/upload.service';
import { UploadItem } from '@core/services/upload/uploadItem';

@Component({
  selector: 'pr-upload-progress',
  templateUrl: './upload-progress.component.html',
  styleUrls: ['./upload-progress.component.scss']
})
export class UploadProgressComponent implements OnInit {
  public visible = true;
  public currentItem: UploadItem;
  public fileCount: any;

  constructor(private upload: UploadService) { }

  ngOnInit() {
    this.upload.uploader.uploadItem.subscribe((uploadItem) => {
      this.currentItem = uploadItem;
    });

    this.fileCount = this.upload.uploader.fileCount;
  }

  getProgressTransform() {
    if (this.currentItem) {
      return `scaleX(${this.currentItem.transferProgress})`;
    } else {
      return 'scaleX(0)';
    }
  }



}
