import {
	Component,
	ElementRef,
	Inject,
	OnInit,
	ViewChild,
} from '@angular/core';
import {
	UntypedFormBuilder,
	UntypedFormGroup,
	Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { ShareVO, ItemVO, ArchiveVO, InviteVO, RecordVO } from '@models';
import { ShareLink } from '@root/app/share-links/models/share-link';
import {
	AccessRoleType,
	ACCESS_ROLE_TO_PERMISSIONS_LEVEL,
	PERMISSIONS_LEVEL_TO_ACCESS_ROLE,
	PermissionsLevel,
} from '@models/access-role';
import { sortShareVOs } from '@models/share-vo';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
	ngIfScaleAnimation,
	ngIfScaleAnimationDynamic,
} from '@shared/animations';
import { FormInputSelectOption } from '@shared/components/form-input/form-input.component';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { ShareLinksApiService } from '@root/app/share-links/services/share-links-api.service';
import {
	ShareLinkMappingService,
	Expiration,
} from '@root/app/share-links/services/share-link-mapping.service';
import { InviteResponse } from '@shared/services/api/index.repo';
import { ShareResponse } from '@shared/services/api/share.repo';
import { EVENTS } from '@shared/services/google-analytics/events';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { MessageService } from '@shared/services/message/message.service';
import {
	PromptService,
	RELATION_OPTIONS,
	SHARE_ACCESS_ROLE_FIELD,
} from '@shared/services/prompt/prompt.service';
import { copyFromInputElement } from '@shared/utilities/forms';
import { isPast } from 'date-fns';
import { find, partition, remove } from 'lodash';
import { faTrash } from '@fortawesome/pro-regular-svg-icons';
import { FeatureFlagService } from '@root/app/feature-flag/services/feature-flag.service';
import { environment } from '@root/environments/environment';

type ShareByUrlProps =
	| 'accessRestrictions'
	| 'defaultAccessRole'
	| 'expiresDT'
	| 'autoApproveToggle'
	| 'expirationTimestamp'
	| 'permissionsLevel';

const EXPIRATION_OPTIONS: FormInputSelectOption[] = Object.values(
	Expiration,
).map((x) => ({
	value: x,
	text: x,
}));

@Component({
	selector: 'pr-sharing-dialog',
	templateUrl: './sharing-dialog.component.html',
	styleUrls: ['./sharing-dialog.component.scss'],
	animations: [ngIfScaleAnimation, ngIfScaleAnimationDynamic],
	standalone: false,
})
export class SharingDialogComponent implements OnInit {
	public shareItem: ItemVO = null;

	public originalRoles = new Map<number, AccessRoleType>();
	public canShare = false;

	public shares: ShareVO[] = [];
	public pendingShares: ShareVO[] = [];

	public newShareLink: ShareLink = null;

	public autoApproveToggle: 0 | 1 = 1;
	public expiration: Expiration;
	public linkDefaultAccessRole: AccessRoleType = 'access.role.viewer';

	public updatingLink = false;
	public linkCopied = false;
	public showLinkSettings = false;

	public linkType = 'public';

	public trashIcon = faTrash;

	public newAccessRole: AccessRoleType = 'access.role.viewer';
	public accessRoleOptions: FormInputSelectOption[] =
		SHARE_ACCESS_ROLE_FIELD.selectOptions.reverse();
	public expirationOptions: FormInputSelectOption[] = EXPIRATION_OPTIONS;
	public relationOptions: FormInputSelectOption[] = RELATION_OPTIONS;

	public sendingInvitation = false;
	public showInvitationForm = false;
	public invitationForm: UntypedFormGroup;
	public baseUrl = environment.apiUrl.replace('/api', '/share/');
	public shareUrl = '';

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

	public displayDropdown = false;

	@ViewChild('shareUrlInput', { static: false }) shareUrlInput: ElementRef;

