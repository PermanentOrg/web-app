import { RecordVO } from '@root/app/models';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import {
  HasSubscriptions,
  unsubscribeAll,
} from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';
import { some } from 'lodash';
import { ItemVO, FolderVO, ArchiveVO, AccessRole } from '@models';
import { DataStatus } from '@models/data-status.enum';
import { EditService } from '@core/services/edit/edit.service';
import { AccountService } from '@shared/services/account/account.service';

import type { KeysOfType } from '@shared/utilities/keysoftype';

type SidebarTab = 'info' | 'details' | 'sharing' | 'views';
@Component({
  selector: 'pr-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy, HasSubscriptions {
  currentTab: SidebarTab = 'info';
  selectedItem: ItemVO = this.dataService.currentFolder;
  selectedItems: ItemVO[];

  subscriptions: Subscription[] = [];

  isLoading = false;
  isRootFolder = false;
  isPublicItem = false;

  currentArchive: ArchiveVO;

  canEdit: boolean;
  canShare: boolean;
  canUseViews: boolean;

  originalFileExtension: string = '';
  permanentFileExtension: string = '';

  constructor(
    private dataService: DataService,
    private editService: EditService,
    private accountService: AccountService
  ) {
    this.currentArchive = this.accountService.getArchive();

    this.subscriptions.push(
      this.dataService.selectedItems$().subscribe(async (selectedItems) => {
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

        this.isRootFolder = this.selectedItem?.type?.includes('root');
        this.isPublicItem =
          this.selectedItem?.type?.includes('public') ||
          this.selectedItem?.folder_linkType?.includes('public');

        this.checkPermissions();

        this.canUseViews =
          !this.isRootFolder &&
          this.isPublicItem &&
          this.selectedItem &&
          this.selectedItem.isFolder;

        if (this.isRootFolder) {
          this.setCurrentTab('info');
        }

        if (!this.canUseViews && this.currentTab === 'views') {
          this.setCurrentTab('info');
        }

        if (this.selectedItem !== this.dataService.currentFolder) {
          const items = this.selectedItems || [this.selectedItem];
          this.isLoading = some(items, (i) => i.dataStatus < DataStatus.Full);
          if (this.isLoading) {
            await this.dataService.fetchFullItems(items);
            this.isLoading = false;
          }
        }
        if (this.selectedItem instanceof RecordVO && this.selectedItem.FileVOs[0]) {
          const originalContentType = this.selectedItem.FileVOs[0].type
            .split('.')
            .pop();
          let convertedContentType = '';

          if (this.selectedItem.FileVOs[1]) {
            convertedContentType = this.selectedItem.FileVOs[1].type
              .split('.')
              .pop();
          } else {
            convertedContentType = originalContentType;
          }

          this.originalFileExtension = originalContentType;
          this.permanentFileExtension = convertedContentType;
        }
         else {
          this.originalFileExtension = '';
          this.permanentFileExtension = '';
        }
      })
    );
  }

  ngOnInit() {}

  ngOnDestroy() {
    unsubscribeAll(this.subscriptions);
  }

  checkPermissions() {
    const items = this.selectedItems || [this.selectedItem];
    const viewOnly = some(
      items,
      (i) =>
        i.accessRole === 'access.role.viewer' ||
        i.accessRole === 'access.role.contributor'
    );

    this.canEdit =
      !viewOnly &&
      this.accountService.checkMinimumArchiveAccess(AccessRole.Editor);

    if (items.length !== 1) {
      this.canShare = false;
    } else {
      this.canShare =
        !this.isPublicItem &&
        !this.isRootFolder &&
        this.accountService.checkMinimumAccess(
          this.selectedItem.accessRole,
          AccessRole.Owner
        );
    }
  }

  setCurrentTab(tab: SidebarTab) {
    if (tab === 'sharing' && (this.isRootFolder || this.isPublicItem)) {
      return;
    }

    if (tab === 'views' && !this.canUseViews) {
      return;
    }

    this.currentTab = tab;
  }

  async onFinishEditing(property: KeysOfType<ItemVO, String>, value: string) {
    this.editService.saveItemVoProperty(this.selectedItem, property, value);
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
    if (
      this.selectedItem instanceof FolderVO &&
      this.selectedItem.FolderSizeVO
    ) {
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
