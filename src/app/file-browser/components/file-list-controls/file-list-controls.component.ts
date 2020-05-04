import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { Subscription, Subject } from 'rxjs';
import { min } from 'lodash';
import { AccountService } from '@shared/services/account/account.service';
import { ItemVO, AccessRole, SortType, FolderVO } from '@models/index';
import { getAccessAsEnum } from '@models/access-role';
import { fadeAnimation, ngIfFadeInAnimation } from '@shared/animations';
import { FolderResponse } from '@shared/services/api/index.repo';
import { EditService } from '@core/services/edit/edit.service';
import { ApiService } from '@shared/services/api/api.service';


interface FileListActions {
  delete: boolean;
  copy: boolean;
  move: boolean;
  share: boolean;
  publish: boolean;
  download: boolean;
}

type FileListColumn = 'name' | 'date' | 'type';

@Component({
  selector: 'pr-file-list-controls',
  templateUrl: './file-list-controls.component.html',
  styleUrls: ['./file-list-controls.component.scss'],
  animations: [
    ngIfFadeInAnimation
  ]
})
export class FileListControlsComponent implements OnInit, OnDestroy, HasSubscriptions {
  public isSorting$ = new Subject<boolean>();

  currentSort: FileListColumn;
  sortDesc = false;

  isSavingSort = false;
  isSorting = false;
  canSaveSort = false;

  can: FileListActions = {
    delete: false,
    copy: false,
    move: false,
    share: false,
    publish: false,
    download: false
  };

  subscriptions: Subscription[] = [];
  selectedItems: ItemVO[] = [];

  initialSortType: SortType;

  constructor(
    private data: DataService,
    private account: AccountService,
    private api: ApiService
  ) {
    this.getSortFromCurrentFolder();
    this.initialSortType = this.data.currentFolder.sort;
    this.subscriptions.push(
      this.data.selectedItems$().subscribe(items => {
        this.selectedItems = Array.from(items.keys());
        this.setAvailableActions();
      })
    );

    this.canSaveSort = this.account.checkMinimumAccess(this.data.currentFolder.accessRole, AccessRole.Curator);
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    unsubscribeAll(this.subscriptions);
  }

  setAvailableActions() {
    this.setAllActions(false);

    if (!this.selectedItems.length) {
      return this.setAllActions(false);
    }

    if (!this.account.checkMinimumArchiveAccess(AccessRole.Curator)) {
      return this.can.download = true;
    }

    const isSingleItem = this.selectedItems.length === 1;
    const minimumAccess = min(this.selectedItems.map(i => getAccessAsEnum(i.accessRole)));

    switch (minimumAccess) {
      case AccessRole.Viewer:
        return this.can.download = true;
      case AccessRole.Curator:
        return this.setMultipleActions(['delete', 'copy', 'move'], true);
      case AccessRole.Owner:
        if (isSingleItem) {
          return this.setAllActions(true);
        } else {
          return this.setMultipleActions(['delete', 'copy', 'move', 'download'], true);
        }
    }
  }

  setAllActions(enabled: boolean) {
    this.setMultipleActions(['delete', 'copy', 'move', 'share', 'publish', 'download'], enabled);
  }

  setMultipleActions(actions: (keyof FileListActions)[], enabled: boolean) {
    for (const action of actions) {
      this.can[action] = enabled;
    }
  }

  getSortFromCurrentFolder() {
    const sort = this.data.currentFolder.sort;
    if (!sort || sort.includes('alpha')) {
      this.currentSort = 'name';
    } else if (sort.includes('type')) {
      this.currentSort = 'type';
    } else if (sort.includes('display_date')) {
      this.currentSort = 'date';
    } else {
      this.currentSort = 'name';
    }

    this.sortDesc = sort && sort.includes('desc');
  }

  onSortClick(column: FileListColumn) {
    let desc = false;
    if (this.currentSort === column) {
      desc = !this.sortDesc;
    }

    let sortType: SortType;

    switch (column) {
      case 'name':
        sortType = desc ? 'sort.alphabetical_desc' : 'sort.alphabetical_asc';
        break;
      case 'type':
        sortType = desc ? 'sort.type_desc' : 'sort.type_asc';
        break;
      case 'date':
        sortType = desc ? 'sort.display_date_desc' : 'sort.display_date_asc';
        break;
    }

    this.setSort(sortType);
  }

  isSortChanged() {
    return this.initialSortType !== this.data.currentFolder.sort;
  }

  async setSort(sort: SortType) {
    if (this.isSorting) {
      return;
    }

    this.isSorting = true;
    const originalSort = this.data.currentFolder.sort;
    this.data.currentFolder.update({sort});
    this.getSortFromCurrentFolder();
    try {
      this.isSorting$.next(true);
      await this.data.refreshCurrentFolder(true);
    } catch (err) {
      this.data.currentFolder.update({ sort: originalSort });
      this.getSortFromCurrentFolder();
      console.error('sort error');
    } finally {
      this.isSorting = false;
      this.isSorting$.next(false);
    }
  }

  async saveSort() {
    if (this.isSavingSort) {
      return;
    }

    try {
      this.isSavingSort = true;
      await this.api.folder.sort([this.data.currentFolder]);
      this.initialSortType = this.data.currentFolder.sort;
    } catch (err) {
      if (err instanceof FolderResponse) {
        console.error('sort save error!');
      }
    } finally {
      this.isSavingSort = false;
    }
  }

}