	public archiveFilterFn = (a: ArchiveVO) =>
		!find(this.shares, { archiveId: a.archiveId }) &&
		!find(this.shares, { archiveId: a.archiveId });
	constructor(
		@Inject(DIALOG_DATA) public data: any,
		private accountService: AccountService,
		private dialogRef: DialogRef,
		private promptService: PromptService,
		private fb: UntypedFormBuilder,
		private api: ApiService,
		private shareApi: ShareLinksApiService,
		private shareLinkMapping: ShareLinkMappingService,
		private messageService: MessageService,
		private relationshipService: RelationshipService,
		private ga: GoogleAnalyticsService,
		private route: ActivatedRoute,
		private feature: FeatureFlagService,
	) {
		this.invitationForm = this.fb.group({
			fullName: ['', [Validators.required]],
			email: ['', [Validators.required, Validators.email]],
			relationship: ['relation.friend', [Validators.required]],
			accessRole: ['access.role.viewer', [Validators.required]],
		});

		this.shareItem = this.data.item as ItemVO;
		this.displayDropdown = feature.isEnabled('unlisted-share');
	}

	ngOnInit(): void {
		this.shareItem.ShareVOs = sortShareVOs(this.shareItem.ShareVOs);

		if (this.shareItem.ShareVOs && this.shareItem.ShareVOs.length) {
			for (const share of this.shareItem.ShareVOs) {
				this.originalRoles.set(share.shareId, share.accessRole);
			}
			[this.pendingShares, this.shares] = partition(this.shareItem.ShareVOs, {
				status: 'status.generic.pending',
			}) as any;
		}

		this.canShare = this.shareItem.accessRole === 'access.role.owner';

		this.relationshipService.update();

		this.newShareLink = this.data.newShare;
		if (this.newShareLink) {
			this.shareUrl = this.baseUrl + this.newShareLink.token;
		}

		this.setShareLinkFormValue();

		this.checkQueryParams();
	}

	calculateAccessRestrictions(linkType: string, autoApprove: number): string {
		return this.shareLinkMapping.calculateAccessRestrictions(
			linkType,
			autoApprove,
		);
	}

	accessRoleToPermissionsLevel(accessRole: AccessRoleType): PermissionsLevel {
		return ACCESS_ROLE_TO_PERMISSIONS_LEVEL[accessRole] || 'viewer';
	}

	permissionsLevelToAccessRole(
		permissionsLevel: PermissionsLevel,
	): AccessRoleType {
		return (
			PERMISSIONS_LEVEL_TO_ACCESS_ROLE[permissionsLevel] || 'access.role.viewer'
		);
	}

	isRecord(item: ItemVO): item is RecordVO {
		return (item as RecordVO).recordId !== undefined;
	}

	checkQueryParams() {
		if (this.route.snapshot) {
			const params = this.route.snapshot.queryParamMap;
			if (params.has('requestToken') && params.has('requestAction')) {
				const pendingShare = find(this.pendingShares, {
					requestToken: params.get('requestToken'),
				});
				if (pendingShare) {
					const action = params.get('requestAction');
					switch (action) {
						case 'approve':
							this.approveShare(pendingShare);
							break;
						case 'deny':
							this.removeShare(pendingShare);
							break;
					}
				}
			}
		}
	}

	onDoneClick(): void {
		this.shareItem.ShareVOs = [...this.pendingShares, ...this.shares];
		this.dialogRef.close();
	}

	onAddArchive(archive: ArchiveVO) {
		this.createShare(archive, this.newAccessRole);
	}

	onAddInvite(email: string) {
		this.invitationForm.reset();
		this.invitationForm.patchValue({
			email,
			accessRole: this.newAccessRole,
			relationship: 'relation.friend',
		});

		this.showInvitationForm = true;
	}

	async sendInvite(value: any) {
		try {
			this.sendingInvitation = true;
			const invite = new InviteVO({
				email: value.email,
				fullName: value.fullName,
				byArchiveId: this.accountService.getArchive().archiveId,
				relationship: 'relation.family.uncle',
				accessRole: value.accessRole,
			});

			await this.api.invite.sendShareInvite(invite, this.shareItem);
			this.messageService.showMessage({
				message: 'Share invitation sent.',
				style: 'success',
			});
			this.showInvitationForm = false;
		} catch (err) {
			if (err instanceof InviteResponse) {
				this.messageService.showError({
					message: err.getMessage(),
					translate: true,
				});
			}
		} finally {
			this.sendingInvitation = false;
		}
	}

