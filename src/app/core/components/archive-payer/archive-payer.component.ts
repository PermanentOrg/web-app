import { Dialog } from '@root/app/dialog/dialog.module';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ArchiveVO } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';
import { PayerService } from '@shared/services/payer/payer.service';
import { SwitcherComponent } from '@shared/components/switcher/switcher.component';
import { AccountVO } from '../../../models/account-vo';
import { ApiService } from '../../../shared/services/api/api.service';
import { MessageService } from '../../../shared/services/message/message.service';

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

  @ViewChild(SwitcherComponent, { static: false }) payerSet: SwitcherComponent;

  public account: AccountVO;
  public hasPayer: boolean = false;
  public isPayerDifferentThanLoggedUser: boolean = false;
  public hasAccess: boolean;

  constructor(
    private accountService: AccountService,
    private dialog: Dialog,
    private api: ApiService,
    private msg: MessageService,
    private payerService: PayerService
  ) {
    this.account = this.accountService.getAccount();
  }

  ngOnInit(): void {
    const accessRole = this.accountService.getArchive()?.accessRole;
    this.hasAccess =
      accessRole === 'access.role.owner' ||
      accessRole === 'access.role.manager';

    this.hasPayer = !!this.payer;
    if (this.hasPayer) {
      this.payerService.payerId = this.payer.accountId;
    }
    this.isPayerDifferentThanLoggedUser =
      this.account?.accountId !== this.archive?.payerAccountId;
  }

  setArchivePayer(data) {
    this.dialog.open(
      'ConfirmPayerDialogComponent',
      {
        ...data,
      },
      { width: '550px' }
    );
  }

  async handleAccountInfoChange(val: boolean) {
    this.archive.payerAccountId = !val ? this.account.accountId : null;
    try {
      this.api.archive.update(this.archive);
      this.hasPayer = !val;
      this.isPayerDifferentThanLoggedUser = val;
      this.payerService.payerId = this.archive.payerAccountId;
    } catch (e) {
      this.msg.showError({
        message: 'Something went wrong. Please try again.',
      });
    }
  }

  cancelAccountPayerSet() {
    this.payerSet.switch.nativeElement.checked =
      !this.isPayerDifferentThanLoggedUser;
  }
}
