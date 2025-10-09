import { Component } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { Router, ActivatedRoute } from '@angular/router';
import {
	UntypedFormGroup,
	UntypedFormBuilder,
	Validators,
} from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from '@shared/services/api/api.service';
import { PledgeService } from '@pledge/services/pledge.service';
import { APP_CONFIG } from '@root/app/app.config';
import {
	AuthResponse,
	ArchiveResponse,
	AccountResponse,
} from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';

@Component({
	selector: 'pr-claim-storage-login',
	templateUrl: './claim-storage-login.component.html',
	styleUrls: ['./claim-storage-login.component.scss'],
	standalone: false,
})
export class ClaimStorageLoginComponent {
	public waiting = false;
	public loggedIn = false;
	public needsMfa = false;

	public loginForm: UntypedFormGroup;
	public mfaForm: UntypedFormGroup;

	constructor(
		private accountService: AccountService,
		private api: ApiService,
		private pledgeService: PledgeService,
		private router: Router,
		private route: ActivatedRoute,
		fb: UntypedFormBuilder,
		private message: MessageService,
		private cookies: CookieService,
	) {
		if (!pledgeService.currentPledge) {
			this.router.navigate(['..'], { relativeTo: this.route });
			return;
		}

		if (this.accountService.getAccount()) {
			this.loggedIn = true;
		}

		this.loginForm = fb.group({
			email: [
				this.cookies.get('rememberMe'),
				[Validators.required, Validators.email],
			],
			password: [
				'',
				[
					Validators.required,
					Validators.minLength(APP_CONFIG.passwordMinLength),
				],
			],
			rememberMe: [true],
			keepLoggedIn: [true],
		});

		this.mfaForm = fb.group({
			token: [],
		});
	}

	async logOut() {
		this.waiting = true;
		try {
			const response = await this.accountService.logOut();
			this.waiting = false;
			if (response.isSuccessful) {
				this.loggedIn = false;
				this.needsMfa = false;
			}
		} catch (err) {
			this.waiting = false;
		}
	}

	async onLoginSubmit(formValue: any) {
		this.waiting = true;

		this.accountService
			.logIn(
				formValue.email,
				formValue.password,
				formValue.rememberMe,
				formValue.keepLoggedIn,
			)
			.then(async (response: AuthResponse) => {
				this.waiting = false;
				if (response.needsMFA()) {
					this.needsMfa = true;
					this.message.showMessage({
						message: `Verify to continue as ${
							this.accountService.getAccount().primaryEmail
						}.`,
						style: 'warning',
					});
				} else {
					this.loggedIn = true;
				}
			})
			.catch((response: AuthResponse) => {
				this.waiting = false;

				if (
					response.messageIncludes &&
					response.messageIncludes('warning.signin.unknown')
				) {
					this.message.showMessage({
						message: 'Incorrect email or password.',
						style: 'danger',
					});
					this.loginForm.patchValue({
						password: '',
					});
				} else {
					this.message.showMessage({
						message: 'Log in failed. Please try again.',
						style: 'danger',
					});
				}
			});
	}

	async onMfaSubmit(formValue: any) {
		this.waiting = true;

		this.accountService
			.verifyMfa(formValue.token, formValue.keepLoggedIn)
			.then(async () => await this.accountService.switchToDefaultArchive())
			.then(async (response: ArchiveResponse) => {
				this.waiting = false;
				this.message.showMessage({
					message: `Logged in as ${
						this.accountService.getAccount().primaryEmail
					}.`,
					style: 'success',
				});
				this.loggedIn = true;
				this.needsMfa = false;
			})
			.catch((response: AuthResponse | AccountResponse) => {
				this.waiting = false;
				this.message.showError({
					message: response.getMessage(),
					translate: true,
				});
			});
	}

	async claimStorage() {
		this.waiting = true;

		const pledgeId = this.pledgeService.getPledgeId();
		const account = this.accountService.getAccount();
		const payment = this.pledgeService.createBillingPaymentVo(account);

		try {
			await this.pledgeService.linkAccount(account);
			const billingResponse = await this.api.billing.claimPledge(
				payment,
				pledgeId,
			);
			if (billingResponse.isSuccessful) {
				this.router.navigate(['..', 'done'], { relativeTo: this.route });
			} else {
				throw billingResponse;
			}
		} finally {
			this.waiting = false;
		}
	}
}
