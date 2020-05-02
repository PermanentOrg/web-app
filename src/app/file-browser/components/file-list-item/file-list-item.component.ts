import { Component, OnInit, Input, OnDestroy, ElementRef, HostBinding, OnChanges, Output, EventEmitter, Optional, Inject } from '@angular/core';
import { Router, ActivatedRoute, RouterState } from '@angular/router';

import { clone, find } from 'lodash';

import { DataService } from '@shared/services/data/data.service';
import { PromptService, PromptButton, PromptField, FOLDER_VIEW_FIELD_INIIAL } from '@core/services/prompt/prompt.service';

import { FolderVO, RecordVO, FolderVOData, RecordVOData, ShareVO } from '@root/app/models';
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
import { checkMinimumAccess, AccessRole } from '@models/access-role';
import { DeviceService } from '@shared/services/device/device.service';

import { ItemClickEvent } from '../file-list/file-list.component';
import { DragService, DragServiceEvent, DragTargetType, DragTargetDroppable, DraggableComponent } from '@shared/services/drag/drag.service';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';

export const ItemActions: {[key: string]: PromptButton} = {
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
    buttonName: 'unshare',
    buttonText: 'Remove',
    class: 'btn-danger'
  },
  Publish: {
    buttonName: 'publish',
    buttonText: 'Publish',
  },
  GetLink: {
    buttonName: 'publish',
    buttonText: 'Get link'
  },
  SetFolderView: {
    buttonName: 'setFolderView',
    buttonText: 'Set folder view'
  }
};

type ActionType = 'delete' |
  'rename' |
  'share' |
  'unshare' |
  'publish' |
  'download' |
  'copy' |
  'move' |
  'setFolderView';

const DOUBLE_CLICK_TIMEOUT = 100;
const DRAG_MIN_Y = 15;

@Component({
  selector: 'pr-file-list-item',
  templateUrl: './file-list-item.component.html',
  styleUrls: ['./file-list-item.component.scss']
})
export class FileListItemComponent implements OnInit, OnChanges, OnDestroy, HasSubscriptions, DraggableComponent {
  @Input() item: FolderVO | RecordVO;
  @Input() folderView: FolderView;

  @Input() allowNavigation = true;
  @Input() isShareRoot = false;
  @Input() multiSelect = false;
  @Input() isSelected = false;

  public isMultiSelected =  false;
  public isDragTarget = false;
  public isCurrentDragTarget = false;

  @HostBinding('class.grid-view') inGridView = false;

  @Output() itemUnshared = new EventEmitter<FolderVO | RecordVO>();
  @Output() itemClicked = new EventEmitter<ItemClickEvent>();

  public allowActions = true;
  public isMyItem = true;
  public canEdit = true;

  private isInShares: boolean;
  private isInApps: boolean;
  private isInPublic: boolean;
  private isInMyPublic: boolean;
  private isInPublicArchive: boolean;
  private isInSharePreview: boolean;
  private checkFolderView: boolean;

  private singleClickTimeout: NodeJS.Timeout;

  subscriptions: Subscription[] = [];

