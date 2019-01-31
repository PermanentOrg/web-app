import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { Router } from '@angular/router';
import { PledgeService } from '@pledge/services/pledge.service';

@Component({
  selector: 'pr-claim-done',
  templateUrl: './claim-done.component.html',
  styleUrls: ['./claim-done.component.scss']
})
export class ClaimDoneComponent implements OnInit {
  constructor(
    private accountService: AccountService,
    private router: Router,
    private pledgeService: PledgeService
  ) {
  }

  async ngOnInit() {
    const loggedIn = await this.accountService.isLoggedIn();

    if (!loggedIn && this.pledgeService.currentPledge) {
      this.router.navigate(['/pledge', 'claim']);
    } else if (!this.pledgeService.currentPledge) {
      this.router.navigate(['/pledge']);
    }
  }

}
