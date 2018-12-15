import { Component, OnInit, Input, OnDestroy, ElementRef, HostBinding, OnChanges } from '@angular/core';
import { Router, ActivatedRoute, RouterState } from '@angular/router';

import { clone, find } from 'lodash';

import { DataService } from '@shared/services/data/data.service';
import { PromptService, PromptButton, PromptField } from '@core/services/prompt/prompt.service';

import { FolderVO, RecordVO, FolderVOData, RecordVOData } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import { EditService } from '@core/services/edit/edit.service';
import { RecordResponse, FolderResponse } from '@shared/services/api/index.repo';
import { Validators } from '@angular/forms';
import { MessageService } from '@shared/services/message/message.service';
import { AccountService } from '@shared/services/account/account.service';
import { FolderPickerOperations } from '@core/components/folder-picker/folder-picker.component';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { Deferred } from '@root/vendor/deferred';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { Dialog } from '@root/app/dialog/dialog.service';

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

  @HostBinding('class.grid-view') inGridView = false;

  public allowActions = true;
  public isMyItem = true;
  public canWrite = true;

  private isInShares: boolean;
  private isInApps: boolean;

  constructor(
    private dataService: DataService,
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

    if (this.router.routerState.snapshot.url.includes('/apps')) {
      this.isInApps = true;
    }

    if (this.router.routerState.snapshot.url.includes('/shares')) {
      this.isInShares = true;
      this.isMyItem = this.accountService.getArchive().archiveId === this.item.archiveId;
    }

    if (this.item.accessRole === 'access.role.viewer' || this.item.accessRole === 'access.role.contributor') {
      this.canWrite = false;
    }

    this.inGridView = this.folderView === FolderView.Grid;

    if (this.item.position === 1) {
      // this.dialog.open('SharingComponent', { item: this.item });
    }
  }

  ngOnChanges() {
    this.inGridView = this.folderView === FolderView.Grid;
  }

  ngOnDestroy() {
    this.dataService.deregisterItem(this.item);
  }

  goToItem() {
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
    } else {
      rootUrl = '/myfiles';
    }

    if (this.item.isFolder) {
      this.router.navigate([rootUrl, this.item.archiveNbr, this.item.folder_linkId]);
    } else if (!this.isMyItem && this.dataService.currentFolder.type === 'type.folder.root.share') {
      this.router.navigate(['/shares/withme/record', this.item.archiveNbr]);
    } else {
      this.router.navigate(['record', this.item.archiveNbr], {relativeTo: this.route});
    }
  }

  showActions(event: Event) {
    event.stopPropagation();

    const actionButtons: PromptButton[] = [ItemActions.Copy];

    let actionResolve;

    const actionPromise = new Promise((resolve) => {
      actionResolve = resolve;
    });

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

    this.prompt.promptButtons(actionButtons, this.item.displayName, actionPromise)
      .then((value: string) => {
        switch (value) {
          case 'delete':
            return this.deleteItem(actionResolve);
          case 'rename':
            actionResolve();
            this.promptForUpdate();
            break;
          case 'move':
            actionResolve();
            this.openFolderPicker(FolderPickerOperations.Move);
            break;
          case 'copy':
            actionResolve();
            this.openFolderPicker(FolderPickerOperations.Copy);
            break;
          case 'download':
            this.dataService.downloadFile(this.item as RecordVO)
              .then(() => {
                actionResolve();
              });
            break;
          case 'share':
            actionResolve();
            this.dialog.open('SharingComponent', { item: this.item });
            break;
        }
      });

    return false;
  }

  deleteItem(resolve: Function) {
    return resolve();
    // return this.edit.deleteItems([this.item])
    //   .then(() => {
    //     this.dataService.refreshCurrentFolder();
    //     resolve();
    //   })
    //   .catch(() => {
    //     resolve();
    //   });
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

    const updatePromise = new Promise((resolve) => {
      updateResolve = resolve;
    });

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

    this.prompt.prompt(fields, `Rename "${this.item.displayName}"`, updatePromise, 'Rename', 'Cancel')
      .then((values) => {
        this.saveUpdates(values, updateResolve);
      })
      .catch(() => {});
  }

  saveUpdates(changes: RecordVOData | FolderVOData, resolve: Function) {
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
      return resolve();
    } else {
      this.item.update(changes);
      return this.edit.updateItems([this.item])
        .then(() => {
          resolve();
        })
        .catch((response: RecordResponse | FolderResponse) => {
          resolve();
          this.message.showError(response.getMessage(), true);
          this.item.update(originalData);
        });
    }
  }


}
