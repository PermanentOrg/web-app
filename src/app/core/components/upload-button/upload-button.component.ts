import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { UploadService } from '@core/services/upload/upload.service';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@root/app/models';
import { PromptService } from '@core/services/prompt/prompt.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { EVENTS } from '@shared/services/google-analytics/events';
import { checkMinimumAccess, AccessRole } from '@models/access-role';
import { AccountService } from '@shared/services/account/account.service';
import { DragService, DragTargetDroppableComponent, DragServiceEvent } from '@shared/services/drag/drag.service';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';
import { MainComponent } from '../main/main.component';

@Component({
  selector: 'pr-upload-button',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss']
})
export class UploadButtonComponent implements OnInit, OnDestroy, HasSubscriptions {
  private files: File[];
  @Input() fullWidth: boolean;

  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;
  public currentFolder: FolderVO;
  public hidden: boolean;

  isDragTarget: boolean;
  isDropTarget: boolean;

  subscriptions: Subscription[] = [];

  constructor(
    private upload: UploadService,
    private account: AccountService,
    private dataService: DataService,
    private prompt: PromptService,
    private ga: GoogleAnalyticsService,
    private drag: DragService
  ) {
    this.subscriptions.push(
      this.dataService.currentFolderChange.subscribe((currentFolder) => {
        this.currentFolder = currentFolder;
        this.checkCurrentFolder();
      })
    );

    this.upload.registerButtonComponent(this);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.upload.deregisterButtonComponent(this);
    unsubscribeAll(this.subscriptions);
  }

  promptForFiles() {
    this.fileInput.nativeElement.click();
  }

  checkCurrentFolder() {
    if (!this.currentFolder) {
      this.hidden = true;
    } else {
      this.hidden =
        !checkMinimumAccess(this.currentFolder.accessRole, AccessRole.Contributor)
        || !checkMinimumAccess(this.account.getArchive().accessRole, AccessRole.Contributor)
        || (this.currentFolder.type.includes('app') && this.currentFolder.special !== 'familysearch.root.folder')
        || this.currentFolder.type === 'type.folder.root.share';
    }
  }

  async onFileChange(event) {
    this.files = Array.from(event.target.files);
    if (this.currentFolder) {
      if (this.currentFolder.type.includes('public')) {
        try {
          await this.prompt.confirm('Upload to public', 'This is a public folder. Are you sure you want to upload here?');
          this.ga.sendEvent(EVENTS.PUBLISH.PublishByUrl.uploaded.params);
          this.upload.uploadFiles(this.currentFolder, this.files);
        } catch (err) {}
      } else {
        this.upload.uploadFiles(this.currentFolder, this.files);
      }
    }
  }

  onDragServiceEvent(dragEvent: DragServiceEvent) {

  }
}
