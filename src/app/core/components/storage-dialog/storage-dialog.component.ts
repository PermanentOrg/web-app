import { Component, OnInit } from '@angular/core';
import { IsTabbedDialog, DialogRef } from '@root/app/dialog/dialog.module';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PromoVOData } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import { BillingResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';
import { FileSizePipe } from '@shared/pipes/filesize.pipe';

type StorageDialogTab = 'add' | 'history' | 'promo';

@Component({
  selector: 'pr-storage-dialog',
  templateUrl: './storage-dialog.component.html',
  styleUrls: ['./storage-dialog.component.scss']
})
export class StorageDialogComponent implements OnInit, IsTabbedDialog {
  activeTab: StorageDialogTab = 'add';

  promoForm: FormGroup;

  waiting: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: DialogRef,
    private api: ApiService,
    private message: MessageService,
  ) {
    this.promoForm = this.fb.group({
      code: ['', [ Validators.required ]]
    });
  }

  ngOnInit(): void {
  }

  setTab(tab: StorageDialogTab) {
    this.activeTab = tab;
  }

  onDoneClick() {
    this.dialogRef.close();
  }

  async onPromoFormSubmit(value: PromoVOData) {
    try {
      this.waiting = true;
      const response = await this.api.billing.redeemPromoCode(value);
      const promo = response.getPromoVO();
      const bytes = promo.sizeInMB * (1024 * 1024);
      const pipe = new FileSizePipe();
      this.message.showMessage(`Gift code redeemed for ${pipe.transform(bytes)} of storage`, 'success');
      this.promoForm.reset();
    } catch (err) {
      if (err instanceof BillingResponse) {
        this.message.showError(err.getMessage(), true);
      }
    } finally {
      this.waiting = false;
    }
  }
}
