import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pr-file-list-controls',
  templateUrl: './file-list-controls.component.html',
  styleUrls: ['./file-list-controls.component.scss']
})
export class FileListControlsComponent implements OnInit, OnDestroy, HasSubscriptions {
  currentSort: 'name' | 'date' | 'type';
  sortDesc = false;

  subscriptions: Subscription[] = [];

  constructor(
    private data: DataService
  ) {
    this.getSortFromCurrentFolder();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    unsubscribeAll(this.subscriptions);
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

}
