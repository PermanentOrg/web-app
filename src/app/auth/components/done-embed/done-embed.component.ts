import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@root/app/models';
import { query } from '../../../../../node_modules/@angular/core/src/render3/query';

@Component({
  selector: 'pr-done-embed',
  templateUrl: './done-embed.component.html',
  styleUrls: ['./done-embed.component.scss']
})
export class DoneEmbedComponent implements OnInit {
  account: AccountVO;
  existingAccount: boolean;

  constructor(private accountService: AccountService, private route: ActivatedRoute) { }

  ngOnInit() {
    const queryParams = this.route.snapshot.queryParams;
    console.log('done-embed.component.ts', 20, queryParams);
    if (queryParams.existing) {
      this.existingAccount = true;
    }

    console.log('done-embed.component.ts', 26, this.existingAccount);

    this.account = this.accountService.getAccount();
  }

}
