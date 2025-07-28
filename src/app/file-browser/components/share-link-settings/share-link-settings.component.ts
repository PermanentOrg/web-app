import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ItemVO, ShareByUrlVO } from '@models/index';
import { FeatureFlagService } from '@root/app/feature-flag/services/feature-flag.service';
import { Deferred } from '@root/vendor/deferred';
import { FormInputSelectOption } from '@shared/components/form-input/form-input.component';
import { ApiService } from '@shared/services/api/api.service';
import { ShareResponse } from '@shared/services/api/share.repo';
import { EVENTS } from '@shared/services/google-analytics/events';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { MessageService } from '@shared/services/message/message.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { getSQLDateTime } from '@shared/utilities/dateTime';
import { copyFromInputElement } from '@shared/utilities/forms';
import { addDays, differenceInHours, isPast } from 'date-fns';
import { faTrash } from '@fortawesome/pro-regular-svg-icons';
import { ngIfScaleAnimation } from '@shared/animations';

enum Expiration {
	Never = 'Never',
	Day = '1 day',
	Week = '1 week',
	Month = '1 month',
	Year = '1 year',
	Other = 'Other',
}

enum ExpirationDays {
	Day = 1,
	Week = 7,
	Month = 30,
	Year = 365,
}

type ShareByUrlProps =
	| 'defaultAccessRole'
	| 'expiresDT'
	| 'autoApproveToggle'
	| 'previewToggle';

const EXPIRATION_OPTIONS: FormInputSelectOption[] = Object.values(
	Expiration,
).map((x) => {
	return {
		value: x,
		text: x,
	};
});

const accessRoles = [
	{
		text: 'Owner',
		value: 'owner',
	},
	{
		text: 'Curator',
		value: 'curator',
	},
	{
		text: 'Editor',
		value: 'editor',
	},
	{
		text: 'Contributor',
		value: 'contributor',
	},
	{
		text: 'Viewer',
		value: 'viewer',
	},
];

@Component({
	selector: 'pr-share-link-settings',
	templateUrl: './share-link-settings.component.html',
	styleUrl: './share-link-settings.component.scss',
	standalone: false,
	animations: [ngIfScaleAnimation],
})
export class ShareLinkSettingsComponent {
	@Input() shareItem: ItemVO = null;

	@Input() shareLink: ShareByUrlVO = null;

	@ViewChild('shareUrlInput', { static: false }) shareUrlInput: ElementRef;

	public displayDropdown: boolean = false;
	public showLinkSettings: boolean = false;
	public previewToggle: 0 | 1 = 1;
	public autoApproveToggle: 0 | 1 = 1;
	public expiration: Expiration;
	public linkDefaultAccessRole = 'access.role.viewer';
	public expirationOptions: FormInputSelectOption[] = EXPIRATION_OPTIONS;
	public updatingLink: boolean = false;
	public linkCopied: boolean = false;
	public linkType: string = 'private';
	public trashIcon = faTrash;
	public shareLinkAccessRoles: FormInputSelectOption[] = accessRoles;

	public shareLinkTypes = [
		{
			text: 'Anyone can view',
			value: 'public',
			description: 'Anyone with the link can view and download.',
		},
		{
			text: 'Restricted',
			value: 'private',
			description: 'Must be logged in to view.',
		},
	];

	constructor(
		private feature: FeatureFlagService,
		private api: ApiService,
		private ga: GoogleAnalyticsService,
		private messageService: MessageService,
		private promptService: PromptService,
	) {
		this.displayDropdown = feature.isEnabled('unlisted-share');
	}

	getExpirationFromExpiresDT(expiresDT: string): Expiration {
		if (!expiresDT) {
			return Expiration.Never;
		}

		const diff = differenceInHours(
			new Date(expiresDT),
			new Date(this.shareLink.createdDT),
		);

		if (diff <= 24 * ExpirationDays.Day) {
			return Expiration.Day;
		} else if (diff <= 24 * ExpirationDays.Week) {
			return Expiration.Week;
		} else if (diff <= 24 * 7 * ExpirationDays.Month) {
			return Expiration.Month;
		} else if (diff <= 24 * 7 * ExpirationDays.Year) {
			return Expiration.Year;
		} else {
			return Expiration.Other;
		}
	}

