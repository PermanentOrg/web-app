import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PledgeService } from '@pledge/services/pledge.service';

@Component({
	selector: 'pr-claim-done',
	templateUrl: './claim-done.component.html',
	styleUrls: ['./claim-done.component.scss'],
	standalone: false,
})
export class ClaimDoneComponent implements OnInit {
	public storageAmount: number;

	constructor(
		private accountService: AccountService,
		private router: Router,
		private route: ActivatedRoute,
		private pledgeService: PledgeService,
	) {}

	async ngOnInit() {
		const loggedIn = this.accountService.isLoggedIn();

		if (!loggedIn && this.pledgeService.currentPledge) {
			return await this.router.navigate(['..', 'claim'], {
				relativeTo: this.route,
			});
		} else if (!this.pledgeService.currentPledge) {
			return await this.router.navigate(['..'], { relativeTo: this.route });
		}

		this.storageAmount = Math.floor(
			this.pledgeService.currentPledgeData.dollarAmount / 10,
		);
	}
}
