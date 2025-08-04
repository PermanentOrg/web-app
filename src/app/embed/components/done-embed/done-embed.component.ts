import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@root/app/models';

@Component({
  selector: 'pr-done-embed',
  templateUrl: './done-embed.component.html',
  styleUrls: ['./done-embed.component.scss'],
  standalone: false,
})
export class DoneEmbedComponent implements OnInit {
  account: AccountVO;
  existingAccount: boolean;
  linkToFacebook = false;

  constructor(
    private accountService: AccountService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams.existing) {
      this.existingAccount = true;
    }

    if (queryParams.inviteCode === 'facebook') {
      this.linkToFacebook = true;
    }

    this.account = this.accountService.getAccount();
  }
}