	getExpiresDTFromExpiration(expiration: Expiration): string {
		switch (expiration) {
			case Expiration.Never:
				return null;
			case Expiration.Day:
				return getSQLDateTime(addDays(new Date(this.shareLink.createdDT), 1));
			case Expiration.Week:
				return getSQLDateTime(addDays(new Date(this.shareLink.createdDT), 7));
			case Expiration.Month:
				return getSQLDateTime(addDays(new Date(this.shareLink.createdDT), 30));
			case Expiration.Year:
				return getSQLDateTime(addDays(new Date(this.shareLink.createdDT), 365));
		}
	}

	setShareLinkFormValue(): void {
		if (this.shareLink) {
			this.previewToggle = this.shareLink.previewToggle;
			this.autoApproveToggle = this.shareLink.autoApproveToggle || 0;
			this.expiration = this.getExpirationFromExpiresDT(
				this.shareLink.expiresDT,
			);

			this.linkDefaultAccessRole = this.shareLink.defaultAccessRole;
			this.expirationOptions = EXPIRATION_OPTIONS.filter((expiration) => {
				switch (expiration.value) {
					case Expiration.Never:
					case Expiration.Other:
						return true;
					default:
						return !isPast(
							new Date(
								this.getExpiresDTFromExpiration(expiration.value as Expiration),
							),
						);
				}
			});
		} else {
			this.previewToggle = 1;
			this.autoApproveToggle = 1;
			this.expiration = Expiration.Never;
			this.expirationOptions = EXPIRATION_OPTIONS;
		}
	}

	async generateShareLink() {
		this.updatingLink = true;
		try {
			const response = await this.api.share.generateShareLink(this.shareItem);
			this.shareLink = response.getShareByUrlVO();
			this.shareLink.autoApproveToggle = this.autoApproveToggle || 0;
			this.shareLink.previewToggle = this.previewToggle || 0;
			await this.api.share.updateShareLink(this.shareLink);
			this.setShareLinkFormValue();
			this.showLinkSettings = true;
			this.ga.sendEvent(EVENTS.SHARE.ShareByUrl.initiated.params);
		} catch (err) {
			if (err instanceof ShareResponse) {
				this.messageService.showError({
					message: err.getMessage(),
					translate: true,
				});
			}
		} finally {
			this.updatingLink = false;
		}
	}

	copyShareLink() {
		const element = this.shareUrlInput.nativeElement as HTMLInputElement;

		copyFromInputElement(element);

		this.linkCopied = true;
		setTimeout(() => {
			this.linkCopied = false;
		}, 5000);
	}

	async removeShareLink() {
		const deferred = new Deferred();
		try {
			await this.promptService.confirm(
				'Remove link',
				'Are you sure you want to remove this link?',
				deferred.promise,
				'btn-danger',
			);

			await this.api.share.removeShareLink(this.shareLink);
			this.shareLink = null;
			this.setShareLinkFormValue();
			deferred.resolve();
			this.showLinkSettings = false;
		} catch (response) {
			deferred.resolve();
			if (response instanceof ShareResponse) {
				this.messageService.showError({ message: response.getMessage() });
			}
		}
	}

	async onShareLinkPropChange(propName: ShareByUrlProps, value: any) {
		this.updatingLink = true;
		try {
			const update = new ShareByUrlVO(this.shareLink);
			update[propName] = value;
			await this.api.share.updateShareLink(update);
			this.shareLink[propName] = update[propName];
		} catch (err) {
			if (err instanceof ShareResponse) {
				this.messageService.showError({
					message: err.getMessage(),
					translate: true,
				});
			}
			this.setShareLinkFormValue();
		} finally {
			this.updatingLink = false;
		}
	}
}
