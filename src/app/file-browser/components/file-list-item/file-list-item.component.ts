import { Component, OnInit, Input, OnDestroy, ElementRef, HostBinding, OnChanges } from '@angular/core';
import { Router, ActivatedRoute, RouterState } from '@angular/router';

import { clone, find } from 'lodash';

import { DataService } from '@shared/services/data/data.service';
import { PromptService, PromptButton, PromptField } from '@core/services/prompt/prompt.service';

import { FolderVO, RecordVO, FolderVOData, RecordVOData } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import { EditService } from '@core/services/edit/edit.service';
import { RecordResponse, FolderResponse, ShareResponse } from '@shared/services/api/index.repo';
import { Validators } from '@angular/forms';
import { MessageService } from '@shared/services/message/message.service';
import { AccountService } from '@shared/services/account/account.service';
import { FolderPickerOperations } from '@core/components/folder-picker/folder-picker.component';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { Deferred } from '@root/vendor/deferred';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { Dialog } from '@root/app/dialog/dialog.service';
import { ApiService } from '@shared/services/api/api.service';

const ItemActions: {[key: string]: PromptButton} = {
  Rename: {
    buttonName: 'rename',
    buttonText: 'Rename',
  },
  Copy: {
    buttonName: 'copy',
    buttonText: 'Copy',
  },
  Move: {
    buttonName: 'move',
    buttonText: 'Move',
  },
  Download: {
    buttonName: 'download',
    buttonText: 'Download'
  },
  Delete: {
    buttonName: 'delete',
    buttonText: 'Delete',
    class: 'btn-danger'
  },
  Share: {
    buttonName: 'share',
    buttonText: 'Share'
  },
  Unshare: {
    buttonName: 'delete',
    buttonText: 'Remove',
    class: 'btn-danger'
  }
};

@Component({
  selector: 'pr-file-list-item',
  templateUrl: './file-list-item.component.html',
  styleUrls: ['./file-list-item.component.scss']
})
export class FileListItemComponent implements OnInit, OnChanges, OnDestroy {
  @Input() item: FolderVO | RecordVO;
  @Input() folderView: FolderView;

  @Input() allowNavigation = true;

  @HostBinding('class.grid-view') inGridView = false;

  public allowActions = true;
  public isMyItem = true;
  public canWrite = true;

  private isInShares: boolean;
  private isInApps: boolean;
  private isInPublic: boolean;
  private isInPublicArchive: boolean;
  private isInSharePreview: boolean;
  private checkFolderView: boolean;

  constructor(
    private dataService: DataService,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    public element: ElementRef,
    private message: MessageService,
    private prompt: PromptService,
    private edit: EditService,
    private accountService: AccountService,
    private folderPicker: FolderPickerService,
    private dialog: Dialog
  ) {
  }

  ngOnInit() {
    this.dataService.registerItem(this.item);
    if (this.item.type.includes('app')) {
      this.allowActions = false;
    }

    if (this.router.routerState.snapshot.url.includes('/p/')) {
      this.allowActions = false;
    }

    if (this.router.routerState.snapshot.url.includes('/share/')) {
      this.allowActions = false;
      this.isInSharePreview = true;
    }

    if (this.router.routerState.snapshot.url.includes('/apps')) {
      this.isInApps = true;
    }

    if (this.route.snapshot.data.isPublic) {
      this.isInPublic = true;
    }

    if (this.route.snapshot.data.isPublicArchive) {
      this.isInPublicArchive = true;
    }

    if (this.route.snapshot.data.checkFolderViewOnNavigate) {
      this.checkFolderView = true;
    }

    // if (this.route.snapshot.data.noFileListNavigation) {
    //   this.allowActions = false;
    //   this.allowNavigation = false;
    // }

    if (this.router.routerState.snapshot.url.includes('/shares')) {
      this.isInShares = true;
      this.isMyItem = this.accountService.getArchive().archiveId === this.item.archiveId;
    }

    if (this.item.accessRole === 'access.role.viewer' || this.item.accessRole === 'access.role.contributor') {
      this.canWrite = false;
    }

    this.inGridView = this.folderView === FolderView.Grid;

  }

  ngOnChanges() {
    this.inGridView = this.folderView === FolderView.Grid;
  }

  ngOnDestroy() {
    this.dataService.deregisterItem(this.item);
  }

  goToItem() {
    if (!this.allowNavigation) {
      return false;
    }

    if (this.item.dataStatus < DataStatus.Lean) {
      if (!this.item.isFetching) {
        this.dataService.fetchLeanItems([this.item]);
      }

      return this.item.fetched.then((fetched) => {
        this.goToItem();
      });
    }

    let rootUrl;

    if (this.isInApps) {
      rootUrl = '/apps';
    } else if (this.isInShares && !this.isMyItem) {
      rootUrl = '/shares/withme';
    } else if (this.isInSharePreview) {
      rootUrl = '/share';
    } else if (this.isInPublic) {
      rootUrl = '/p';
    } else {
      rootUrl = '/myfiles';
    }

    if (this.item.isFolder) {
      if (this.checkFolderView && this.isFolderViewSet()) {
        this.router.navigate([rootUrl, 'view', this.getFolderViewUrl(), this.item.archiveNbr, this.item.folder_linkId]);
      } else if (this.isInPublic && !this.isInPublicArchive) {
        this.router.navigate([this.item.archiveNbr, this.item.folder_linkId], {relativeTo: this.route.parent.parent});
      } if (this.isInSharePreview || this.isInPublicArchive) {
        this.router.navigate([this.item.archiveNbr, this.item.folder_linkId], {relativeTo: this.route.parent});
      } else {
        this.router.navigate([rootUrl, this.item.archiveNbr, this.item.folder_linkId]);
      }
    } else if (!this.isInSharePreview && !this.isMyItem && this.dataService.currentFolder.type === 'type.folder.root.share') {
      this.router.navigate(['/shares/withme/record', this.item.archiveNbr]);
    } else {
      this.router.navigate(['record', this.item.archiveNbr], {relativeTo: this.route});
    }
  }

