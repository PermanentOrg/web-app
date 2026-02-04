import { Component, Inject } from '@angular/core';
import {
	PromptButton,
	PromptField,
	ACCESS_ROLE_FIELD_INITIAL,
	PromptService,
} from '@shared/services/prompt/prompt.service';
import { AccountVO } from '@models';
import { Validators } from '@angular/forms';
import {
	ArchiveResponse,
	InviteResponse,
} from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';
import { AccessRole, AccessRoleType } from '@models/access-role';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { clone, remove, partition } from 'lodash';
import { PayerService } from '@shared/services/payer/payer.service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';

const MemberActions: { [key: string]: PromptButton } = {
	Edit: {
		buttonName: 'edit',
		buttonText: 'Edit',
	},
	Remove: {
		buttonName: 'remove',
		buttonText: 'Remove',
		class: 'btn-danger',
	},
};

type MembersTab = 'members' | 'pending' | 'add';

@Component({
	selector: 'pr-members-dialog',
	templateUrl: './members-dialog.component.html',
	styleUrls: ['./members-dialog.component.scss'],
	standalone: false,
})
export class MembersDialogComponent {
	members: AccountVO[];
	pendingMembers: AccountVO[];
	canEdit: boolean;

	activeTab: MembersTab = 'members';

	constructor(
		@Inject(DIALOG_DATA) public data: any,
		private dialogRef: DialogRef,
		private promptService: PromptService,
		private message: MessageService,
		private api: ApiService,
		private accountService: AccountService,
		private payerService: PayerService,
		private router: Router,
	) {
		[this.members, this.pendingMembers] = partition(this.data.members, {
			status: 'status.generic.ok',
		});
		this.canEdit = this.accountService.checkMinimumArchiveAccess(
			AccessRole.Manager,
		);
	}

	setTab(tab: MembersTab) {
		this.activeTab = tab;
	}

	onDoneClick() {
		this.dialogRef.close();
	}

	onMemberClick(member: AccountVO) {
		const buttons = [];
		if (member.accessRole !== 'access.role.owner') {
			buttons.push(MemberActions.Edit);
		}
		buttons.push(MemberActions.Remove);
		this.promptService
			.promptButtons(buttons, `Member access for ${member.fullName}`)
			.then((value: string) => {
				switch (value) {
					case 'edit':
						this.editMember(member);
						break;
					case 'remove':
						this.removeMember(member);
						break;
				}
			});
	}

	async editMember(member: AccountVO) {
		const { promise, resolve } = Promise.withResolvers();
		const fields = [ACCESS_ROLE_FIELD_INITIAL(member.accessRole)];
		const value: any = await this.promptService.prompt(
			fields,
			`Edit access for ${member.fullName}`,
			promise,
		);
		const updatedMember = clone(member);
		updatedMember.accessRole = value.accessRole as AccessRoleType;
		try {
			if (updatedMember.accessRole === 'access.role.owner') {
				resolve(undefined);
				await this.confirmOwnershipTransfer();
				const response = await this.api.archive.transferOwnership(
					updatedMember,
					this.accountService.getArchive(),
				);
				this.message.showMessage({
					message: 'Ownership transfer request sent.',
					style: 'success',
				});
				const account = response.getAccountVOs().pop();
				member.accessRole = updatedMember.accessRole;
				member.status = account.status;
			} else {
				await this.api.archive.updateMember(
					updatedMember,
					this.accountService.getArchive(),
				);
				this.message.showMessage({
					message: 'Member access saved successfully.',
					style: 'success',
				});
				member.accessRole = updatedMember.accessRole;
				resolve(undefined);
			}
		} catch (err) {
			if (err instanceof ArchiveResponse) {
				this.message.showError({ message: err.getMessage(), translate: true });
			}
			resolve(undefined);
		}
	}

