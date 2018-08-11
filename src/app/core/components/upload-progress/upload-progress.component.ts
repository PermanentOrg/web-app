import { Component, OnInit } from '@angular/core';

import { UploadService } from '@core/services/upload/upload.service';
import { UploadItem } from '@core/services/upload/uploadItem';
import { UploadSessionStatus } from '@core/services/upload/uploader';

@Component({
  selector: 'pr-upload-progress',
  templateUrl: './upload-progress.component.html',
  styleUrls: ['./upload-progress.component.scss']
})
export class UploadProgressComponent implements OnInit {
  public visible = false;
  public inProgress = false;
  public done = false;

  public currentItem: UploadItem;
  public fileCount: any;

  constructor(private upload: UploadService) {
    this.upload.registerComponent(this);
    this.upload.uploader.uploadSessionStatus.subscribe((status: UploadSessionStatus) => {
      switch (status) {
        case UploadSessionStatus.Start:
          this.visible = true;
          this.done = false;
          this.inProgress = false;
          break;
        case UploadSessionStatus.InProgress:
          this.inProgress = true;
          this.done = false;
          break;
        case UploadSessionStatus.Done:
          this.inProgress = false;
          this.done = true;
          this.visible = false;
          break;
      }
    });
  }

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
