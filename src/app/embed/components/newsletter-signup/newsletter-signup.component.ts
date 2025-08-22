import { Component, OnInit, HostBinding } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
	UntypedFormGroup,
	UntypedFormBuilder,
	Validators,
} from '@angular/forms';

import { APP_CONFIG } from '@root/app/app.config';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { IFrameService } from '@shared/services/iframe/iframe.service';
import { AccountVO } from '@models';

@Component({
	selector: 'pr-newsletter-signup',
	templateUrl: './newsletter-signup.component.html',
	styleUrls: ['./newsletter-signup.component.scss'],
	standalone: false,
})
export class NewsletterSignupComponent implements OnInit {
	@HostBinding('class.for-light-bg') forLightBg = true;
	@HostBinding('class.for-dark-bg') forDarkBg = false;
	@HostBinding('class.visible') visible = false;

	mailchimpEndpoint =
		'https://permanent.us12.list-manage.com/subscribe/post-json?u=2948a82c4a163d7ab43a13356&amp;id=487bd863fb&';
	mailchimpForm: UntypedFormGroup;
	mailchimpError: string;
	mailchimpSent = false;
	existingMember = false;
	existingUser = false;

	waiting = false;
	done = false;

	signupForm: UntypedFormGroup;

	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		private fb: UntypedFormBuilder,
		private iFrame: IFrameService,
		private router: Router,
		private message: MessageService,
		private accountService: AccountService,
	) {
		const queryParams = route.snapshot.queryParams;

		this.mailchimpForm = fb.group({
			email: ['', [Validators.required, Validators.email]],
		});

		this.signupForm = fb.group({
			invitation: [queryParams.inviteCode || null],
			email: ['', [Validators.required, Validators.email]],
			name: ['', Validators.required],
			password: [
				'',
				[
					Validators.required,
					Validators.minLength(APP_CONFIG.passwordMinLength),
				],
			],
			agreed: [true, [Validators.requiredTrue]],
			optIn: [true],
		});

		this.forLightBg = this.route.snapshot.queryParams.theme === 'forLightBg';
		this.forDarkBg = this.route.snapshot.queryParams.theme === 'forDarkBg';
	}

	ngOnInit() {
		if (this.accountService.isLoggedIn()) {
			this.existingUser = true;
			this.mailchimpSent = true;
			this.done = true;
		}
	}

	onMailchimpSubmit(formValue) {
		if (this.waiting) {
			return;
		}

		this.waiting = true;
		this.mailchimpError = null;
		const params = new HttpParams()
			.set('EMAIL', formValue.email)
			.set('b_2948a82c4a163d7ab43a13356_487bd863fb', '');

		const url = this.mailchimpEndpoint + params.toString().replace('+', '%2B');
		this.http.jsonp(url, 'c').subscribe(
			(response: any) => {
				this.waiting = false;
				this.signupForm.patchValue({
					email: formValue.email,
				});
				if (response.msg.includes('already')) {
					this.mailchimpSent = true;
					this.existingMember = true;
				} else if (response.result === 'error') {
					this.mailchimpError = response.msg;
				} else {
					this.mailchimpError = null;
					this.mailchimpSent = true;
				}
			},
			(error) => {
				this.waiting = false;
				this.mailchimpSent = true;
			},
		);
	}

	onSignupSubmit(formValue) {
		if (this.waiting) {
			return false;
		}

		this.waiting = true;

		this.accountService
			.signUp(
				formValue.email,
				formValue.name,
				formValue.password,
				formValue.password,
				formValue.agreed,
				false,
				null,
				formValue.invitation,
				true,
			)
			.then(
				async (response: AccountVO) =>
					await this.accountService
						.logIn(formValue.email, formValue.password, true, true)
						.then(() => {
							this.waiting = false;
							this.done = true;
							window.location.assign('/app');
						}),
			)
			.catch((err) => {
				this.message.showError({ message: err.error.message, translate: true });
				this.waiting = false;
			});
	}
}