	async removeMember(member: AccountVO) {
		const { promise, resolve } = Promise.withResolvers();
		const confirmTitle = `Remove ${member.fullName}'s access to The ${
			this.accountService.getArchive().fullName
		} Archive?`;

		return await this.promptService
			.confirm('Remove', confirmTitle, promise, 'btn-danger')
			.then(
				async () =>
					await this.api.archive.removeMember(
						member,
						this.accountService.getArchive(),
					),
			)
			.then((response: ArchiveResponse) => {
				this.message.showMessage({
					message: 'Member removed successfully.',
					style: 'success',
				});
				if (member.status.includes('pending')) {
					remove(this.pendingMembers, member);
				} else {
					remove(this.members, member);
					if (this.payerService.payerId === member.accountId) {
						this.payerService.payerId = '';
					}
				}
				resolve(undefined);
			})
			.catch((response: ArchiveResponse) => {
				resolve(undefined);
				if (response) {
					this.message.showError({
						message: response.getMessage(),
						translate: true,
					});
				}
			});
	}

	async onAddMemberClick() {
		const archive = this.accountService.getArchive();
		if (
			archive.accessRole !== 'access.role.manager' &&
			archive.accessRole !== 'access.role.owner'
		) {
			try {
				await this.promptService.confirm(
					'Learn More',
					'Add Member',
					null,
					null,
					`You do not have permission to add members to this archive.`,
				);
				window.open(
					'https://desk.zoho.com/portal/permanent/en/kb/articles/roles-for-collaboration-and-sharing',
				);
			} catch {
				// Catch PromptService rejection, but do nothing on "Cancel" button press
			}
			return;
		}
		const { promise, resolve } = Promise.withResolvers();
		const emailField: PromptField = {
			fieldName: 'primaryEmail',
			placeholder: 'Member email',
			type: 'email',
			validators: [Validators.required, Validators.email],
			config: {
				autocapitalize: 'off',
				autocorrect: 'off',
				autocomplete: 'off',
			},
		};
		const fields = [
			emailField,
			ACCESS_ROLE_FIELD_INITIAL('access.role.viewer'),
		];

		const value = await this.promptService.prompt(
			fields,
			'Add member',
			promise,
		);
		const member = value as AccountVO;

		try {
			let response: ArchiveResponse;
			if (member.accessRole === 'access.role.owner') {
				resolve(undefined);
				await this.confirmOwnershipTransfer();
				response = await this.api.archive.transferOwnership(member, archive);
				this.message.showMessage({
					message: 'Ownership transfer request sent.',
					style: 'success',
				});
			} else {
				response = await this.api.archive.addMember(member, archive);
				this.message.showMessage({
					message: 'Member added successfully.',
					style: 'success',
				});
				resolve(undefined);
			}
			const account = response.getAccountVOs().pop();
			account.accessRole = member.accessRole;
			this.pendingMembers.push(account);
			this.setTab('pending');
		} catch (err) {
			if (err instanceof ArchiveResponse) {
				if (err.getMessage() === 'warning.archive.no_email_found') {
					this.promptForInvite(member);
				} else {
					this.message.showError({
						message: err.getMessage(),
						translate: true,
					});
				}
			}
			resolve(undefined);
		}
	}

	getTooltipForAccess(accessRole: AccessRoleType) {
		return 'members.' + accessRole.split('.').pop();
	}

	async confirmOwnershipTransfer() {
		return await this.promptService.confirm(
			'Transfer ownership',
			'Permanent Archives can only have one owner at a time. Once this is complete, your role will be changed to Manager',
		);
	}

	promptForInvite(member: AccountVO) {
		const { promise, resolve } = Promise.withResolvers();
		const title = `No account found for ${member.primaryEmail}. Send invitation?`;
		const fields: PromptField[] = [
			{
				fieldName: 'fullName',
				placeholder: 'Recipient name',
				validators: [Validators.required],
				type: 'text',
				config: {
					autocapitalize: 'on',
					autocorrect: 'off',
					autocomplete: 'off',
				},
			},
		];

		this.promptService
			.prompt(fields, title, promise, 'Invite')
			.then(async (value: any) => {
				member.fullName = value.fullName;
				return await this.api.invite.sendMemberInvite(
					member,
					this.accountService.getArchive(),
				);
			})
			.then(() => {
				resolve(undefined);
				this.message.showMessage({
					message: 'Invite sent successfully.',
					style: 'success',
				});
			})
			.catch((response: InviteResponse) => {
				resolve(undefined);
				if (response) {
					this.message.showError({
						message: response.getMessage(),
						translate: true,
					});
				}
			});
	}
}