  isFolderViewSet() {
    if (!this.item.isFolder) {
      return false;
    }

    switch (this.item.view) {
      case FolderView.Timeline:
        return true;
      default:
        return false;
    }
  }

  getFolderViewUrl() {
    switch (this.item.view) {
      case FolderView.Timeline:
        return 'timeline';
      default:
        return false;
    }
  }

  showActions(event: Event) {
    event.stopPropagation();

    const actionButtons: PromptButton[] = [ItemActions.Copy];

    const actionDeferred = new Deferred();

    if (this.canWrite) {
      actionButtons.push(ItemActions.Move);
      actionButtons.push(ItemActions.Rename);
      if (this.isInShares || this.item.accessRole.includes('owner')) {
        actionButtons.push(ItemActions.Share);
      }
      actionButtons.push(this.isInShares ? ItemActions.Unshare : ItemActions.Delete);
      if (this.item.isRecord) {
        actionButtons.push(ItemActions.Download);
      }
    } else {
      if (this.isInShares) {
        actionButtons.push(ItemActions.Share);
      }
    }

    this.prompt.promptButtons(actionButtons, this.item.displayName, actionDeferred.promise)
      .then((value: string) => {
        this.onActionClick(value, actionDeferred);
      });

    return false;
  }

  onActionClick(value: string, actionDeferred: Deferred) {
    switch (value) {
      case 'delete':
        return this.deleteItem(actionDeferred.resolve);
      case 'rename':
        actionDeferred.resolve();
        this.promptForUpdate();
        break;
      case 'move':
        actionDeferred.resolve();
        this.openFolderPicker(FolderPickerOperations.Move);
        break;
      case 'copy':
        actionDeferred.resolve();
        this.openFolderPicker(FolderPickerOperations.Copy);
        break;
      case 'download':
        this.dataService.downloadFile(this.item as RecordVO)
          .then(() => {
            actionDeferred.resolve();
          });
        break;
      case 'share':
        this.api.share.getShareLink(this.item)
          .then((response: ShareResponse) => {
            actionDeferred.resolve();
            this.dialog.open('SharingComponent', { item: this.item, link: response.getShareByUrlVO() });
          });
        break;
    }
  }

  deleteItem(resolve: Function) {
    return this.edit.deleteItems([this.item])
      .then(() => {
        this.dataService.refreshCurrentFolder();
        resolve();
      })
      .catch(() => {
        resolve();
      });
  }

  moveItem(destination: FolderVO) {
    return this.edit.moveItems([this.item], destination);
  }

  copyItem(destination: FolderVO) {
    return this.edit.copyItems([this.item], destination);
  }

  openFolderPicker(operation: FolderPickerOperations) {
    const deferred = new Deferred();
    const rootFolder = this.accountService.getRootFolder();
    const myFiles = new FolderVO(find(rootFolder.ChildItemVOs, {type: 'type.folder.root.private'}) as FolderVOData);

    this.folderPicker.chooseFolder(myFiles, operation, deferred.promise)
      .then((destination: FolderVO) => {
        switch (operation) {
          case FolderPickerOperations.Copy:
            return this.copyItem(destination);
          case FolderPickerOperations.Move:
            return this.moveItem(destination);
        }
      })
      .then(() => {
        setTimeout(() => {
          deferred.resolve();
          // tslint:disable-next-line:max-line-length
          const msg = `${this.item.isFolder ? 'Folder' : 'File'} ${this.item.displayName} ${operation === FolderPickerOperations.Copy ? 'copied' : 'moved'} successfully.`;
          this.message.showMessage(msg, 'success');
          if (operation === FolderPickerOperations.Move || this.item.isFolder) {
            this.dataService.refreshCurrentFolder();
          }
        }, 500);
      })
      .catch((response: FolderResponse | RecordResponse) => {
        deferred.reject();
        this.message.showError(response.getMessage(), true);
      });
  }

  promptForUpdate() {
    let updateResolve;

    const updateDeferred = new Deferred;

    const fields: PromptField[] = [
      {
        fieldName: 'displayName',
        validators: [Validators.required],
        placeholder: 'Name',
        initialValue: this.item.displayName,
        config: {
          autocapitalize: 'off',
          autocorrect: 'off',
          autocomplete: 'off',
          spellcheck: 'off',
          autoselect: true
        }
      }
    ];

    this.prompt.prompt(fields, `Rename "${this.item.displayName}"`, updateDeferred.promise, 'Rename', 'Cancel')
      .then((values) => {
        this.saveUpdates(values, updateDeferred);
      })
      .catch(() => {});
  }

  saveUpdates(changes: RecordVOData | FolderVOData, deferred: Deferred) {
    const originalData = {};
    Object.keys(changes)
      .forEach((key) => {
        if (this.item[key] === changes[key]) {
          delete changes[key];
        } else {
          originalData[key] = this.item[key];
        }
      });

    if (!Object.keys(changes).length) {
      return deferred.resolve();
    } else {
      (this.item as FolderVO).update(changes);
      return this.edit.updateItems([this.item])
        .then(() => {
          deferred.resolve();
        })
        .catch((response: RecordResponse | FolderResponse) => {
          deferred.reject();
          this.message.showError(response.getMessage(), true);
          (this.item as FolderVO).update(originalData);
        });
    }
  }


}
