import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { UploadService } from '@core/services/upload/upload.service';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@root/app/models';
import { PromptService } from '@core/services/prompt/prompt.service';

@Component({
  selector: 'pr-upload-button',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss']
})
export class UploadButtonComponent implements OnInit, OnDestroy {
  private files: File[];
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;
  public currentFolder: FolderVO;
  public hidden: boolean;

  constructor(
    private upload: UploadService,
    private dataService: DataService,
    private prompt: PromptService
  ) {
    this.dataService.currentFolderChange.subscribe((currentFolder) => {
      this.currentFolder = currentFolder;
      this.checkCurrentFolder();
    });

    this.upload.registerButtonComponent(this);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.upload.deregisterButtonComponent();
  }

  promptForFiles() {
    this.fileInput.nativeElement.click();
  }

  checkCurrentFolder() {
    if (!this.currentFolder) {
      this.hidden = true;
    } else {
      this.hidden =
        (this.currentFolder.type.includes('app') && this.currentFolder.special !== 'familysearch.root.folder')
        || this.currentFolder.type === 'type.folder.root.share'
        || this.currentFolder.type === 'type.folder.root.public';
    }
  }

  async onFileChange(event) {
    this.files = Array.from(event.target.files);
    if (this.currentFolder) {
      if (this.currentFolder.type.includes('public')) {
        try {
          await this.prompt.confirm('Upload to public', 'This is a public folder. Are you sure you want to upload here?');
          this.upload.uploadFiles(this.currentFolder, this.files);
        } catch (err) {}
      } else {
        this.upload.uploadFiles(this.currentFolder, this.files);
      }
    }
  }
}
