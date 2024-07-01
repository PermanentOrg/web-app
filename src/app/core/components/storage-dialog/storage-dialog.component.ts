/* @format */
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IsTabbedDialog, DialogRef } from '@root/app/dialog/dialog.module';

import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { PromoVOData, AccountVO } from '@models';
import { Subscription } from 'rxjs';
import { ApiService } from '@shared/services/api/api.service';
import {
  BillingResponse,
  AccountResponse,
} from '@shared/services/api/index.repo';
import { unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { MessageService } from '@shared/services/message/message.service';
import { FileSizePipe } from '@shared/pipes/filesize.pipe';
import { AccountService } from '@shared/services/account/account.service';
import { DeviceService } from '@shared/services/device/device.service';
import { EventService } from '@shared/services/event/event.service';

type StorageDialogTab = 'add' | 'file' | 'transaction' | 'promo' | 'gift';

@Component({
  selector: 'pr-storage-dialog',
  templateUrl: './storage-dialog.component.html',
  styleUrls: ['./storage-dialog.component.scss'],
})
export class StorageDialogComponent
  implements OnInit, IsTabbedDialog, OnDestroy
{
  activeTab: StorageDialogTab = 'add';

  promoForm: UntypedFormGroup;

  waiting: boolean;

  tabs = ['add', 'gift', 'promo', 'transaction', 'file'];
  subscriptions: Subscription[] = [];

  private TELLYOURSTORY = 'TellYourStory';

  constructor(
    private fb: UntypedFormBuilder,
    private dialogRef: DialogRef,
    private account: AccountService,
    private api: ApiService,
    private message: MessageService,
    private route: ActivatedRoute,
    private device: DeviceService,
    private analytics: EventService,
  ) {
    this.promoForm = this.fb.group({
      code: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
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
          this.promoForm.setValue({ code: param });
        }
      }),
    );
  }

  ngOnDestroy(): void {
    unsubscribeAll(this.subscriptions);
  }

  setTab(tab: StorageDialogTab) {
    this.activeTab = tab;
    if (tab === 'promo') {
      const pageView = this.device.getViewMessageForEventTracking();
      const account = this.account.getAccount();
      this.analytics.notifyObservers({
        action: 'open_promo_entry',
        entity: 'account',
        version: 1,
        entityId: account.accountId.toString(),
        body: {
          analytics: {
            event: pageView,
            data: {
              page: 'Redeem Gift',
            },
          },
        },
      });
    }
  }

  onDoneClick() {
    this.dialogRef.close();
  }

  async onPromoFormSubmit(value: PromoVOData) {
    try {
      this.waiting = true;
      const account = this.account.getAccount();
      const response = await this.api.billing.redeemPromoCode(value);
      await this.account.refreshAccount();
      const promo = response.getPromoVO();
      const bytes = promo.sizeInMB * (1024 * 1024);
      this.account.addStorageBytes(bytes);
      await this.analytics.notifyObservers({
        entity: 'account',
        action: 'submit_promo',
        version: 1,
        entityId: account.accountId.toString(),
        body: {
          analytics: {
            event: 'Redeem Gift',
            data: {},
          },
        },
      });
      const pipe = new FileSizePipe();
      this.message.showMessage({
        message: `Gift code redeemed for ${pipe.transform(bytes)} of storage`,
        style: 'success',
      });
      this.promoForm.reset();
    } catch (err) {
      if (err instanceof BillingResponse || err instanceof AccountResponse) {
        this.message.showError({ message: err.getMessage(), translate: true });
      } else {
        this.message.showError({
          message: 'There was an error redeeming your code.',
        });
      }
    } finally {
      this.waiting = false;
    }
  }
  public getAccountForTesting() {
    return this.account;
  }
}
