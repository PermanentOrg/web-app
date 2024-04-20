/* @format */
import { AccountVO } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../shared/services/api/api.service';
import { MessageService } from '../../../shared/services/message/message.service';

@Component({
  selector: 'pr-advanced-settings',
  templateUrl: './advanced-settings.component.html',
  styleUrls: ['./advanced-settings.component.scss'],
})
export class AdvancedSettingsComponent implements OnInit {
  public allowSFTPDeletion: number;
  public updating: boolean = false;
  private account: AccountVO;

  constructor(
    private accountService: AccountService,
    private api: ApiService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.account = this.accountService.getAccount();
    this.allowSFTPDeletion = +this.account.allowSftpDeletion;
  }

  public async onAllowSFTPDeletion() {
    this.account.allowSftpDeletion = !!this.allowSFTPDeletion;
    try {
      this.updating = true;
      await this.api.account.update(this.account);
      this.accountService.setAccount(this.account);
    } catch (error) {
      this.messageService.showError({ message: 'Something went wrong!' });
    } finally {
      this.updating = false;
    }
  }
}
