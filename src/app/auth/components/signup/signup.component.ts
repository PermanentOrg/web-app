import { Component, HostBinding } from '@angular/core';
import {
	UntypedFormGroup,
	UntypedFormBuilder,
	Validators,
	UntypedFormControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { APP_CONFIG } from '@root/app/app.config';
import { matchControlValidator, trimWhitespace } from '@shared/utilities/forms';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import {
	RecordVO,
	FolderVO,
	RecordVOData,
	FolderVOData,
	AccountVO,
} from '@models';
import { DeviceService } from '@shared/services/device/device.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';

const MIN_PASSWORD_LENGTH = APP_CONFIG.passwordMinLength;
const NEW_ONBOARDING_CHANCE = 1;

@Component({
	selector: 'pr-signup',
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.scss'],
	standalone: false,
})
export class SignupComponent {
	@HostBinding('class.pr-auth-form') classBinding = true;
	signupForm: UntypedFormGroup;
	waiting: boolean;

	showInviteCode = false;
	isForShareInvite = false;

	shareArchiveNbr: string;
	shareFolder_linkId: number;

	shareItem: RecordVO | FolderVO;
	shareFromName: string;
	shareItemIsRecord = false;
	agreedTerms = false;
	receiveUpdatesViaEmail = false;

	constructor(
		fb: UntypedFormBuilder,
		private accountService: AccountService,
		private router: Router,
		private route: ActivatedRoute,
		private message: MessageService,
		private device: DeviceService,
		private ga: GoogleAnalyticsService,
	) {
		const params = route.snapshot.queryParams;

		let name, email, inviteCode;

		if (params.fullName) {
			name = window.atob(params.fullName);
		}

		if (params.primaryEmail) {
			email = window.atob(params.primaryEmail);
		}

		if (params.inviteCode) {
			inviteCode = params.inviteCode;
		}

		if (params.shid && params.tp) {
			this.isForShareInvite = true;

			const responseData = this.route.snapshot.data.shareInviteData;

			if (responseData) {
				const itemData: RecordVOData | FolderVOData = {
					archiveNbr: responseData.recArchiveNbr,
					folder_linkId: responseData.folder_linkId,
					displayName: responseData.sharedItem,
					thumbURL500: responseData.sharedThumb,
				};

				this.shareFromName = responseData.ShareArcName;

				this.shareItemIsRecord = params.tp === 'r';
				this.shareItem = this.shareItemIsRecord
					? new RecordVO(itemData)
					: new FolderVO(itemData);
			} else {
				this.isForShareInvite = false;
			}
		}

		this.signupForm = fb.group({
			invitation: [inviteCode || ''],
			email: [
				email || '',
				[trimWhitespace, Validators.required, Validators.email],
			],
			name: [name || '', Validators.required],
			password: [
				'',
				[Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)],
			],
		});
		const confirmPasswordControl = new UntypedFormControl('', [
			Validators.required,
			matchControlValidator(this.signupForm.controls.password),
		]);
		this.signupForm.addControl('confirm', confirmPasswordControl);
	}

	shouldCreateDefaultArchive() {
		if (window.location.search.includes('createArchive')) {
			return true;
		}
		if (window.location.search.includes('noArchive')) {
			return false;
		}
		if (this.isForShareInvite) {
			return true;
		}
		return Math.random() > NEW_ONBOARDING_CHANCE;
	}

	onSubmit(formValue: any) {
		this.waiting = true;

		this.accountService
			.signUp(
				formValue.email,
				formValue.name,
				formValue.password,
				formValue.confirm,
				this.agreedTerms,
				this.receiveUpdatesViaEmail,
				null,
				formValue.invitation,
				this.shouldCreateDefaultArchive(),
			)
			.then((account: AccountVO) => {
				if (account.needsVerification()) {
					this.message.showMessage({
						message: `Verify to continue as ${account.primaryEmail}.`,
						style: 'warning',
					});
					this.router.navigate(['..', 'verify'], { relativeTo: this.route });
				} else {
					this.accountService
						.logIn(formValue.email, formValue.password, true, true)
						.then(() => {
							this.redirectUserFromSignup();
						});
				}
			})
			.catch((err) => {
				this.message.showError({ message: err.error.message, translate: true });
				this.waiting = false;
			});
	}

	public redirectUserFromSignup() {
		this.message.showMessage({
			message: `Logged in as ${this.accountService.getAccount().primaryEmail}.`,
			style: 'success',
		});

		if (this.route.snapshot.queryParams.eventCategory) {
			this.ga.sendEvent({
				hitType: 'event',
				eventCategory: this.route.snapshot.queryParams.eventCategory,
				eventAction: 'signup',
			});
		}

		if (this.route.snapshot.queryParams.shareByUrl) {
			this.router.navigate([
				'/share',
				this.route.snapshot.queryParams.shareByUrl,
			]);
		} else if (this.route.snapshot.queryParams.cta === 'timeline') {
			if (this.device.isMobile() || !this.device.didOptOut()) {
				this.router.navigate(['/public'], { queryParams: { cta: 'timeline' } });
			} else {
				window.location.assign(`/app/public?cta=timeline`);
			}
		} else if (!this.isForShareInvite) {
			if (this.device.isMobile() || !this.device.didOptOut()) {
				this.router.navigate(['/app', 'onboarding']);
			} else {
				window.location.assign('/app/onboarding');
			}
		} else if (this.shareItemIsRecord) {
			setTimeout(() => {
				this.router.navigate(['/shares', 'withme']);
			}, 500);
		} else {
			setTimeout(() => {
				this.router.navigate([
					'/shares',
					'withme',
					this.shareItem.archiveNbr,
					this.shareItem.folder_linkId,
				]);
			}, 500);
		}
	}

	displayTerms(): void {
		window.open('https://www.permanent.org/terms/', '_blank');
	}

	navigateToAuth() {
		this.router.navigate(['..', 'login'], {
			relativeTo: this.route,
		});
	}
}
