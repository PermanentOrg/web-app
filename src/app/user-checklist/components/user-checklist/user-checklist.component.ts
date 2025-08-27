import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CHECKLIST_API, ChecklistApi } from '../../types/checklist-api';
import { ChecklistItem } from '../../types/checklist-item';

@Component({
	selector: 'pr-user-checklist',
	templateUrl: './user-checklist.component.html',
	styleUrl: './user-checklist.component.scss',
	standalone: false,
})
export class UserChecklistComponent implements OnInit, OnDestroy {
	public items: ChecklistItem[] = [];
	public percentage: number = 0;
	public isOpen: boolean = true;
	public isDisplayed: boolean = true;

	private archiveSubscription: Subscription;
	private refreshSubscription: Subscription;

	constructor(@Inject(CHECKLIST_API) private api: ChecklistApi) {}

	public ngOnInit(): void {
		this.archiveSubscription = this.api
			.getArchiveChangedEvent()
			.subscribe(() => {
				this.hideChecklistIfNotOwnedOrDefault();
			});

		this.refreshSubscription = this.api
			.getRefreshChecklistEvent()
			.subscribe(() => {
				this.refreshChecklist();
			});

		if (this.hideChecklistIfNotOwnedOrDefault()) {
			return;
		}

		this.refreshChecklist();
	}

	public ngOnDestroy(): void {
		this.archiveSubscription?.unsubscribe();
		this.refreshSubscription?.unsubscribe();
	}

	public minimize(): void {
		this.isOpen = false;
	}

	public open(): void {
		this.isOpen = true;
	}

	public async hideChecklistForever(): Promise<void> {
		this.isDisplayed = false;
		try {
			await this.api.setChecklistHidden();
		} catch {
			// Fail silently
		}
	}

	private hideChecklistIfNotOwnedOrDefault(): boolean {
		if (
			this.api.isAccountHidingChecklist() ||
			!this.api.isDefaultArchiveOwnedByAccount()
		) {
			this.isDisplayed = false;
			return true;
		}
		this.isDisplayed = true;
		return false;
	}

	private refreshChecklist() {
		if (this.isDisplayed) {
			this.api
				.getChecklistItems()
				.then((items) => {
					this.items = items;
					if (this.items.length > 0) {
						this.percentage =
							(this.items.reduce((sum, i) => sum + +i.completed, 0) /
								this.items.length) *
							100;
					}
				})
				.catch(() => {
					// fail silently and let the finally block hide the component
				})
				.finally(() => {
					if (this.items.length === 0) {
						this.isDisplayed = false;
					}
				});
		}
	}
}
