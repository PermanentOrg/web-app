import { Component, OnInit } from '@angular/core';
import { UploadService } from '@core/services/upload/upload.service';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@root/app/models';

@Component({
  selector: 'pr-upload-button',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss']
})
export class UploadButtonComponent implements OnInit {
  private files: File[];
  public currentFolder: FolderVO;

  constructor(private upload: UploadService, private dataService: DataService) {
    this.dataService.currentFolderChange.subscribe((currentFolder) => {
      this.currentFolder = currentFolder;
    });
  }

  ngOnInit() {
  }

  onFileChange(event) {
    this.files = Array.from(event.target.files);
    if (this.currentFolder) {
      this.upload.uploadFiles(this.currentFolder, this.files);
    }
  }
}
