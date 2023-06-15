/* @format */
import { MessageService } from '../../../shared/services/message/message.service';
import { ApiService } from '../../../shared/services/api/api.service';
import { Dialog } from '@root/app/dialog/dialog.module';
import { AccountVO } from '../../../models/account-vo';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ArchiveVO } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'pr-archive-payer',
  templateUrl: './archive-payer.component.html',
  styleUrls: ['./archive-payer.component.scss'],
})
export class ArchivePayerComponent implements OnInit {
  @Input() public archive: ArchiveVO;
  @Input() public payer: AccountVO;

  roles = {
    'access.role.owner': 'Owner',
    'access.role.manager': 'Manager',
  };

  @ViewChild('payerSet') payerSet: ElementRef;

  email: string = '';
  name: string = '';
  role: string = '';
  account: AccountVO;
  hasPayer: boolean = false;
  isPayerDifferentThanLoggedUser: boolean = false;

  constructor(
    private accountService: AccountService,
    private dialog: Dialog,
    private api: ApiService,
    private msg: MessageService
  ) {
    this.account = this.accountService.getAccount();
  }

  ngOnInit(): void {
    this.hasPayer = !!this.archive?.payerAccountId;
    this.isPayerDifferentThanLoggedUser =
      this.account?.accountId !== this.archive?.payerAccountId;
  }

  setArchivePayer() {
    this.dialog.open(
      'ConfirmPayerDialogComponent',
      {
        archiveId: this.archive.archiveId,
        isPayerDifferentThanLoggedUser: this.isPayerDifferentThanLoggedUser,
        handleAccountInfoChange: this.handleAccountInfoChange.bind(this),
        cancelAccountPayerSet: this.cancelAccountPayerSet.bind(this),
      },
      { width: '550px' }
    );
  }

  async handleAccountInfoChange(val: boolean) {
    this.archive.payerAccountId = !val ? this.account.accountId : null;
    try {
      this.api.archive.update(this.archive);
    } catch (e) {
      this.msg.showError('Something went wrong. Please try again.');
    } finally {
      this.hasPayer = !val;
      this.isPayerDifferentThanLoggedUser = val;
    }
  }

  cancelAccountPayerSet() {
    this.payerSet.nativeElement.checked = false;
  }
}
