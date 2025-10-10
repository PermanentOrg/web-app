import { Component } from '@angular/core';
import {
	UntypedFormGroup,
	UntypedFormBuilder,
	Validators,
} from '@angular/forms';
import { APP_CONFIG } from '@root/app/app.config';
import { AccountVO } from '@root/app/models';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '@shared/services/account/account.service';
import { PledgeService } from '@pledge/services/pledge.service';
import { ApiService } from '@shared/services/api/api.service';
import { PledgeData } from '../new-pledge/new-pledge.component';

const MIN_PASSWORD_LENGTH = APP_CONFIG.passwordMinLength;

@Component({
	selector: 'pr-claim-storage',
	templateUrl: './claim-storage.component.html',
	styleUrls: ['./claim-storage.component.scss'],
	standalone: false,
})
export class ClaimStorageComponent {
	public signupForm: UntypedFormGroup;
	public pledge: PledgeData = this.pledgeService.currentPledgeData;

	public waiting: boolean;
	public storageAmount: number;

	constructor(
		fb: UntypedFormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private api: ApiService,
		private accountService: AccountService,
		private pledgeService: PledgeService,
	) {
		if (!pledgeService.currentPledgeData) {
			this.router.navigate(['..'], { relativeTo: this.route });
			return;
		} else if (!pledgeService.currentPledgeData.timestamp) {
			this.router.navigate(['..', 'missing'], { relativeTo: this.route });
			return;
		}

		this.pledge = pledgeService.currentPledgeData;

		this.signupForm = fb.group({
			email: [this.pledge.email || '', [Validators.required, Validators.email]],
			name: [this.pledge.name || '', Validators.required],
			password: [
				'',
				[Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)],
			],
			agreed: [false, [Validators.requiredTrue]],
			optIn: [true],
		});
	}

	async onSubmit(formValue: any) {
		this.waiting = true;

		this.accountService
			.signUp(
				formValue.email,
				formValue.name,
				formValue.password,
				formValue.password,
				formValue.agreed,
				formValue.optIn,
				null,
				null,
				true,
			)
			.then(async (account: AccountVO) => {
				await this.pledgeService.linkAccount(account);
				await this.accountService.logIn(
					formValue.email,
					formValue.password,
					true,
					true,
				);

				const billingVo = this.pledgeService.createBillingPaymentVo(account);

				const billingResponse = await this.api.billing.claimPledge(
					billingVo,
					this.pledgeService.getPledgeId(),
				);

				this.waiting = false;

				if (billingResponse.isSuccessful) {
					this.router.navigate(['..', 'done'], { relativeTo: this.route });
				}
			})
			.catch((err) => {
				this.waiting = false;
			});
	}
}
