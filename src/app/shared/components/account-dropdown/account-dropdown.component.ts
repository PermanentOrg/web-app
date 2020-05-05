import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO, ArchiveVO } from '@models';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';
import { MessageService } from '@shared/services/message/message.service';
import { Router } from '@angular/router';

@Component({
  selector: 'pr-account-dropdown',
  templateUrl: './account-dropdown.component.html',
  styleUrls: ['./account-dropdown.component.scss']
})
export class AccountDropdownComponent implements OnInit, OnDestroy, HasSubscriptions {
  public account: AccountVO;
  public archive: ArchiveVO;

  public subscriptions: Subscription[] = [];

  public showMenu = false;

  constructor(
    private accountService: AccountService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.account = this.accountService.getAccount();
    this.archive = this.accountService.getArchive();
    this.subscriptions.push(this.accountService.accountChange.subscribe(account => {
      this.account = account;
    }));
    this.subscriptions.push(this.accountService.archiveChange.subscribe(archive => {
      this.archive = archive;
    }));
  }

  ngOnDestroy() {
    unsubscribeAll(this.subscriptions);
  }

  async onLogoutClick() {
    await this.accountService.logOut();
    this.messageService.showMessage(`Logged out successfully`, 'success');
    this.router.navigate(['/login']);
  }

}
