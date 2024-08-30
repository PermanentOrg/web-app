/* @format */
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { FileSizePipe } from '@shared/pipes/filesize.pipe';
import { AccountService } from '@shared/services/account/account.service';
import { EventService } from '@shared/services/event/event.service';
import { DialogRef } from '@angular/cdk/dialog';

type StorageDialogTab = 'add' | 'file' | 'transaction' | 'promo' | 'gift';

interface StorageRedemptionMessage {
  successful: boolean;
  message: string;
}

@Component({
  selector: 'pr-storage-dialog',
  templateUrl: './storage-dialog.component.html',
  styleUrls: ['./storage-dialog.component.scss'],
})
export class StorageDialogComponent implements OnInit, OnDestroy {
  activeTab: StorageDialogTab = 'add';

  promoForm: UntypedFormGroup;

  waiting: boolean;

  tabs = ['add', 'gift', 'promo', 'transaction', 'file'];
  subscriptions: Subscription[] = [];

  public resultMessage: StorageRedemptionMessage | undefined;

  constructor(
    private fb: UntypedFormBuilder,
    private dialogRef: DialogRef,
    private account: AccountService,
    private api: ApiService,
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
      await this.handleValidPromoCode(response);
    } catch (err: unknown) {
      this.showPromoCodeError(err);
    } finally {
      this.waiting = false;
    }
  }

  private showPromoCodeError(err: unknown) {
    const message =
      err instanceof BillingResponse || err instanceof AccountResponse
        ? err.getMessage()
        : 'There was an error redeeming your code.';
    this.resultMessage = { message, successful: false };
  }

  private async handleValidPromoCode(response: BillingResponse) {
    await this.updateAccountStorageBytes(response);
    this.event.dispatch({
      entity: 'account',
      action: 'submit_promo',
    });
    this.promoForm.reset();
  }

  private async updateAccountStorageBytes(response: BillingResponse) {
    await this.account.refreshAccount();
    const promo = response.getPromoVO();
    const bytes = promo.sizeInMB * (1024 * 1024);
    this.account.addStorageBytes(bytes);
    this.showPromoCodeSuccess(bytes);
  }

  private showPromoCodeSuccess(bytes: number) {
    const pipe = new FileSizePipe();
    this.resultMessage = {
      message: `Gift code redeemed for ${pipe.transform(bytes)} of storage`,
      successful: true,
    };
  }
}