	async confirmOwnerAdd(share: ShareVO) {
		return await this.promptService.confirm(
			'Add owner',
			`Are you sure you share this item with The ${share.ArchiveVO.fullName} Archive as an owner?`,
		);
	}

	async confirmRemove(share: ShareVO) {
		return await this.promptService.confirm(
			'Remove',
			`Are you sure you want to remove The ${share.ArchiveVO.fullName} Archive?`,
			null,
			'btn-danger',
		);
	}

	async confirmDeny(share: ShareVO) {
		return await this.promptService.confirm(
			'Deny request',
			`Are you sure you want deny The ${share.ArchiveVO.fullName} Archive access?`,
			null,
			'btn-danger',
		);
	}

	onAccessChange(share: ShareVO) {
		if ((share.accessRole as any) === 'remove') {
			this.removeShare(share);
		} else {
			this.updateShare(share);
		}
	}

	isArchiveSharedWith(archive: ArchiveVO) {
		return (
			find(this.shares, { archiveId: archive.archiveId }) ||
			find(this.pendingShares, { archiveId: archive.archiveId })
		);
	}

	async createShare(archive: ArchiveVO, accessRole: AccessRoleType) {
		if (this.isArchiveSharedWith(archive)) {
			this.messageService.showMessage({
				message: 'This archive has already been shared with',
			});
			return;
		}

		const share = new ShareVO({});
		share.accessRole = accessRole;
		share.archiveId = archive.archiveId;
		share.folder_linkId = this.shareItem.folder_linkId;
		share.ArchiveVO = archive;

		if (share.accessRole === 'access.role.owner') {
			try {
				await this.confirmOwnerAdd(share);
			} catch (err) {
				return;
			}
		}

		try {
			share.isNewlyCreated = true;
			this.shares.push(share);
			this.shares = sortShareVOs(this.shares);
			const response = await this.api.share.upsert(share);
			share.isNewlyCreated = false;
			share.shareId = response.getShareVO().shareId;
			this.originalRoles.set(share.shareId, share.accessRole);
		} catch (err) {
			remove(this.shares, share);
			if (err instanceof ShareResponse) {
				this.messageService.showError({
					message: err.getMessage(),
					translate: true,
				});
			}
		}
	}

	async updateShare(share: ShareVO) {
		share.isPendingAction = true;
		try {
			if (share.accessRole === 'access.role.owner') {
				await this.confirmOwnerAdd(share);
			}
			this.shares = sortShareVOs(this.shares);
			await this.api.share.upsert(share);
			this.originalRoles.set(share.shareId, share.accessRole);
		} catch (err) {
			share.accessRole = this.originalRoles.get(share.shareId);
			this.shares = sortShareVOs(this.shares);
			if (err instanceof ShareResponse) {
				this.messageService.showError({
					message: err.getMessage(),
					translate: true,
				});
			}
		} finally {
			share.isPendingAction = false;
		}
	}

	async approveShare(share: ShareVO) {
		share.isPendingAction = true;
		share.status = 'status.generic.ok';
		remove(this.pendingShares, share);
		this.shares.push(share);
		this.shares = sortShareVOs(this.shares);
		try {
			await this.api.share.upsert(share);
			this.messageService.showMessage({
				message: `Share request approved for The ${share.ArchiveVO.fullName} Archive.`,
				style: 'success',
			});
		} catch (err) {
			if (err instanceof ShareResponse) {
				this.messageService.showError({
					message: err.getMessage(),
					translate: true,
				});
			}
			remove(this.shares, share);
			this.pendingShares.push(share);
			this.pendingShares = sortShareVOs(this.pendingShares);
		} finally {
			share.isPendingAction = false;
		}
	}

