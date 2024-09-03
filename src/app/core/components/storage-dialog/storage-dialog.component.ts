/* @format */
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { EventService } from '@shared/services/event/event.service';
import { DialogRef } from '@angular/cdk/dialog';

type StorageDialogTab = 'add' | 'file' | 'transaction' | 'promo' | 'gift';
@Component({
  selector: 'pr-storage-dialog',
  templateUrl: './storage-dialog.component.html',
  styleUrls: ['./storage-dialog.component.scss'],
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
  ) {}

  public ngOnInit(): void {
    this.subscriptions.push(
      this.route.paramMap.subscribe((params: ParamMap) => {
        const path = params.get('path') as StorageDialogTab;

        if (path && this.tabs.includes(path)) {
          this.activeTab = path;
        } else {
          this.activeTab = 'add';
        }
      }),

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
    }
  }

  public onDoneClick() {
    this.dialogRef.close();
  }
}
