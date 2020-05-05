import { Component, OnInit, HostBinding, OnDestroy } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { Subscription } from 'rxjs';
import { ItemVO } from '@models';
import { EditService, ItemActions } from '@core/services/edit/edit.service';
import { PromptButton } from '@core/services/prompt/prompt.service';

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
    private data: DataService,
    private edit: EditService
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

  onDoneClick() {
    const items: ItemVO[] = [];
    this.multiSelectItems.forEach(i => items.push(i));
    this.data.setMultiSelect(false);

    const actions: PromptButton[] = [
      ItemActions.Move,
      ItemActions.Copy,
      ItemActions.Delete,
      {
        buttonName: 'cancel',
        buttonText: 'Cancel',
        class: 'btn-secondary'
      }
    ];

    this.edit.promptForAction(items, actions);
  }

}
