import { Component, OnInit } from '@angular/core';
import { LedgerFinancialVOData } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { BillingResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';
import { chunk } from 'lodash';
import { DeviceService } from '@shared/services/device/device.service';

@Component({
  selector: 'pr-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit {
  currentPage = 1;
  pageSize = 10;
  maxPageCount = 10;
  ledgerItemCount = 0;
  ledgerItemPages: LedgerFinancialVOData[][];
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
    this.loadTransactionHistory();
  }

  async loadTransactionHistory() {
    try {
      const response = await this.api.billing.getTransactionHistory(this.account.getAccount());
      const ledgerItems = response.getLedgerFinancialVOs().reverse();
      this.ledgerItemCount = ledgerItems.length;
      this.ledgerItemPages = chunk(ledgerItems, this.pageSize);
    } catch (err) {
      this.message.showError('There was a problem loading your file history.');
      this.error = true;
      throw err;
    } finally {
      this.loading = false;
    }
  }

}
