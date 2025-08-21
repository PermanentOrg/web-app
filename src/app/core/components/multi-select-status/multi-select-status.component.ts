import { Component, HostBinding, OnDestroy } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { Subscription } from 'rxjs';
import { ItemVO } from '@models';
import { EditService, ItemActions } from '@core/services/edit/edit.service';
import { PromptButton } from '@shared/services/prompt/prompt.service';

@Component({
	selector: 'pr-multi-select-status',
	templateUrl: './multi-select-status.component.html',
	styleUrls: ['./multi-select-status.component.scss'],
	standalone: false,
})
export class MultiSelectStatusComponent implements OnDestroy {
	@HostBinding('class.visible') isMultiSelectEnabled = false;
	isMultiSelectEnabledSubscription: Subscription;

	public multiclickItems: Map<number, ItemVO> = new Map();

	constructor(
		private data: DataService,
		private edit: EditService,
	) {
		this.multiclickItems = this.data.multiclickItems;
		this.isMultiSelectEnabledSubscription =
			this.data.multiSelectChange.subscribe((enabled) => {
				this.isMultiSelectEnabled = enabled;
			});
	}

	ngOnDestroy() {
		this.isMultiSelectEnabledSubscription.unsubscribe();
	}

	onDoneClick() {
		const items: ItemVO[] = [];
		this.multiclickItems.forEach((i) => items.push(i));
		this.data.setMultiSelect(false);

		const actions: PromptButton[] = [
			ItemActions.Move,
			ItemActions.Copy,
			ItemActions.Delete,
			{
				buttonName: 'cancel',
				buttonText: 'Cancel',
				class: 'btn-secondary',
			},
		];

		this.edit.promptForAction(items, actions);
	}
}
