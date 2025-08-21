import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import { AccountVOData } from '@models/account-vo';
import { MessageService } from '@shared/services/message/message.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { FormInputSelectOption } from '@shared/components/form-input/form-input.component';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from '@shared/services/event/event.service';
import { savePropertyOnAccount } from '@shared/services/account/account.service.helpers';

@Component({
	selector: 'pr-account-settings',
	templateUrl: './account-settings.component.html',
	styleUrls: ['./account-settings.component.scss'],
	standalone: false,
})
export class AccountSettingsComponent implements OnInit {
	public account: AccountVO;
	public countries: FormInputSelectOption[];
	public states: FormInputSelectOption[];
	public waiting = false;

	constructor(
		private accountService: AccountService,
		private prConstants: PrConstantsService,
		private route: ActivatedRoute,
		private router: Router,
		private api: ApiService,
		private message: MessageService,
		private event: EventService,
	) {
		this.account = this.accountService.getAccount();
		this.countries = this.prConstants.getCountries().map((c) => {
			return {
				text: c.name,
				value: c.abbrev,
			};
		});
		this.states = Object.values(this.prConstants.getStates()).map(
			(s: string) => {
				return {
					text: s,
					value: s,
				};
			},
		);
	}

	ngOnInit(): void {
		this.event.dispatch({
			action: 'open_login_info',
			entity: 'account',
		});
	}

	async onSaveProfileInfo(prop: keyof AccountVO, value: string) {
		savePropertyOnAccount(
			this.account,
			{ prop, value },
			{
				accountService: this.accountService,
				messageService: this.message,
				apiService: this.api,
			},
		);
	}

	async onValidateEmailClick() {
		await this.router.navigate(['.'], { relativeTo: this.route.parent });
		await this.router.navigate(['/app/auth/verify'], {
			relativeTo: this.route.parent,
			queryParams: { sendEmail: true },
		});
	}

	async onValidatePhoneClick() {
		await this.router.navigate(['.'], { relativeTo: this.route.parent });
		await this.router.navigate(['/app/auth/verify'], {
			relativeTo: this.route.parent,
			queryParams: { sendSms: true },
		});
	}
}
