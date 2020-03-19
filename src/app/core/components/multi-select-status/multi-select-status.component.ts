import { Component, OnInit, HostBinding, OnDestroy } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { Subscription } from 'rxjs';
import { ItemVO } from '@models/index';

@Component({
  selector: 'pr-multi-select-status',
  templateUrl: './multi-select-status.component.html',
  styleUrls: ['./multi-select-status.component.scss']
})
export class MultiSelectStatusComponent implements OnInit, OnDestroy {
  @HostBinding('class.visible') isMultiSelectEnabled = false;
  isMultiSelectEnabledSubscription: Subscription;

  public multiSelectItems: Map<number, ItemVO> = new Map();

  constructor(
    private data: DataService
  ) {
    this.multiSelectItems = this.data.multiSelectItems;
    this.isMultiSelectEnabledSubscription = this.data.multiSelectChange.subscribe(enabled => {
      this.isMultiSelectEnabled = enabled;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.isMultiSelectEnabledSubscription.unsubscribe();
  }

}
