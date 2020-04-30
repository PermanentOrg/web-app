import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';
import { some } from 'lodash';
import { ItemVO } from '@models/index';
import { DataStatus } from '@models/data-status.enum';

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

  constructor(
    private dataService: DataService
  ) {
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

        if (this.selectedItem !== this.dataService.currentFolder) {
          const items = this.selectedItems || [this.selectedItem];
          this.isLoading = some(items, i => i.dataStatus < DataStatus.Lean);
          await this.dataService.fetchLeanItems(items);
          this.isLoading = false;
        }
      })
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    unsubscribeAll(this.subscriptions);
  }

  setCurrentTab(tab: SidebarTab) {
    this.currentTab = tab;
  }

}
