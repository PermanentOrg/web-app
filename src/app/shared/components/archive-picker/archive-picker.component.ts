import { Component, Inject } from '@angular/core';
import {
	PromptService,
	PromptField,
} from '@shared/services/prompt/prompt.service';
import { RelationVO, ArchiveVO, InviteVO, ItemVO } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import {
	SearchResponse,
	InviteResponse,
} from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';
import { Validators } from '@angular/forms';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import {
	INVITATION_FIELDS,
	ACCESS_ROLE_FIELD,
} from '@shared/components/prompt/prompt-fields';
import { AccountService } from '@shared/services/account/account.service';
import { clone } from 'lodash';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { EVENTS } from '@shared/services/google-analytics/events';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { FormInputSelectOption } from '../form-input/form-input.component';

export interface ArchivePickerComponentConfig {
	relations?: RelationVO[];
	shareItem?: ItemVO;
	hideAccessRoleOnInvite?: boolean;
	hideRelations?: boolean;
}

@Component({
	selector: 'pr-archive-picker',
	templateUrl: './archive-picker.component.html',
	styleUrls: ['./archive-picker.component.scss'],
	standalone: false,
})
export class ArchivePickerComponent {
	relations: RelationVO[];
	relationOptions: FormInputSelectOption[];
	hideAccessRoleOnInvite = false;
	searchResults: ArchiveVO[];
	searchEmail: string;

	constructor(
		private dialogRef: DialogRef,
		@Inject(DIALOG_DATA) public dialogData: ArchivePickerComponentConfig,
		private prompt: PromptService,
		private api: ApiService,
		private accountService: AccountService,
		private message: MessageService,
		private prConstants: PrConstantsService,
		private ga: GoogleAnalyticsService,
	) {
		this.relations = this.dialogData.relations;
		this.hideAccessRoleOnInvite = this.dialogData.hideAccessRoleOnInvite;
		this.relationOptions = this.prConstants.getRelations().map((type) => ({
			text: type.name,
			value: type.type,
		}));
	}

	async searchByEmail() {
		const { promise, resolve } = Promise.withResolvers();
		const fields: PromptField[] = [
			{
				fieldName: 'email',
				validators: [Validators.required, Validators.email],
				placeholder: 'Email',
				type: 'text',
				config: {
					autocapitalize: 'off',
					autocorrect: 'off',
					autocomplete: 'off',
					autoselect: false,
				},
			},
		];

		this.searchResults = null;

		return await this.prompt
			.prompt(fields, 'Search by email', promise, 'Search')
			.then(async (value) => {
				this.searchEmail = value.email;
				return await this.api.search.archiveByEmail(value.email).toPromise();
			})
			.then((response: SearchResponse) => {
				this.searchResults = response.getArchiveVOs();
				resolve(undefined);
			})
			.catch((response: SearchResponse) => {
				resolve(undefined);
			});
	}

	async sendInvite() {
		const { promise, resolve } = Promise.withResolvers();
		const fields: PromptField[] = clone(INVITATION_FIELDS(this.searchEmail));
		const forShare = !!this.dialogData.shareItem;

		if (!this.hideAccessRoleOnInvite) {
			fields.push(ACCESS_ROLE_FIELD);
		}

		return await this.prompt
			.prompt(
				fields,
				forShare ? 'Invite to share' : 'Send invitation',
				promise,
				'Send',
			)
			.then((value) => {
				const invite = new InviteVO({
					email: value.email,
					fullName: value.name,
					byArchiveId: this.accountService.getArchive().archiveId,
					relationship: value.relationType,
					accessRole: value.accessRole,
				});
				if (this.dialogData.shareItem) {
					return this.api.invite.sendShareInvite(
						invite,
						this.dialogData.shareItem,
					) as any;
				} else {
					return this.api.invite.send(invite, this.accountService.getArchive());
				}
			})
			.then(() => {
				this.message.showMessage({
					message: 'Invite sent succesfully.',
					style: 'success',
				});
				if (forShare) {
					this.ga.sendEvent(EVENTS.SHARE.ShareByInvite.initiated.params);
				}
				resolve(undefined);
				this.cancel();
			})
			.catch((response: InviteResponse) => {
				if (response) {
					resolve(undefined);
					this.message.showError({
						message: response.getMessage(),
						translate: true,
					});
				}
			});
	}

	chooseArchive(archive: ArchiveVO) {
		this.dialogRef.close(archive);
	}

	cancel() {
		this.dialogRef.close();
	}
}
