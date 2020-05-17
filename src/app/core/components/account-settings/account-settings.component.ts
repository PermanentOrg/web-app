import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO, AccountVO } from '@models';

@Component({
  selector: 'pr-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  public account: AccountVO;
  constructor(
    private accountService: AccountService,
    private dataService: DataService
  ) {
    this.dataService.setCurrentFolder(new FolderVO({
      displayName: 'Account',
      pathAsText: ['Account'],
      type: 'page'
    }), true);

    this.account = this.accountService.getAccount();
  }

  ngOnInit(): void {
  }

}