  constructor(
    private dataService: DataService,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    public element: ElementRef,
    private message: MessageService,
    private prompt: PromptService,
    @Optional() private edit: EditService,
    private accountService: AccountService,
    @Optional() private folderPicker: FolderPickerService,
    private dialog: Dialog,
    private device: DeviceService,
    @Optional() private drag: DragService,
    @Inject(DOCUMENT) private document: Document
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

    if (this.router.routerState.snapshot.url.includes('/public')) {
      this.isInMyPublic = true;
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

    if (!this.accountService.checkMinimumAccess(this.item.accessRole, AccessRole.Editor)) {
      this.canEdit = false;
    }

    this.inGridView = this.folderView === FolderView.Grid;

    this.subscriptions.push(
      this.drag.events().subscribe(dragEvent => {


        this.onDragServiceEvent(dragEvent);
      })
    );
  }

  ngOnChanges() {
    this.inGridView = this.folderView === FolderView.Grid;

    if (!this.multiSelect) {
      this.isMultiSelected = false;
    }
  }

  ngOnDestroy() {
    this.dataService.deregisterItem(this.item);
    unsubscribeAll(this.subscriptions);
  }

  onDrop(dropTarget: DragTargetDroppable) {
    if (dropTarget instanceof FileListItemComponent) {
      console.log('MOVE:', this.item.displayName);
      console.log('TO:', dropTarget.item.displayName);
    }
  }

  onDragServiceEvent(dragEvent: DragServiceEvent) {
    if (dragEvent.srcComponent === this) {
      return;
    }

    switch (dragEvent.type) {
      case 'start':
      case 'end':
        const start = dragEvent.type === 'start';

        if (this.item.isRecord && dragEvent.targetTypes.includes('record')) {
          this.isDragTarget = start;
        }

        if (this.item.isFolder && dragEvent.targetTypes.includes('folder')) {
          this.isDragTarget = start;
        }

        if (!start) {
          this.isCurrentDragTarget = false;
        }

        break;
    }
  }

  onItemMouseDown(mouseDownEvent: MouseEvent) {
    const targetTypes: DragTargetType[] = ['folder'];

    // if (this.item.isRecord) {
    //   targetTypes.push('record');
    // }

    let isDragging = false;
    const mouseUpHandler = (mouseUpEvent: MouseEvent) => {
      this.drag.dispatch({
        type: 'end',
        srcComponent: this,
        event: mouseUpEvent,
        targetTypes
      });
      this.document.removeEventListener('mouseup', mouseUpHandler);
    };
    const mouseMoveHandler = (mouseMoveEvent: MouseEvent) => {
      if (!isDragging) {
        isDragging = Math.abs(mouseMoveEvent.clientY - mouseDownEvent.clientY) > DRAG_MIN_Y;
        if (isDragging) {
          this.drag.dispatch({
            type: 'start',
            srcComponent: this,
            event: mouseMoveEvent,
            targetTypes
          });
        }
      } else {
        this.document.addEventListener('mouseup', mouseUpHandler);
        this.document.removeEventListener('mousemove', mouseMoveHandler);
      }
    };
    this.document.addEventListener('mousemove', mouseMoveHandler);
  }

  onItemMouseEnterLeave(event: MouseEvent, enter = true) {
    if (this.isDragTarget) {
      let type;
      if (enter) {
        type = 'enter';
      } else {
        type = 'leave';
      }
      this.drag.dispatch({
        type,
        srcComponent: this,
        event
      });
      this.isCurrentDragTarget = enter;
    }
  }

  onItemClick(event: MouseEvent) {
    if (this.device.isMobileWidth()) {
      this.goToItem();
    } else {
      this.onItemSingleClick(event);
    }
  }

  onItemDoubleClick() {
    if (this.singleClickTimeout) {
      clearTimeout(this.singleClickTimeout);
      this.singleClickTimeout = null;
    }

    this.goToItem();
  }

  goToItem() {
    if (!this.allowNavigation) {
      return false;
    }

    if (this.multiSelect) {
      this.isMultiSelected = !this.isMultiSelected;
      this.onMultiSelectChange();
      return;
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
    } else if (this.router.routerState.snapshot.url.includes('/public')) {
      rootUrl = '/public';
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

  onItemSingleClick(event: MouseEvent) {
    this.singleClickTimeout = setTimeout(() => {
      this.itemClicked.emit({
        item: this.item,
        event
      });
    }, DOUBLE_CLICK_TIMEOUT);
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

    const actionButtons: PromptButton[] = [];

    const actionDeferred = new Deferred();

    const isAtLeastCurator = this.accountService.checkMinimumAccess(this.item.accessRole, AccessRole.Curator);
    const isOwner = this.accountService.checkMinimumAccess(this.item.accessRole, AccessRole.Owner);

    if (this.canEdit) {
      actionButtons.push(ItemActions.Rename);

      if (isAtLeastCurator) {
        actionButtons.push(ItemActions.Copy);

        if (!this.isShareRoot) {
          actionButtons.push(ItemActions.Move);
        }
      }

      if (isOwner && !this.isInMyPublic) {
        actionButtons.push(ItemActions.Share);
      }

      if (!this.isInShares) {
        if (this.isInMyPublic) {
          actionButtons.push(ItemActions.GetLink);

          if (this.item.isFolder) {
            actionButtons.push(ItemActions.SetFolderView);
          }
        } else if (isOwner) {
          actionButtons.push(ItemActions.Publish);
        }
      }

      if (this.item.isRecord) {
        actionButtons.push(ItemActions.Download);
      }
    }

    if (!this.isShareRoot && isAtLeastCurator) {
      actionButtons.push(ItemActions.Delete);
    } else if (this.isShareRoot && !this.isMyItem && this.accountService.checkMinimumArchiveAccess(AccessRole.Curator)) {
      actionButtons.push(ItemActions.Unshare);
    }

    if (actionButtons.length) {
      this.prompt.promptButtons(actionButtons, this.item.displayName, actionDeferred.promise)
      .then((value: ActionType) => {
        this.onActionClick(value, actionDeferred);
      })
      .catch(err => {
      });
    } else {
      try {
        this.prompt.confirm('OK', this.item.displayName, null, null, `<p>No actions available</p>`);
      } catch (err) { }
    }



    return false;
  }

  async onActionClick(value: ActionType, actionDeferred: Deferred) {
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
      case 'unshare':
        await this.unshareItem();
        actionDeferred.resolve();
        break;
      case 'publish':
        actionDeferred.resolve();
        this.dialog.open('PublishComponent', { item: this.item }, { height: 'auto' });
        break;
      case 'setFolderView':
        actionDeferred.resolve();
        this.promptForFolderView();
        break;
    }
  }

  preventDefault(event: Event) {
    event.stopPropagation();
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

  async unshareItem() {
    const shareVO = new ShareVO({
      folder_linkId: this.item.folder_linkId,
      archiveId: this.accountService.getArchive().archiveId
    });
    await this.api.share.remove(shareVO);
    this.message.showMessage('Item removed from shares.', 'success');
    this.itemUnshared.emit(this.item);
  }

  openFolderPicker(operation: FolderPickerOperations) {
    if (!this.folderPicker) {
      return false;
    }

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

  async promptForUpdate() {
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


    try {
      const values = await this.prompt.prompt(fields, `Rename "${this.item.displayName}"`, updateDeferred.promise, 'Rename', 'Cancel');
      this.saveUpdates(values, updateDeferred);
    } catch (err) {
      if (err) {
        throw err;
      }
    }
  }

  promptForFolderView() {
    const updateDeferred = new Deferred;

    const fields = [ FOLDER_VIEW_FIELD_INIIAL(this.item.view) ];

    this.prompt.prompt(fields, `Set folder view for "${this.item.displayName}"`, updateDeferred.promise, 'Save', 'Cancel')
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
      this.item.update(changes);
      return this.edit.updateItems([this.item])
        .then(() => {
          deferred.resolve();
        })
        .catch((response: RecordResponse | FolderResponse) => {
          deferred.reject();
          this.item.update(originalData);
          if (response.getMessage) {
            this.message.showError(response.getMessage(), true);
          }
        });
    }
  }

  onMultiSelectChange() {
    this.dataService.setItemMultiSelectStatus(this.item, this.isMultiSelected);
  }


}
