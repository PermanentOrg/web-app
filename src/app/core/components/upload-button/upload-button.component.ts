/* @format */
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Input,
  Optional,
  HostBinding,
} from '@angular/core';
import { UploadService } from '@core/services/upload/upload.service';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@root/app/models';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { EVENTS } from '@shared/services/google-analytics/events';
import { checkMinimumAccess, AccessRole } from '@models/access-role';
import { AccountService } from '@shared/services/account/account.service';
import {
  DragService,
  DragTargetDroppableComponent,
  DragServiceEvent,
} from '@shared/services/drag/drag.service';
import {
  HasSubscriptions,
  unsubscribeAll,
} from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';
import { ApiService } from '@shared/services/api/api.service';
import { AnalyticsService } from '@shared/services/analytics/analytics.service';

@Component({
  selector: 'pr-upload-button',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss'],
})
export class UploadButtonComponent
  implements OnInit, OnDestroy, HasSubscriptions
{
  private files: File[];
  @Input() fullWidth: boolean;

  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;
  public currentFolder: FolderVO;
  @HostBinding('hidden') hidden: boolean;
  public disabled: boolean;

  isDragTarget: boolean;
  isDropTarget: boolean;

  subscriptions: Subscription[] = [];

  constructor(
    private upload: UploadService,
    private account: AccountService,
    private dataService: DataService,
    private prompt: PromptService,
    private ga: GoogleAnalyticsService,
    private analytics: AnalyticsService,
  ) {
    this.subscriptions.push(
      this.dataService.currentFolderChange.subscribe((currentFolder) => {
        this.currentFolder = currentFolder;
        this.checkCurrentFolder();
      }),
    );

    this.upload.registerButtonComponent(this);
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.upload.unregisterButtonComponent(this);
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
        this.currentFolder.type === 'type.folder.root.share' ||
        this.currentFolder.type === 'type.folder.root.app' ||
        this.currentFolder.type === 'page';
      this.disabled =
        !checkMinimumAccess(
          this.currentFolder.accessRole,
          AccessRole.Contributor,
        ) ||
        !checkMinimumAccess(
          this.account.getArchive().accessRole,
          AccessRole.Contributor,
        ) ||
        (this.currentFolder.type.includes('app') &&
          this.currentFolder.special !== 'familysearch.root.folder');
    }
  }

  async onFileChange(event) {
    this.files = Array.from(event.target.files);
    if (this.currentFolder) {
      if (this.currentFolder.type.includes('public')) {
        try {
          await this.prompt.confirm(
            'Upload to public',
            'This is a public folder. Are you sure you want to upload here?',
          );
          this.ga.sendEvent(EVENTS.PUBLISH.PublishByUrl.uploaded.params);
          this.upload.uploadFiles(this.currentFolder, this.files);
        } catch (err) {}
      } else {
        this.upload.uploadFiles(this.currentFolder, this.files);
      }
    }
    event.target.value = '';
  }

  filePickerClick(): boolean {
    const workspace = this.getFolderWorkspaceType(this.currentFolder);
    const account = this.account.getAccount();
    this.analytics.notifyObservers({
      entity: 'account',
      action: 'initiate_upload',
      version: 1,
      entityId: account.accountId.toString(),
      body: {
        analytics: {
          event: 'Initiate Upload',
          data: {
            workspace,
          },
        },
      },
    });
    return true;
  }

  private getFolderWorkspaceType(folder: FolderVO) {
    return folder.type.includes('private') ? 'Private Files' : 'Public Files';
  }

  onDragServiceEvent(dragEvent: DragServiceEvent) {}
}
