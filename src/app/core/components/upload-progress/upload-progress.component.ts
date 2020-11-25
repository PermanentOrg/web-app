import { Component, OnInit } from '@angular/core';

import { UploadService } from '@core/services/upload/upload.service';
import { UploadItem } from '@core/services/upload/uploadItem';
import { UploadProgressEvent, UploadSessionStatus } from '@core/services/upload/uploader';

const UPLOAD_COMPLETE_HIDE_DELAY = 3000;

@Component({
  selector: 'pr-upload-progress',
  templateUrl: './upload-progress.component.html',
  styleUrls: ['./upload-progress.component.scss']
})
export class UploadProgressComponent implements OnInit {
  UploadSessionStatus = UploadSessionStatus;
  public visible = false;
  public useFade = false;

  public status: UploadSessionStatus;

  public start = true;
  public inProgress = false;
  public done = false;

  public currentItem: UploadItem;
  public fileCount: any;

  constructor(private upload: UploadService) {
    this.upload.registerComponent(this);

    this.upload.uploader.uploadSessionStatus.subscribe((status: UploadSessionStatus) => {
      this.status = status;
      switch (status) {
        case UploadSessionStatus.Start:
          this.upload.showProgress();
          break;
        case UploadSessionStatus.Done:
          this.upload.dismissProgress();
          break;
        case UploadSessionStatus.ConnectionError:
          this.upload.dismissProgress();
          break;
      }
    });
  }

  ngOnInit() {
    this.upload.uploader.progress.subscribe((progressEvent: UploadProgressEvent) => {
      if (progressEvent.item) {
        this.currentItem = progressEvent.item;
      }
    });

    this.fileCount = this.upload.uploader.fileCount;
  }

  show() {
    this.visible = true;
  }

  dismiss() {
    this.visible = false;
  }

  getProgressTransform() {
    if (this.currentItem) {
      return `scaleX(${this.currentItem.transferProgress})`;
    } else {
      return 'scaleX(0)';
    }
  }
}
