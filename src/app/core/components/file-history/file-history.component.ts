import { Component, OnInit } from '@angular/core';
import { LedgerNonfinancialVOData } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { BillingResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';
import { chunk } from 'lodash';
import { DeviceService } from '@shared/services/device/device.service';

@Component({
  selector: 'pr-file-history',
  templateUrl: './file-history.component.html',
  styleUrls: ['./file-history.component.scss'],
})
export class FileHistoryComponent implements OnInit {
  currentPage = 1;
  pageSize = 10;
  maxPageCount = 10;
  ledgerItemCount = 0;
  ledgerItemPages: LedgerNonfinancialVOData[][];
  loading = true;
  error = false;
  constructor(
    private api: ApiService,
    private account: AccountService,
    private message: MessageService,
    private device: DeviceService
  ) {
    if (this.device.isMobileWidth()) {
      this.maxPageCount = 5;
    }
  }

  ngOnInit() {
    this.loadFileHistory();
  }

  async loadFileHistory() {
    try {
      const response = await this.api.billing.getFileHistory(
        this.account.getAccount()
      );
      const ledgerItems = response.getLedgerNonfinancialVOs().reverse();
      this.ledgerItemCount = ledgerItems.length;
      this.ledgerItemPages = chunk(ledgerItems, this.pageSize);
    } catch (err) {
      this.message.showError({
        message: 'There was a problem loading your file history.',
      });
      this.error = true;
      throw err;
    } finally {
      this.loading = false;
    }
  }
}
