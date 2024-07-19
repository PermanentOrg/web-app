/* @format */
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IsTabbedDialog } from '@root/app/dialog/dialog.module';

import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { PromoVOData } from '@models';
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
<<<<<<< HEAD
import { EventService } from '@shared/services/event/event.service';
=======
import { DeviceService } from '@shared/services/device/device.service';
import { AnalyticsService } from '@shared/services/analytics/analytics.service';
import { DialogRef } from '@angular/cdk/dialog';
import { UploadService } from '@core/services/upload/upload.service';
>>>>>>> 8b92536d (Changed all the files to use the dialog cdk.)

type StorageDialogTab = 'add' | 'file' | 'transaction' | 'promo' | 'gift';

@Component({
  selector: 'pr-storage-dialog',
  templateUrl: './storage-dialog.component.html',
  styleUrls: ['./storage-dialog.component.scss'],
  providers: [UploadService],
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
    private event: EventService,
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
      this.event.dispatch({
        action: 'open_promo_entry',
        entity: 'account',
      });
    }
  }

  onDoneClick() {
    this.dialogRef.close();
  }

  async onPromoFormSubmit(value: PromoVOData) {
    try {
      this.waiting = true;
      const response = await this.api.billing.redeemPromoCode(value);
      await this.account.refreshAccount();
      const promo = response.getPromoVO();
      const bytes = promo.sizeInMB * (1024 * 1024);
      this.account.addStorageBytes(bytes);
      this.event.dispatch({
        entity: 'account',
        action: 'submit_promo',
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
