import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';
import { some } from 'lodash';
import { ItemVO, FolderVO, ArchiveVO, AccessRole } from '@models';
import { DataStatus } from '@models/data-status.enum';
import { EditService } from '@core/services/edit/edit.service';
import { FolderResponse, RecordResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';

type SidebarTab =  'info' | 'details' | 'sharing';
@Component({
  selector: 'pr-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy, HasSubscriptions {
  currentTab: SidebarTab = 'info';
  selectedItem: ItemVO = this.dataService.currentFolder;
  selectedItems: ItemVO[];

  subscriptions: Subscription[] = [];

  isLoading = false;
  isRootFolder = false;

  currentArchive: ArchiveVO;

  canEdit: boolean;
  canShare: boolean;

  constructor(
    private dataService: DataService,
    private editService: EditService,
    private accountService: AccountService
  ) {
    this.currentArchive = this.accountService.getArchive();

    this.subscriptions.push(
      this.dataService.selectedItems$().subscribe(async selectedItems => {
        if (!selectedItems.size) {
          this.selectedItem = this.dataService.currentFolder;
          this.selectedItems = null;
        } else if (selectedItems.size === 1) {
          this.selectedItem = Array.from(selectedItems.keys())[0];
          this.selectedItems = null;
        } else {
          this.selectedItem = null;
          this.selectedItems = Array.from(selectedItems.keys());
        }
        
        this.checkPermissions();

        this.isRootFolder = this.selectedItem?.type.includes('root');

        if (this.isRootFolder) {
          this.setCurrentTab('info');
        }

        if (this.selectedItem !== this.dataService.currentFolder) {
          const items = this.selectedItems || [this.selectedItem];
          this.isLoading = some(items, i => i.dataStatus < DataStatus.Full);
          if (this.isLoading) {
            await this.dataService.fetchFullItems(items);
            this.isLoading = false;
          }
        }
      })
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    unsubscribeAll(this.subscriptions);
  }

  checkPermissions() {
    const items = this.selectedItems || [this.selectedItem];
    const viewOnly = some(items, i => i.accessRole === 'access.role.viewer' || i.accessRole === 'access.role.contributor');

    this.canEdit = !viewOnly && this.accountService.checkMinimumArchiveAccess(AccessRole.Editor);

    if (items.length !== 1) {
      this.canShare = false;
    } else {
      this.canShare = this.isRootFolder || this.accountService.checkMinimumAccess(this.selectedItem.accessRole, AccessRole.Owner);
    }
  }

  setCurrentTab(tab: SidebarTab) {
    if (tab === 'sharing' && this.isRootFolder) {
      return;
    }

    this.currentTab = tab;
  }

  async onFinishEditing(property: keyof ItemVO, value: string) {
    if (this.selectedItem) {
      const originalValue = this.selectedItem[property];
      const newData: any = {};
      newData[property] = value;
      try {
        this.selectedItem.update(newData);
        await this.editService.updateItems([this.selectedItem], [property]);
      } catch (err) {
        if (err instanceof FolderResponse || err instanceof RecordResponse ) {
          const revertData: any = {};
          revertData[property] = originalValue;
          this.selectedItem.update(revertData);
        }
      }
    }
  }

  onLocationClick() {
    if (this.canEdit) {
      this.editService.openLocationDialog(this.selectedItem);
    }
  }

  onShareClick() {
    this.editService.openShareDialog(this.selectedItem);
  }

  getFolderContentsCount() {
    if (this.selectedItem instanceof FolderVO && this.selectedItem.FolderSizeVO) {
      const fileCount = this.selectedItem.FolderSizeVO.allRecordCountShallow;
      const folderCount = this.selectedItem.FolderSizeVO.allFolderCountShallow;
      const fileLabel = fileCount > 1 ? 'files' : 'file';
      const folderLabel = folderCount > 1 ? 'folders' : 'folder';

      if (fileCount && folderCount) {
        return `${folderCount} ${folderLabel} and ${fileCount} ${fileLabel}`;
      } else if (fileCount) {
        return `${fileCount} ${fileLabel}`;
      } else if (folderCount) {
        return `${folderCount} ${folderLabel}`;
      } else {
        return 'Empty';
      }
    }
  }

}
