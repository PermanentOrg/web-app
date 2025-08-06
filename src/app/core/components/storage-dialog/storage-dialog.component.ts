import { ActivatedRoute, ParamMap } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { EventService } from '@shared/services/event/event.service';
import { DialogRef } from '@angular/cdk/dialog';

const dialogTabs = ['add', 'file', 'transaction', 'promo', 'gift'] as const;

type StorageDialogTab = (typeof dialogTabs)[number];
@Component({
	selector: 'pr-storage-dialog',
	templateUrl: './storage-dialog.component.html',
	styleUrls: ['./storage-dialog.component.scss'],
	standalone: false,
})
export class StorageDialogComponent implements OnInit, OnDestroy {
	public activeTab: StorageDialogTab = 'add';
	public tabs = ['add', 'gift', 'promo', 'transaction', 'file'];
	public subscriptions: Subscription[] = [];
	public promoCode: string | undefined;

	constructor(
		private dialogRef: DialogRef,
		private route: ActivatedRoute,
		private event: EventService,
	) {
		if (([...dialogTabs] as string[]).includes(route.snapshot.fragment)) {
			this.activeTab = route.snapshot.fragment as StorageDialogTab;
		}
	}

	public ngOnInit(): void {
		this.subscriptions.push(
			this.route.queryParamMap.subscribe((params) => {
				const param = params.get('promoCode');
				if (this.activeTab === 'promo' && param) {
					this.promoCode = param;
				}
			}),
		);
	}

	public ngOnDestroy(): void {
		unsubscribeAll(this.subscriptions);
	}

	public setTab(tab: StorageDialogTab) {
		this.activeTab = tab;
		if (tab === 'promo') {
			this.event.dispatch({
				action: 'open_promo_entry',
				entity: 'account',
			});
			this.event.dispatch({
				action: 'open_redeem_gift',
				entity: 'account',
			});
		}
	}

	public onDoneClick() {
		this.dialogRef.close();
	}
}