	async removeShare(share: ShareVO) {
		const isPending = share.status?.includes('pending');

		if (isPending) {
			try {
				await this.confirmDeny(share);
			} catch (err) {
				return;
			}
		} else {
			try {
				await this.confirmRemove(share);
			} catch (err) {
				share.accessRole = this.originalRoles.get(share.shareId);
				return;
			}
		}

		try {
			share.isPendingAction = true;
			await this.api.share.remove(share);
			remove(this.shares, share);
			remove(this.pendingShares, share);
			this.shares = sortShareVOs(this.shares);
		} catch (err) {
			share.isPendingAction = false;
			if (err instanceof ShareResponse) {
				this.messageService.showError({
					message: err.getMessage(),
					translate: true,
				});
			}
		}
	}

	getExpirationFromExpirationTimestamp(expirationTimestamp: Date): Expiration {
		return this.shareLinkMapping.getExpirationFromExpirationTimestamp(
			expirationTimestamp,
			this.newShareLink.createdAt,
		);
	}

	getExpiresDTFromExpiration(expiration: Expiration): string | null {
		return this.shareLinkMapping.getExpiresDTFromExpiration(
			expiration,
			this.newShareLink.createdAt,
		);
	}

	setShareLinkFormValue(): void {
		if (this.newShareLink) {
			if (this.newShareLink.accessRestrictions === 'none') {
				this.linkType = 'public';
				this.autoApproveToggle = 1;
			} else if (this.newShareLink.accessRestrictions === 'account') {
				this.linkType = 'private';
				this.autoApproveToggle = 1;
			} else if (this.newShareLink.accessRestrictions === 'approval') {
				this.linkType = 'private';
				this.autoApproveToggle = 0;
			}
			this.linkDefaultAccessRole = this.permissionsLevelToAccessRole(
				this.newShareLink.permissionsLevel,
			);
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
			this.expiration = this.getExpirationFromExpirationTimestamp(
				this.newShareLink.expirationTimestamp,
			);
		} else {
			this.autoApproveToggle = 1;
			this.expiration = Expiration.Never;
			this.expirationOptions = EXPIRATION_OPTIONS;
			this.linkType = 'public';
		}
	}

	async generateShareLink() {
		this.updatingLink = true;
		try {
			let itemId = '';
			let itemType: 'record' | 'folder' = 'record';
			if (this.isRecord(this.shareItem)) {
				itemId = this.shareItem.recordId.toString();
			} else {
				itemId = this.shareItem.folderId.toString();
				itemType = 'folder';
			}
			const response = await this.shareApi.generateShareLink({
				itemId,
				itemType,
			});
			this.newShareLink = response;
			await this.shareApi.updateShareLink(this.newShareLink.id, {
				accessRestrictions: 'none',
			});
			this.shareUrl = this.baseUrl + this.newShareLink.token;
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
		const { promise, resolve } = Promise.withResolvers();
		try {
			await this.promptService.confirm(
				'Remove link',
				'Are you sure you want to remove this link?',
				promise,
				'btn-danger',
			);

			await this.shareApi.deleteShareLink(this.newShareLink.id);
			this.newShareLink = null;
			this.setShareLinkFormValue();
			resolve(undefined);
			this.showLinkSettings = false;
		} catch (response) {
			resolve(undefined);
			if (response instanceof ShareResponse) {
				this.messageService.showError({ message: response.getMessage() });
			}
		}
	}

	async onShareLinkPropChange(propName: ShareByUrlProps, value: any) {
		this.updatingLink = true;
		let update: Partial<ShareLink> = {};

		try {
			if (propName === 'accessRestrictions') {
				value = this.calculateAccessRestrictions(value, this.autoApproveToggle);
				update = { accessRestrictions: value, permissionsLevel: 'viewer' };
			} else if (propName === 'autoApproveToggle') {
				propName = 'accessRestrictions';
				value = this.calculateAccessRestrictions(this.linkType, value);
				update = { accessRestrictions: value };
			}
			if (propName === 'expiresDT') {
				update = { expirationTimestamp: value };
			}
			if (propName === 'defaultAccessRole') {
				value = this.accessRoleToPermissionsLevel(value);
				update = { permissionsLevel: value };
			}
			this.newShareLink = await this.shareApi.updateShareLink(
				this.newShareLink.id,
				update,
			);
			this.setShareLinkFormValue();
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
